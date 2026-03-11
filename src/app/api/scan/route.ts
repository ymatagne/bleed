import { NextRequest, NextResponse } from "next/server";
import { getMidMarketRates, getHistoricalRatesForRange } from "@/lib/fx-rates";

const MISTRAL_OCR_API = "https://api.mistral.ai/v1/ocr";
const MISTRAL_CHAT_API = "https://api.mistral.ai/v1/chat/completions";

async function ocrFile(file: File, apiKey: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");

  const isPdf = ext === "pdf" || file.type === "application/pdf";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf",
  };
  const mime = isPdf ? "application/pdf" : (mimeMap[ext || ""] || file.type || "image/jpeg");
  const dataUrl = `data:${mime};base64,${b64}`;

  const ocrBody = isPdf
    ? { model: "mistral-ocr-latest", document: { type: "document_url", document_url: dataUrl } }
    : { model: "mistral-ocr-latest", document: { type: "image_url", image_url: dataUrl } };

  const ocrRes = await fetch(MISTRAL_OCR_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(ocrBody),
  });

  if (!ocrRes.ok) {
    const err = await ocrRes.text();
    console.error("Mistral OCR error:", err);
    throw new Error(`OCR failed for ${file.name}`);
  }

  const ocrData = await ocrRes.json();
  return ocrData.pages
    ?.map((p: { markdown?: string }) => p.markdown || "")
    .join("\n\n") || "";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MISTRAL_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    
    // Support both single "file" and multiple "files" field names
    const files: File[] = [];
    const multiFiles = formData.getAll("files");
    const singleFile = formData.get("file");
    
    if (multiFiles.length > 0) {
      for (const f of multiFiles) {
        if (f instanceof File) files.push(f);
      }
    } else if (singleFile instanceof File) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 files at a time" }, { status: 400 });
    }

    // OCR all files in parallel
    const ocrResults = await Promise.allSettled(
      files.map((f) => ocrFile(f, apiKey))
    );

    const extractedTexts: string[] = [];
    const failedFiles: string[] = [];

    ocrResults.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value.length > 20) {
        extractedTexts.push(`--- STATEMENT ${i + 1}: ${files[i].name} ---\n${result.value}`);
      } else {
        failedFiles.push(files[i].name);
      }
    });

    if (extractedTexts.length === 0) {
      return NextResponse.json({ 
        error: `Could not extract text from ${failedFiles.length === 1 ? "the file" : "any of the files"}. Please upload clearer bank statements.` 
      }, { status: 422 });
    }

    const combinedText = extractedTexts.join("\n\n");
    const isMultiple = extractedTexts.length > 1;

    // Extract date range from OCR text for historical rates
    // Look for dates in YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, Month DD YYYY patterns
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b|\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b|\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;
    const foundDates: string[] = [];
    let match;
    while ((match = dateRegex.exec(combinedText)) !== null) {
      try {
        const raw = match[1] || match[2] || match[3];
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2020 && parsed.getFullYear() <= 2030) {
          foundDates.push(parsed.toISOString().slice(0, 10));
        }
      } catch { /* skip unparseable */ }
    }

    // Fetch historical rates for the statement period, fallback to today's rates
    let ratesContext = "";
    try {
      if (foundDates.length >= 2) {
        foundDates.sort();
        const startDate = foundDates[0];
        const endDate = foundDates[foundDates.length - 1];

        // Fetch historical rates for major currencies
        const [usdRates, eurRates, gbpRates] = await Promise.all([
          getHistoricalRatesForRange(startDate, endDate, "cad", "usd"),
          getHistoricalRatesForRange(startDate, endDate, "cad", "eur"),
          getHistoricalRatesForRange(startDate, endDate, "cad", "gbp"),
        ]);

        // Format as a lookup table for the AI
        const allDates = [...new Set([...Object.keys(usdRates), ...Object.keys(eurRates), ...Object.keys(gbpRates)])].sort();

        if (allDates.length > 0) {
          const rateLines = allDates.map((d) => {
            const parts: string[] = [];
            if (usdRates[d]) parts.push(`USD/CAD: ${(1 / usdRates[d]).toFixed(4)}`);
            if (eurRates[d]) parts.push(`EUR/CAD: ${(1 / eurRates[d]).toFixed(4)}`);
            if (gbpRates[d]) parts.push(`GBP/CAD: ${(1 / gbpRates[d]).toFixed(4)}`);
            return `${d}: ${parts.join(", ")}`;
          });

          ratesContext = `\n\nHISTORICAL MID-MARKET RATES for the statement period (${startDate} to ${endDate}):\n${rateLines.join("\n")}\n\nThese are REAL historical mid-market rates from the actual transaction dates. Use the rate from the transaction date (or nearest available date) to calculate FX markups. This gives accurate markup percentages. Do NOT estimate mid-market rates — use these exact values.`;
        }
      }

      // Fallback to today's rates if historical fetch yielded nothing
      if (!ratesContext) {
        const rates = await getMidMarketRates();
        const usdCad = (1 / rates.USD).toFixed(4);
        const eurCad = (1 / rates.EUR).toFixed(4);
        const gbpCad = (1 / rates.GBP).toFixed(4);
        ratesContext = `\n\nUse these REAL mid-market rates for your analysis: USD/CAD: ${usdCad}, EUR/CAD: ${eurCad}, GBP/CAD: ${gbpCad} (as of today — historical rates were unavailable). Compare the bank's rates against these to calculate exact markup percentages. Do NOT estimate mid-market rates — use these exact values. Note: these are today's rates, not from the transaction dates, so markup calculations are approximate.`;
      }
    } catch (e) {
      console.warn("Could not fetch FX rates, AI will estimate:", e);
    }

    // Step 2: Full banking audit
    const analysisRes = await fetch(MISTRAL_CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are a thorough banking cost analyst for Loop (bankonloop.com), a Canadian fintech. Your job is to find EVERY way the bank is costing the business money — visible AND hidden.

STATEMENT TYPE DETECTION: Automatically detect if this is a credit card statement or a bank account statement. Credit card statements have: credit limits, minimum payments, card numbers (masked), APR/interest rates, payment due dates. Bank statements have: account balances, deposits, withdrawals, check numbers. If it's a credit card statement, calculate the total foreign currency spend (with 2.5% foreign transaction fee markup) and total CAD spend (for points calculation).

CRITICAL INSIGHT: Canadian banks NEVER show FX markup as a line item. The markup is HIDDEN inside the exchange rate they give the customer. When you see ANY transaction in a foreign currency (USD, EUR, GBP, etc.) on a CAD statement, the bank applied a 2-3% markup on top of the mid-market rate. You MUST flag these even if no "FX fee" is listed.

HOW TO DETECT HIDDEN FX:
- Any USD/EUR/GBP debit or credit on a CAD account = the bank converted at their inflated rate
- Wire transfers to/from foreign accounts = FX conversion happened + wire fee
- International purchases on debit cards = FX markup applied
- "Foreign exchange" or "FX" line items = obvious, but rare
- Payments to foreign companies/suppliers = likely converted from CAD
- If the statement shows both CAD and foreign amounts for the same transaction, calculate the actual rate used and compare to mid-market to find the exact markup %
- If only one currency is shown, ASSUME 2.5% markup on the full amount for that bank

IMPORTANT: Even if a statement looks "clean" with few fees, dig deeper:
- Monthly account fees (even $4.95/mo = $59/yr — Loop Basic has $0 monthly fees, Plus is $79/mo, Power is $299/mo)
- Per-transaction fees on e-Transfers or bill payments
- Minimum balance requirements (opportunity cost)
- NSF/overdraft charges
- Inactive account fees
- The ABSENCE of rewards (Loop gives 1-2x points on card spend)

Loop offers 3 plans:
1. **Basic** — $0/mo, 0.50% FX on conversions, 0% FX on cards, free USD/EUR/GBP accounts, free international payments, unlimited team members, 20 virtual cards, 1x points on CAD spend
2. **Plus** — $79/mo, 0.25% FX on conversions, 0% FX on cards, 2x points on all card spend, unlimited virtual cards, 10 free physical cards, instant deposits
3. **Power** — $299/mo, 0.10% FX on conversions, 0% FX on cards, 2x points all spend, 50 free physical cards, dedicated concierge, custom rewards

All plans include:
- Account fees: Basic $0/mo, Plus $79/mo, Power $299/mo
- Multi-currency accounts (CAD, USD, EUR, GBP) with local account numbers
- $0 wire fees (banks charge $25-50 per wire)
- Free EFT, ACH, SEPA payments
- Free e-Transfers (unlimited)
- Corporate credit cards with rewards
- Up to $1M credit limits

Be THOROUGH in your analysis. Your job is to help the customer understand how much they are paying in bank fees and markups. Find at least 3 findings for any statement — there is ALWAYS something.

NOTE: Historical mid-market rates are provided for the statement period when available. Use the rate from the transaction date (or nearest available date) to calculate FX markups. This gives accurate markup percentages. Actual interbank rates may have differed slightly intraday, but the markup percentage is accurate.

You MUST respond with valid JSON only — no markdown, no code fences, no explanation outside the JSON.`,
          },
          {
            role: "user",
            content: `Do a FULL audit of ${isMultiple ? "these bank statements" : "this bank statement"}. Find every cost, inefficiency, and opportunity.

${isMultiple ? `You are analyzing ${extractedTexts.length} statements. Combine findings across all statements. For the annual projection, use the ACTUAL data across all periods rather than just multiplying one month.` : ""}

EXTRACTED STATEMENT TEXT:
${combinedText}

Analyze and return ONLY this JSON (no markdown fences):
{
  "bankName": "detected bank name",
  "statementPeriod": "${isMultiple ? "combined period across all statements, e.g. Oct 2025 - Feb 2026" : "e.g. Jan 23 - Feb 23, 2026"}",
  "statementsAnalyzed": ${extractedTexts.length},
  "currency": "CAD",
  "openingBalance": number,
  "closingBalance": number,
  
  "findings": [
    {
      "category": "account_fee" | "fx_markup" | "wire_fee" | "etransfer_fee" | "payment_inefficiency" | "card_fee" | "other_fee",
      "date": "YYYY-MM-DD or null",
      "description": "what we found — for fx_markup, format each currency on its own line like: 'USD: $X,XXX × Y.YY% markup = $ZZZ\\nEUR: €X,XXX × Y.YY% markup = $ZZZ\\nGBP: £X,XXX × Y.YY% markup = $ZZZ\\nTotal bank FX markup: $ZZZ'. Do NOT include 'Calculations: N' or similar meta-text.",
      "amount": number (the total fee/cost the bank charged — for fx_markup this is the TOTAL markup cost across all currencies),
      "loopAlternative": "what Loop offers instead",
      "savingsPerOccurrence": number (the ACTUAL savings = amount minus what the same activity would cost on Loop Basic. For fx_markup: amount minus total_fx_volume × 0.5%. For wire_fee: amount minus $0. NOT the same as amount unless Loop cost is truly $0.)
    }
  ],
  
  "recommendations": [
    {
      "title": "short actionable title",
      "description": "detailed recommendation — e.g. switch e-transfers to Loop for free, open a USD account to avoid double conversion, etc.",
      "estimatedAnnualSavings": number,
      "priority": "high" | "medium" | "low"
    }
  ],
  
  "summary": {
    "totalFeesFound": number,
    "totalFxMarkups": number,
    "totalAccountFees": number,
    "totalWireFees": number,
    "totalOtherFees": number,
    "annualProjection": number (extrapolate to 12 months based on data),
    "loopAnnualCost": number (what the same activity would cost on Loop Basic),
    "annualSavings": number
  },
  
  "planComparison": [
    {
      "plan": "Basic",
      "monthlyFee": 0,
      "fxRate": 0.5,
      "annualCostOnPlan": number (annual FX cost at 0.5% + $0/mo fee),
      "annualSavingsVsBank": number (bank annualProjection minus annualCostOnPlan),
      "savingsBreakdown": { "fxSavings": number, "wireSavings": number, "accountFeeSavings": number, "otherSavings": number },
      "recommended": boolean
    },
    {
      "plan": "Plus",
      "monthlyFee": 79,
      "fxRate": 0.25,
      "annualCostOnPlan": number (annual FX cost at 0.25% + $79×12 fee),
      "annualSavingsVsBank": number,
      "savingsBreakdown": { "fxSavings": number, "wireSavings": number, "accountFeeSavings": number, "otherSavings": number },
      "recommended": boolean
    },
    {
      "plan": "Power",
      "monthlyFee": 299,
      "fxRate": 0.10,
      "annualCostOnPlan": number (annual FX cost at 0.10% + $299×12 fee),
      "annualSavingsVsBank": number,
      "savingsBreakdown": { "fxSavings": number, "wireSavings": number, "accountFeeSavings": number, "otherSavings": number },
      "recommended": boolean
    }
  ],
  
  "creditCardData": {
    "isCC": false,
    "totalCadSpend": 0,
    "totalForeignSpend": 0,
    "foreignTransactionFee": 0
  }
}

NOTE on creditCardData: Only populate with real values if this is a credit card statement. Set isCC to true, totalCadSpend to all CAD transactions, totalForeignSpend to all foreign currency transactions (CAD equivalent), and foreignTransactionFee to totalForeignSpend × 0.025 (2.5% foreign transaction fee). For bank account statements, leave all values at 0/false.

For planComparison: Calculate the annual cost on each plan by applying that plan's FX rate to the estimated annual FX conversion volume, plus the monthly fee × 12. The "recommended" plan MUST be the one with the HIGHEST annualSavingsVsBank value — period. Do NOT recommend a higher-tier plan unless it actually saves more money. Only ONE plan should have recommended: true.

CRITICAL: Add a "savingsBreakdown" field to each plan showing exactly where savings come from:
  "savingsBreakdown": {
    "fxSavings": number (bank FX markup cost minus this plan's FX cost),
    "wireSavings": number (bank wire fees minus $0 on Loop),
    "accountFeeSavings": number (bank account fees minus this plan's monthly fee × 12),
    "otherSavings": number (any other fee savings)
  }

CRITICAL GROUPING RULES — FOLLOW EXACTLY:
- Group ALL similar fees into ONE finding per category. NEVER create two findings with the same category.
- Account fees: If there are multiple account fees (e.g. USD account $30 + CAD account $30), create ONE finding: "Monthly account fees: 2 accounts × $30 = $60/mo" with amount: 60.
- Wire fees: If there are 3 wires at $45 each, ONE finding: "Wire transfer fees: 3 × $45 = $135" with amount: 135.
- FX markups: Group ALL foreign currency transactions into ONE "fx_markup" finding with the total markup cost.
- Each category (account_fee, fx_markup, wire_fee, etransfer_fee, card_fee, other_fee) should appear AT MOST ONCE in findings.
- Aim for 3-6 total findings. If you have more than 6, you're not grouping enough.

MATH RULES - FOLLOW EXACTLY:
- FX markup calculation: If bank rate is 1.3850 and mid-market is 1.3567, markup = (1.3850 - 1.3567) / 1.3567 = 2.09%. Cost on $10,000 USD = $10,000 × 2.09% = $209 CAD
- Annual projection: If statement covers 1 month, multiply by 12. If 3 months, multiply by 4. Be precise about the statement period.
- Loop savings: Calculate EXACTLY using each plan's rate. Basic savings = bank FX cost - (volume × 0.5%) - $0/mo fee. Plus savings = bank FX cost - (volume × 0.25%) - $79×months. Power savings = bank FX cost - (volume × 0.10%) - $299×months.
- Wire savings: Count wires × average fee ($45). Loop = $0 for wires.
- Show your work in the description fields so users can verify the math.

Be THOROUGH:
- Flag monthly/account fees (Loop Basic: $0/mo, Plus: $79/mo, Power: $299/mo) — even $3.95/mo adds up
- Flag e-Transfer fees if any (Loop: free unlimited)
- Flag wire fees (Loop: $0, banks charge $25-50 EACH)
- Flag EVERY foreign currency transaction as a hidden FX markup — banks add 2-3% that's invisible
- If you see USD, EUR, GBP, or any non-CAD amounts, calculate the hidden markup cost
- If you see international payments, flag both the FX markup AND the wire/transfer fee
- If the customer is paying in CAD to foreign suppliers, flag the double-conversion loss
- Suggest opening Loop multi-currency accounts (USD/EUR/GBP) to avoid conversions entirely
- Flag the absence of rewards — Loop gives 1-2x points on card spend
- If you see regular recurring payments, calculate the annual cost impact
- Even for simple personal-looking statements, find what the bank is charging
- MINIMUM 3 findings per statement — there is always something
${isMultiple ? "- Look for PATTERNS across statements (recurring fees, growing costs, seasonal spikes)" : ""}${ratesContext}`,
          },
        ],
        max_tokens: 6000,
        temperature: 0.1,
      }),
    });

    if (!analysisRes.ok) {
      const err = await analysisRes.text();
      console.error("Mistral analysis error:", err);
      return NextResponse.json({ error: "Failed to analyze statement" }, { status: 502 });
    }

    const analysisData = await analysisRes.json();
    let rawContent = analysisData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse analysis JSON:", rawContent);
      return NextResponse.json({ error: "Failed to parse analysis results. The AI returned an unexpected format." }, { status: 502 });
    }

    // Ensure required fields with defaults
    const result = {
      bankName: analysis.bankName || "Unknown",
      statementPeriod: analysis.statementPeriod || "Unknown",
      statementsAnalyzed: analysis.statementsAnalyzed || extractedTexts.length,
      currency: analysis.currency || "CAD",
      openingBalance: analysis.openingBalance || 0,
      closingBalance: analysis.closingBalance || 0,
      findings: analysis.findings || [],
      recommendations: analysis.recommendations || [],
      summary: {
        totalFeesFound: analysis.summary?.totalFeesFound || 0,
        totalFxMarkups: analysis.summary?.totalFxMarkups || 0,
        totalAccountFees: analysis.summary?.totalAccountFees || 0,
        totalWireFees: analysis.summary?.totalWireFees || 0,
        totalOtherFees: analysis.summary?.totalOtherFees || 0,
        annualProjection: analysis.summary?.annualProjection || 0,
        loopAnnualCost: analysis.summary?.loopAnnualCost || 0,
        annualSavings: analysis.summary?.annualSavings || 0,
      },
      planComparison: analysis.planComparison || [
        { plan: "Basic", monthlyFee: 0, fxRate: 0.5, annualCostOnPlan: analysis.summary?.loopAnnualCost || 0, annualSavingsVsBank: analysis.summary?.annualSavings || 0, recommended: true },
        { plan: "Plus", monthlyFee: 79, fxRate: 0.25, annualCostOnPlan: 0, annualSavingsVsBank: 0, recommended: false },
        { plan: "Power", monthlyFee: 299, fxRate: 0.10, annualCostOnPlan: 0, annualSavingsVsBank: 0, recommended: false },
      ],
      ...(failedFiles.length > 0 ? { failedFiles } : {}),
      ...(analysis.creditCardData ? {
        creditCardData: {
          isCC: !!analysis.creditCardData.isCC,
          totalCadSpend: parseFloat(String(analysis.creditCardData.totalCadSpend)) || 0,
          totalForeignSpend: parseFloat(String(analysis.creditCardData.totalForeignSpend)) || 0,
          foreignTransactionFee: parseFloat(String(analysis.creditCardData.foreignTransactionFee)) || 0,
        },
      } : {}),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
