import { NextResponse } from "next/server";
import { getMidMarketRates } from "@/lib/fx-rates";

export async function GET() {
  try {
    const rates = await getMidMarketRates();
    return NextResponse.json({
      base: "CAD",
      rates: {
        USD: rates.USD,
        EUR: rates.EUR,
        GBP: rates.GBP,
        MXN: rates.MXN,
        INR: rates.INR,
        JPY: rates.JPY,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
  }
}
