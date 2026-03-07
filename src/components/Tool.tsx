"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Upload, FileText, Calculator, AlertTriangle, TrendingDown, DollarSign, BarChart3, ArrowRight, Check, X, Shield, Zap, CreditCard, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Finding {
  category: string;
  date: string | null;
  description: string;
  amount: number;
  loopAlternative: string;
  savingsPerOccurrence: number;
}

interface Recommendation {
  title: string;
  description: string;
  estimatedAnnualSavings: number;
  priority: "high" | "medium" | "low";
}

interface AuditResult {
  bankName: string;
  statementPeriod: string;
  currency: string;
  openingBalance: number;
  closingBalance: number;
  findings: Finding[];
  recommendations: Recommendation[];
  summary: {
    totalFeesFound: number;
    totalFxMarkups: number;
    totalAccountFees: number;
    totalWireFees: number;
    totalOtherFees: number;
    annualProjection: number;
    loopAnnualCost: number;
    annualSavings: number;
  };
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

const categoryIcons: Record<string, typeof DollarSign> = {
  account_fee: Building2,
  fx_markup: TrendingDown,
  wire_fee: Zap,
  etransfer_fee: ArrowRight,
  payment_inefficiency: Zap,
  card_fee: CreditCard,
  other_fee: DollarSign,
};

const categoryLabels: Record<string, string> = {
  account_fee: "Account Fee",
  fx_markup: "FX Markup",
  wire_fee: "Wire Fee",
  etransfer_fee: "e-Transfer Fee",
  payment_inefficiency: "Inefficiency",
  card_fee: "Card Fee",
  other_fee: "Fee",
};

const priorityColors: Record<string, string> = {
  high: "bg-danger/10 text-danger border-danger/20",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-loop/5 text-loop border-loop/20",
};

function AuditReport({ data, onReset }: { data: AuditResult; onReset: () => void }) {
  const nothingFound = data.findings.length === 0 && data.summary.totalFeesFound === 0 && data.recommendations.length === 0;

  if (nothingFound) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center py-8">
        <div className="w-16 h-16 mx-auto bg-loop/10 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-loop" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-loop-deep mb-2">Your statement looks clean</h3>
          <p className="text-text-muted max-w-md mx-auto">
            We didn&apos;t find fees or inefficiencies on this statement. Try uploading one with international transactions, wire transfers, or FX conversions.
          </p>
        </div>
        {data.bankName && data.bankName !== "Unknown" && (
          <p className="text-sm text-text-dim">
            Detected bank: <span className="font-medium text-text">{data.bankName}</span>
            {data.statementPeriod && data.statementPeriod !== "Unknown" && <> · {data.statementPeriod}</>}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button onClick={onReset} className="px-6 py-3 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors">
            Upload another statement
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-sm font-mono text-danger uppercase tracking-wider">Banking Audit Report</span>
          </div>
          <h3 className="text-2xl font-bold text-loop-deep">
            We found {data.findings.length} issue{data.findings.length !== 1 ? "s" : ""} in your statement.
          </h3>
          {data.bankName !== "Unknown" && (
            <p className="text-sm text-text-dim mt-1">{data.bankName} · {data.statementPeriod}</p>
          )}
        </div>
        <button onClick={onReset} className="p-2 hover:bg-surface-dark rounded-lg transition-colors">
          <X className="w-5 h-5 text-text-dim" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Issues Found", value: data.findings.length.toString(), icon: AlertTriangle, accent: false },
          { label: "Fees This Period", value: formatCurrency(data.summary.totalFeesFound), icon: DollarSign, accent: true },
          { label: "Annual Projection", value: formatCurrency(data.summary.annualProjection), icon: BarChart3, accent: true },
          { label: "You&apos;d Save / Year", value: formatCurrency(data.summary.annualSavings), icon: Shield, accent: false, green: true },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-border rounded-xl p-4"
          >
            <card.icon className={`w-5 h-5 mb-2 ${card.green ? "text-loop" : card.accent ? "text-danger" : "text-loop"}`} />
            <p className="text-xs text-text-dim uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.green ? "text-loop" : card.accent ? "text-danger" : "text-loop-deep"}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Findings */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-text-dim">What We Found</h4>
        </div>
        <div className="divide-y divide-border-light">
          {data.findings.map((finding, i) => {
            const Icon = categoryIcons[finding.category] || DollarSign;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 hover:bg-surface-tint transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-dim uppercase">{categoryLabels[finding.category] || finding.category}</span>
                      {finding.date && <span className="text-xs text-text-dim">· {finding.date}</span>}
                    </div>
                    <p className="text-sm text-text font-medium">{finding.description}</p>
                    <p className="text-sm text-loop mt-1">💡 Loop: {finding.loopAlternative}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-danger">{formatCurrency(finding.amount)}</p>
                    {finding.savingsPerOccurrence > 0 && (
                      <p className="text-xs text-loop">Save {formatCurrency(finding.savingsPerOccurrence)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-text-dim">Recommendations</h4>
          {data.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-xl p-5 ${priorityColors[rec.priority]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase">{rec.priority} priority</span>
                  </div>
                  <h5 className="font-semibold text-loop-deep">{rec.title}</h5>
                  <p className="text-sm text-text-muted mt-1">{rec.description}</p>
                </div>
                {rec.estimatedAnnualSavings > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-text-dim">Est. annual savings</p>
                    <p className="text-xl font-bold text-loop">{formatCurrency(rec.estimatedAnnualSavings)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loop Comparison */}
      <div className="bg-loop-deep rounded-xl p-6 text-white">
        <h4 className="font-semibold mb-4 text-white/90">Your bank vs Loop</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-white/60">Your bank costs you</p>
            <p className="text-3xl font-bold text-accent-blue">{formatCurrency(data.summary.annualProjection)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
          <div>
            <p className="text-sm text-white/60">With Loop</p>
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(data.summary.loopAnnualCost)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
          <div>
            <p className="text-sm text-white/60">You save</p>
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(data.summary.annualSavings)}<span className="text-sm text-white/50 font-normal">/yr</span></p>
          </div>
        </div>

        {data.summary.annualSavings > 0 && (
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-white/60 mb-2">What {formatCurrency(data.summary.annualSavings)} could buy your business:</p>
            <div className="flex flex-wrap gap-3">
              {[
                data.summary.annualSavings >= 50 ? `${Math.floor(data.summary.annualSavings / 50)} months of software tools` : null,
                data.summary.annualSavings >= 85 ? `${Math.floor(data.summary.annualSavings / 85)} hours of contractor work` : null,
                data.summary.annualSavings >= 500 ? `${Math.floor(data.summary.annualSavings / 500)} ad campaigns` : null,
              ].filter(Boolean).map((item) => (
                <span key={item} className="text-sm px-3 py-1 bg-white/10 rounded-full text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

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
                data-tab={id}
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
