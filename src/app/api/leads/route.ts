import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, bankName, totalFees, annualProjection } = body;

    console.log("🔔 NEW LEAD:", {
      name,
      email,
      company,
      bankName,
      totalFees,
      annualProjection,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
