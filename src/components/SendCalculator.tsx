"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Currency = "USD" | "EUR" | "GBP";

interface Provider {
  name: string;
  markup: number;
  wireFee: number;
  isLoop?: boolean;
  planNote?: string;
}

const BANKS: Provider[] = [
  { name: "RBC", markup: 0.025, wireFee: 45 },
  { name: "TD", markup: 0.026, wireFee: 40 },
  { name: "BMO", markup: 0.024, wireFee: 50 },
  { name: "Scotiabank", markup: 0.025, wireFee: 45 },
  { name: "CIBC", markup: 0.027, wireFee: 45 },
  { name: "National Bank", markup: 0.023, wireFee: 40 },
];

const LOOP_PLANS: Provider[] = [
  { name: "Loop Basic", markup: 0.005, wireFee: 0, isLoop: true, planNote: "Free" },
  { name: "Loop Plus", markup: 0.0025, wireFee: 0, isLoop: true, planNote: "$79/mo" },
  { name: "Loop Power", markup: 0.001, wireFee: 0, isLoop: true, planNote: "$299/mo" },
];

const ALL_PROVIDERS = [...BANKS, ...LOOP_PLANS];

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" };

function formatNum(n: number, decimals = 2) {
  return n.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

interface Result {
  provider: Provider;
  fxRate: number;
  markupCost: number;
  wireFee: number;
  totalCost: number;
  recipientGets: number;
}

function calculate(amount: number, midRate: number, provider: Provider): Result {
  const fxRate = midRate * (1 + provider.markup);
  const recipientGets = (amount - provider.wireFee) / fxRate;
  const idealRecipient = amount / midRate;
  const totalCost = (idealRecipient - recipientGets) * midRate;
  return {
    provider,
    fxRate,
    markupCost: amount * provider.markup,
    wireFee: provider.wireFee,
    totalCost: provider.wireFee + amount * provider.markup,
    recipientGets,
  };
}

export default function SendCalculator() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10000");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for external open trigger (from Nav)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-send-calculator", handler);
    return () => window.removeEventListener("open-send-calculator", handler);
  }, []);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      setRates(data.rates);
    } catch {
      // fallback rates
      setRates({ USD: 0.7350, EUR: 0.6800, GBP: 0.5850 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !rates) fetchRates();
  }, [open, rates, fetchRates]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const midRate = rates ? 1 / rates[currency] : 0; // rates are CAD→foreign, we need CAD per foreign

  const results: Result[] = rates && numAmount > 0
    ? ALL_PROVIDERS.map((p) => calculate(numAmount, midRate, p)).sort((a, b) => b.recipientGets - a.recipientGets)
    : [];

  const bestResult = results[0];
  const worstBank = results.find((r) => !r.provider.isLoop);
  const bestLoop = results.find((r) => r.provider.isLoop);
  const savings = bestLoop && worstBank ? bestLoop.recipientGets - worstBank.recipientGets : 0;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#004639] hover:bg-[#01251e] text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold group"
      >
        <span className="text-lg">💸</span>
        <span className="hidden sm:inline">Quick Calculate</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col sm:w-full sm:max-w-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-[#01251e]">Send Money Calculator</h2>
                  <p className="text-xs text-gray-500">Compare banks vs Loop — real mid-market rates</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>

              {/* Inputs */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">You send (CAD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-lg font-semibold text-[#01251e] focus:outline-none focus:ring-2 focus:ring-[#004639]/30 focus:border-[#004639]"
                        placeholder="10,000"
                      />
                    </div>
                  </div>
                  <div className="w-28">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">They get</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-lg font-semibold text-[#01251e] focus:outline-none focus:ring-2 focus:ring-[#004639]/30 focus:border-[#004639] bg-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                {rates && (
                  <p className="text-xs text-gray-400 mt-2">Mid-market rate: 1 CAD = {rates[currency].toFixed(4)} {currency}</p>
                )}
              </div>

              {/* Results */}
              <div className="flex-1 overflow-auto px-6 py-4">
                {loading ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="animate-spin w-6 h-6 border-2 border-[#004639] border-t-transparent rounded-full mx-auto mb-2" />
                    Fetching live rates…
                  </div>
                ) : numAmount <= 0 ? (
                  <div className="text-center py-12 text-gray-400">Enter an amount to compare</div>
                ) : results.length > 0 ? (
                  <>
                    {/* Savings banner */}
                    {savings > 0 && bestLoop && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-[#C4F6C6]/40 border border-[#C4F6C6] text-center"
                      >
                        <span className="text-sm font-semibold text-[#004639]">
                          Your recipient gets{" "}
                          <span className="text-lg font-bold">{CURRENCY_SYMBOLS[currency]}{formatNum(savings)}</span>{" "}
                          MORE with {bestLoop.provider.name}
                        </span>
                      </motion.div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-sm min-w-[580px]">
                        <thead>
                          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                            <th className="pb-2 font-medium">Provider</th>
                            <th className="pb-2 font-medium text-right">FX Rate</th>
                            <th className="pb-2 font-medium text-right">Markup</th>
                            <th className="pb-2 font-medium text-right">Wire Fee</th>
                            <th className="pb-2 font-medium text-right">Total Cost</th>
                            <th className="pb-2 font-medium text-right">Recipient Gets</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => {
                            const isBest = r === bestResult;
                            const isLoop = r.provider.isLoop;
                            return (
                              <motion.tr
                                key={r.provider.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={`border-b border-gray-50 ${isLoop ? "bg-[#C4F6C6]/15" : "bg-gray-50/50"}`}
                              >
                                <td className="py-2.5 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${isLoop ? "text-[#004639]" : "text-gray-700"}`}>
                                      {r.provider.name}
                                    </span>
                                    {isBest && (
                                      <span className="text-[10px] font-bold bg-[#004639] text-white px-1.5 py-0.5 rounded-full">
                                        BEST
                                      </span>
                                    )}
                                    {r.provider.planNote && (
                                      <span className="text-[10px] text-gray-400">{r.provider.planNote}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 text-right text-gray-600 tabular-nums">{r.fxRate.toFixed(4)}</td>
                                <td className="py-2.5 text-right text-gray-600">{(r.provider.markup * 100).toFixed(2)}%</td>
                                <td className="py-2.5 text-right text-gray-600">${r.wireFee}</td>
                                <td className="py-2.5 text-right font-medium text-gray-700">${formatNum(r.totalCost)}</td>
                                <td className={`py-2.5 text-right font-bold tabular-nums ${isLoop ? "text-[#004639]" : "text-gray-800"}`}>
                                  {CURRENCY_SYMBOLS[currency]}{formatNum(r.recipientGets)}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* CTA */}
                    <div className="mt-5 text-center">
                      <a
                        href="https://bankonloop.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#004639] hover:bg-[#01251e] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                      >
                        Send with Loop →
                      </a>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Expose a trigger button for Nav */
export function CalcTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3 py-1.5 border border-[#004639]/20 text-[#004639] rounded-lg hover:bg-[#C4F6C6]/30 transition-colors hidden sm:block"
    >
      💸 Calculate
    </button>
  );
}
