import { NextResponse } from "next/server";
import { getMidMarketRates, SUPPORTED_CURRENCIES } from "@/lib/fx-rates";

export async function GET() {
  try {
    const allRates = await getMidMarketRates();
    const rates: Record<string, number> = {};
    for (const c of SUPPORTED_CURRENCIES) {
      if (allRates[c] != null) rates[c] = allRates[c];
    }
    return NextResponse.json({
      base: "CAD",
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
  }
}
