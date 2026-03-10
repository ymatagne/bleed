interface RatesCache {
  rates: Record<string, number>;
  timestamp: number;
}

let cache: RatesCache | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Historical rates cache — keyed by "YYYY-MM-DD:base", immutable so never expires
const historicalCache = new Map<string, Record<string, number>>();

const APIS = [
  "https://open.er-api.com/v6/latest/CAD",
  "https://api.exchangerate-api.com/v4/latest/CAD",
];

/** Full CurrencyCloud payout currencies (excluding CAD since that's the source) */
export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "NZD",
  "MXN",
  "CHF", "DKK", "SEK", "NOK", "PLN", "CZK", "HUF", "RON", "BGN", "HRK", "TRY",
  "JPY", "CNY", "HKD", "SGD", "INR", "IDR", "MYR", "PHP", "THB",
  "AED", "BHD", "KWD", "OMR", "QAR", "SAR", "ILS",
  "KES", "UGX", "ZAR",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

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
 * Fetch historical mid-market rate for a specific date from jsDelivr CDN.
 * Returns the rate as "1 unit of `from` = X units of `to`".
 */
export async function getHistoricalRate(
  date: string,
  from: string,
  to: string,
): Promise<number> {
  const base = from.toLowerCase();
  const target = to.toLowerCase();
  const cacheKey = `${date}:${base}`;

  let rates = historicalCache.get(cacheKey);
  if (!rates) {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${base}.json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Historical rate fetch failed for ${date}/${base}: ${res.status}`);
    const data = await res.json();
    rates = data[base] as Record<string, number>;
    if (!rates) throw new Error(`No rates found for ${base} on ${date}`);
    historicalCache.set(cacheKey, rates);
  }

  const rate = rates[target];
  if (rate === undefined) throw new Error(`No ${target} rate for ${base} on ${date}`);
  return rate;
}

/**
 * Fetch historical rates for a date range (inclusive).
 * Returns a map of date → rate (from→to).
 * Skips dates that fail and returns what it can.
 */
export async function getHistoricalRatesForRange(
  startDate: string,
  endDate: string,
  from: string,
  to: string,
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Safety: cap at 90 days
  const maxDays = 90;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const days = Math.min(Math.max(diffDays, 0), maxDays);

  const fetches: Promise<void>[] = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    fetches.push(
      getHistoricalRate(dateStr, from, to)
        .then((rate) => { results[dateStr] = rate; })
        .catch(() => { /* skip failed dates */ })
    );
  }

  await Promise.all(fetches);
  return results;
}

/**
 * Calculate the % markup a bank charges over mid-market.
 * Both rates should be in the same direction (e.g. units of foreign per 1 CAD).
 * Returns a positive number like 2.5 for a 2.5% markup.
 */
export function getMarkup(bankRate: number, midMarket: number): number {
  return Math.abs((bankRate - midMarket) / midMarket) * 100;
}
