import { NextRequest, NextResponse } from "next/server";

const MISTRAL_OCR_API = "https://api.mistral.ai/v1/ocr";
const MISTRAL_CHAT_API = "https://api.mistral.ai/v1/chat/completions";

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MISTRAL_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString("base64");

    // Determine MIME and OCR document type — check both extension and file.type
    const isPdf = ext === "pdf" || file.type === "application/pdf";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf",
    };
    const mime = isPdf ? "application/pdf" : (mimeMap[ext || ""] || file.type || "image/jpeg");
    const dataUrl = `data:${mime};base64,${b64}`;

    // Step 1: OCR via Mistral Document AI endpoint (supports PDF + images)
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
      return NextResponse.json({ error: "Failed to process document with OCR" }, { status: 502 });
    }

    const ocrData = await ocrRes.json();
    // Mistral OCR returns pages[] with markdown content
    const extractedText = ocrData.pages
      ?.map((p: { markdown?: string }) => p.markdown || "")
      .join("\n\n") || "";

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "Could not extract meaningful text from the image. Please upload a clearer bank statement." }, { status: 422 });
    }

    // Step 2: Analyze the extracted text for FX fees
    const analysisRes = await fetch(MISTRAL_CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are an FX fee analyst. Analyze bank statements to find hidden foreign exchange fees and markups. You MUST respond with valid JSON only — no markdown, no code fences, no explanation outside the JSON.`,
          },
          {
            role: "user",
            content: `Analyze this bank statement text and identify all international/FX transactions, markups, and fees.

EXTRACTED STATEMENT TEXT:
${extractedText}

Return ONLY this JSON structure (no markdown fences):
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number (CAD),
      "bankRate": number (the rate the bank used, or best estimate),
      "midMarket": number (estimated mid-market rate at that date),
      "markup": number (percentage markup over mid-market),
      "fee": number (dollar amount of the hidden markup)
    }
  ],
  "wireFees": number (total wire transfer fees found),
  "totalFees": number (sum of all hidden fees + wire fees),
  "avgMarkup": number (average markup percentage across transactions),
  "annualProjection": number (totalFees * 12 if monthly statement, or extrapolate),
  "loopSavings": number (annualProjection minus what Loop would charge at 0.3% avg markup and $0 wire fees),
  "statementPeriod": "string describing the period",
  "currency": "CAD or detected base currency",
  "bankName": "detected bank name or Unknown"
}

If you cannot identify specific FX transactions, still estimate based on any international transfers, foreign currency amounts, or conversion fees visible. For mid-market rates, use your best knowledge of rates around the transaction dates. If dates are ambiguous, use reasonable estimates.`,
          },
        ],
        max_tokens: 4000,
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
      transactions: analysis.transactions || [],
      wireFees: analysis.wireFees || 0,
      totalFees: analysis.totalFees || 0,
      avgMarkup: analysis.avgMarkup || 0,
      annualProjection: analysis.annualProjection || 0,
      loopSavings: analysis.loopSavings || 0,
      statementPeriod: analysis.statementPeriod || "Unknown",
      currency: analysis.currency || "CAD",
      bankName: analysis.bankName || "Unknown",
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
