interface RatesCache {
  rates: Record<string, number>;
  timestamp: number;
}

let cache: RatesCache | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const APIS = [
  "https://open.er-api.com/v6/latest/CAD",
  "https://api.exchangerate-api.com/v4/latest/CAD",
];

async function fetchRates(): Promise<Record<string, number>> {
  for (const url of APIS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      return data.rates as Record<string, number>;
    } catch {
      continue;
    }
  }
  throw new Error("Failed to fetch FX rates from all sources");
}

export async function getMidMarketRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.rates;
  }
  const rates = await fetchRates();
  cache = { rates, timestamp: Date.now() };
  return rates;
}

/**
 * Calculate the % markup a bank charges over mid-market.
 * Both rates should be in the same direction (e.g. units of foreign per 1 CAD).
 * Returns a positive number like 2.5 for a 2.5% markup.
 */
export function getMarkup(bankRate: number, midMarket: number): number {
  return Math.abs((bankRate - midMarket) / midMarket) * 100;
}
