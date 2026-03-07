import { NextRequest, NextResponse } from "next/server";

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

    // Step 2: Full banking audit
    const analysisRes = await fetch(MISTRAL_CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are a banking cost analyst for Loop (bankonloop.com), a Canadian fintech. You audit bank statements to find EVERY way the bank is costing the business money — not just FX fees.

Loop offers:
- $0 account fees (no monthly fees ever)
- Multi-currency accounts (CAD, USD, EUR, GBP) with local account numbers
- 0% FX on card spend, 0.1-0.5% on conversions (banks charge 2.5-5.7%)
- $0 wire fees (banks charge $25-50 per wire)
- Free EFT, ACH, SEPA payments
- Free e-Transfers (unlimited)
- Corporate credit cards with rewards
- Up to $1M credit limits

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
      "description": "what we found",
      "amount": number (the fee or cost),
      "loopAlternative": "what Loop offers instead",
      "savingsPerOccurrence": number
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
    "loopAnnualCost": number (what the same activity would cost on Loop),
    "annualSavings": number
  }
}

Be thorough:
- Flag monthly/account fees (Loop charges $0)
- Flag e-Transfer fees if any (Loop: free unlimited)
- Flag wire fees (Loop: $0)
- Flag any FX conversions and estimate the markup vs mid-market
- If you see domestic payments that could be faster/cheaper, recommend alternatives
- If you see patterns (e.g. regular USD payments) suggest opening a Loop USD account
- Even for simple statements, find what the bank is charging and what Loop would save
${isMultiple ? "- Look for PATTERNS across statements (recurring fees, growing costs, seasonal spikes)" : ""}`,
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
      ...(failedFiles.length > 0 ? { failedFiles } : {}),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
