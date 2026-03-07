"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Upload, FileText, Calculator, AlertTriangle, TrendingDown, DollarSign, BarChart3, ArrowRight, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AuditTransaction {
  date: string;
  description: string;
  amount: number;
  bankRate: number;
  midMarket: number;
  markup: number;
  fee: number;
}

interface AuditResult {
  transactions: AuditTransaction[];
  wireFees: number;
  totalFees: number;
  avgMarkup: number;
  annualProjection: number;
  loopSavings: number;
  statementPeriod?: string;
  currency?: string;
  bankName?: string;
}

const banks = [
  { name: "RBC Royal Bank", markup: 2.5 },
  { name: "TD Canada Trust", markup: 2.6 },
  { name: "BMO", markup: 2.4 },
  { name: "Scotiabank", markup: 2.5 },
  { name: "CIBC", markup: 2.7 },
  { name: "National Bank", markup: 2.3 },
  { name: "Other", markup: 2.5 },
];

function ScanTab() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, []);

  const processFile = async (f: File) => {
    setFile(f);
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong analyzing your statement.");
        setAnalyzing(false);
        return;
      }

      setResult(data as AuditResult);
    } catch {
      setError("Failed to connect to the analysis service. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (result) return <AuditReport data={result} onReset={() => { setFile(null); setResult(null); setError(null); }} />;

  return (
    <div className="space-y-6">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger font-medium">{error}</p>
            <button onClick={() => { setError(null); setFile(null); }} className="text-xs text-danger/70 underline mt-1">Try again</button>
          </div>
        </motion.div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`upload-zone rounded-2xl p-12 text-center cursor-pointer bg-white ${dragging ? "dragging" : ""}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        
        {analyzing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 mx-auto border-2 border-loop border-t-transparent rounded-full"
            />
            <p className="text-text-muted">Analyzing your statement...</p>
            <div className="max-w-xs mx-auto space-y-2">
              {["Extracting transactions", "Identifying FX conversions", "Calculating hidden markups"].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.8 }}
                  className="flex items-center gap-2 text-sm text-text-dim"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.8 + 0.6 }}>
                    <Check className="w-4 h-4 text-loop" />
                  </motion.div>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-loop" />
            <span className="text-text">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-text-dim mb-4" />
            <p className="text-lg text-text mb-2">Drop your bank statement here</p>
            <p className="text-sm text-text-dim">PDF, PNG, or JPG — we&apos;ll extract the data automatically</p>
            <p className="text-xs text-text-dim mt-4">Your file is processed securely and never stored</p>
          </>
        )}
      </div>
    </div>
  );
}

function AuditReport({ data, onReset }: { data: AuditResult; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-sm font-mono text-danger uppercase tracking-wider">FX Audit Report</span>
          </div>
          <h3 className="text-2xl font-bold text-loop-deep">We found hidden fees in your statement.</h3>
        </div>
        <button onClick={onReset} className="p-2 hover:bg-surface-dark rounded-lg transition-colors">
          <X className="w-5 h-5 text-text-dim" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Transactions Found", value: data.transactions.length.toString(), icon: FileText, accent: false },
          { label: "Avg. FX Markup", value: `${data.avgMarkup}%`, icon: TrendingDown, accent: true },
          { label: "Hidden Fees (This Period)", value: formatCurrency(data.totalFees), icon: DollarSign, accent: true },
          { label: "Annual Projection", value: formatCurrency(data.annualProjection), icon: BarChart3, accent: true },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-border rounded-xl p-4"
          >
            <card.icon className={`w-5 h-5 mb-2 ${card.accent ? "text-danger" : "text-loop"}`} />
            <p className="text-xs text-text-dim uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.accent ? "text-danger" : "text-loop-deep"}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-text-dim">Transaction Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light text-text-dim text-left">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium text-right">Bank Rate</th>
                <th className="p-3 font-medium text-right">Mid-Market</th>
                <th className="p-3 font-medium text-right">Markup</th>
                <th className="p-3 font-medium text-right">Hidden Fee</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-border-light/50 hover:bg-surface-tint transition-colors"
                >
                  <td className="p-3 font-mono text-text-dim">{tx.date}</td>
                  <td className="p-3">{tx.description}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(tx.amount, 2)}</td>
                  <td className="p-3 text-right font-mono">{tx.bankRate.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono">{tx.midMarket.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono text-danger">{tx.markup.toFixed(2)}%</td>
                  <td className="p-3 text-right font-mono text-danger font-semibold">{formatCurrency(tx.fee, 2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loop Comparison */}
      <div className="bg-loop-deep rounded-xl p-6 text-white">
        <h4 className="font-semibold mb-4 text-white/90">What you&apos;d save with Loop</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-white/60">Your bank charges</p>
            <p className="text-3xl font-bold text-accent-blue">{formatCurrency(data.annualProjection)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
          <div>
            <p className="text-sm text-white/60">With Loop</p>
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(data.annualProjection - data.loopSavings)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
          <div>
            <p className="text-sm text-white/60">Annual savings</p>
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(data.loopSavings)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm text-white/60 mb-2">What {formatCurrency(data.loopSavings)} could buy your business:</p>
          <div className="flex flex-wrap gap-3">
            {[
              `${Math.floor(data.loopSavings / 50)} months of software subscriptions`,
              `${Math.floor(data.loopSavings / 85)} hours of contractor work`,
              `${Math.floor(data.loopSavings / 1500)} marketing campaigns`,
            ].map((item) => (
              <span key={item} className="text-sm px-3 py-1 bg-white/10 rounded-full text-white/80">
                {item}
              </span>
            ))}
          </div>
        </div>

        <a
          href="https://bankonloop.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-accent-green text-loop-deep font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          Stop the bleed — switch to Loop
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

function CalculatorTab() {
  const [revenue, setRevenue] = useState(50000);
  const [intlPercent, setIntlPercent] = useState(30);
  const [bankIdx, setBankIdx] = useState(0);
  
  const bank = banks[bankIdx];
  const intlAmount = revenue * (intlPercent / 100);
  const bankFees = intlAmount * (bank.markup / 100);
  const loopFees = intlAmount * 0.5 / 100;
  const monthlySavings = bankFees - loopFees;
  const annualSavings = monthlySavings * 12;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Monthly Revenue (CAD)</label>
            <input
              type="range"
              min={5000}
              max={500000}
              step={5000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full accent-loop"
            />
            <div className="text-2xl font-bold text-loop-deep mt-1">{formatCurrency(revenue)}</div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">% International Transactions</label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={intlPercent}
              onChange={(e) => setIntlPercent(Number(e.target.value))}
              className="w-full accent-loop"
            />
            <div className="text-2xl font-bold text-loop-deep mt-1">{intlPercent}%</div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">Current Bank</label>
            <select
              value={bankIdx}
              onChange={(e) => setBankIdx(Number(e.target.value))}
              className="w-full bg-white border border-border rounded-xl p-3 text-text"
            >
              {banks.map((b, i) => (
                <option key={b.name} value={i}>{b.name} (~{b.markup}% markup)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-sm text-text-dim mb-1">International volume / month</p>
            <p className="text-2xl font-bold text-loop-deep">{formatCurrency(intlAmount)}</p>
          </div>
          
          <div className="bg-white border-2 border-danger/20 rounded-xl p-5">
            <p className="text-sm text-text-dim mb-1">{bank.name} charges you</p>
            <p className="text-3xl font-bold text-danger">{formatCurrency(bankFees)}<span className="text-sm text-text-dim font-normal">/mo</span></p>
            <p className="text-xs text-text-dim mt-1">{bank.markup}% markup × {formatCurrency(intlAmount)}</p>
          </div>

          <div className="bg-white border-2 border-loop/20 rounded-xl p-5">
            <p className="text-sm text-text-dim mb-1">With Loop, you&apos;d pay</p>
            <p className="text-3xl font-bold text-loop">{formatCurrency(loopFees)}<span className="text-sm text-text-dim font-normal">/mo</span></p>
            <p className="text-xs text-text-dim mt-1">~0.5% markup × {formatCurrency(intlAmount)}</p>
          </div>

          <motion.div
            key={annualSavings}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-loop-deep rounded-xl p-5 text-white"
          >
            <p className="text-sm text-white/60 mb-1">Your annual savings with Loop</p>
            <p className="text-4xl font-bold text-accent-green">{formatCurrency(annualSavings)}</p>
            <p className="text-sm text-white/70 mt-2">That&apos;s {formatCurrency(monthlySavings)} back in your pocket every month.</p>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <a
          href="https://bankonloop.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Start saving with Loop
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default function Tool() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [tab, setTab] = useState<"scan" | "calc">("scan");

  return (
    <section id="tool" ref={ref} className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-loop-deep">See exactly what your bank is hiding.</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Upload a statement for an AI-powered audit, or use the calculator for a quick estimate.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-border rounded-xl p-1">
            {[
              { id: "scan" as const, label: "Scan Statement", icon: Upload },
              { id: "calc" as const, label: "Calculator", icon: Calculator },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === id ? "bg-loop text-white" : "text-text-muted hover:text-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "scan" ? <ScanTab /> : <CalculatorTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
