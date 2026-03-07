"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Upload, FileText, Calculator, AlertTriangle, TrendingDown, DollarSign, BarChart3, ArrowRight, Check, X, Shield, Zap, CreditCard, Building2, Share2, Copy, Linkedin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AnimatedNumber from "./AnimatedNumber";
import ProjectionCharts from "./Charts";

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

interface PlanComparison {
  plan: string;
  monthlyFee: number;
  fxRate: number;
  annualCostOnPlan: number;
  annualSavingsVsBank: number;
  recommended: boolean;
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
  planComparison?: PlanComparison[];
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
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) processFiles(dropped);
  }, []);

  const processFiles = async (newFiles: File[]) => {
    setFiles(newFiles);
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      newFiles.forEach((f) => formData.append("files", f));

      setProgress(`Analyzing ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}...`);
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
      setProgress("");
    }
  };

  if (result) return <AuditReport data={result} onReset={() => { setFiles([]); setResult(null); setError(null); }} />;

  return (
    <div className="space-y-6">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger font-medium">{error}</p>
            <button onClick={() => { setError(null); setFiles([]); }} className="text-xs text-danger/70 underline mt-1">Try again</button>
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
          multiple
          className="hidden"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (selected.length) processFiles(selected);
          }}
        />
        
        {analyzing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 mx-auto border-2 border-loop border-t-transparent rounded-full"
            />
            <p className="text-text-muted">{progress || "Analyzing your statement..."}</p>
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
        ) : files.length > 0 ? (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-loop" />
                <span className="text-text text-sm">{f.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-text-dim mb-4" />
            <p className="text-lg text-text mb-2">Drop your bank statements here</p>
            <p className="text-sm text-text-dim">Upload one or multiple statements — PDF, PNG, or JPG</p>
            <p className="text-xs text-text-dim mt-4">Your files are processed securely and never stored</p>
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

const formatCurrencyAnim = (n: number) => formatCurrency(Math.round(n));

function ShareButtons({ data }: { data: AuditResult }) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}?bankName=${encodeURIComponent(data.bankName)}&totalFees=${data.summary.totalFeesFound}&annualProjection=${data.summary.annualProjection}&annualSavings=${data.summary.annualSavings}&findingsCount=${data.findings.length}`;
  const savings = formatCurrency(data.summary.annualProjection);
  const shareText = `My bank is charging me ${savings}/yr in hidden fees. See what yours is hiding →`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-4 h-4 text-text-dim" />
        <span className="text-sm font-semibold text-text-dim uppercase tracking-wider">Share your results</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium rounded-lg transition-colors">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          Post
        </a>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp
        </a>
        <button onClick={copyLink} className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-dark hover:bg-border text-text text-sm font-medium rounded-lg transition-colors">
          {copied ? <Check className="w-4 h-4 text-loop" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 mb-2 text-loop" />
          <p className="text-xs text-text-dim uppercase tracking-wider">Issues Found</p>
          <p className="text-2xl font-bold mt-1 text-loop-deep">
            <AnimatedNumber value={data.findings.length} format={(n) => Math.round(n).toString()} />
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border rounded-xl p-4">
          <DollarSign className="w-5 h-5 mb-2 text-danger" />
          <p className="text-xs text-text-dim uppercase tracking-wider">Fees This Period</p>
          <p className="text-2xl font-bold mt-1 text-danger">
            <AnimatedNumber value={data.summary.totalFeesFound} format={formatCurrencyAnim} />
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border rounded-xl p-4">
          <BarChart3 className="w-5 h-5 mb-2 text-danger" />
          <p className="text-xs text-text-dim uppercase tracking-wider">Annual Projection</p>
          <p className="text-2xl font-bold mt-1 text-danger">
            <AnimatedNumber value={data.summary.annualProjection} format={formatCurrencyAnim} />
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border rounded-xl p-4">
          <Shield className="w-5 h-5 mb-2 text-loop" />
          <p className="text-xs text-text-dim uppercase tracking-wider">You&apos;d Save / Year</p>
          <p className="text-2xl font-bold mt-1 text-loop">
            <AnimatedNumber value={data.summary.annualSavings} format={formatCurrencyAnim} />
          </p>
        </motion.div>
      </div>

      {/* Projection Charts */}
      <ProjectionCharts summary={data.summary} plans={data.planComparison} />

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

      {/* Loop Plan Comparison */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-xl font-bold text-loop-deep mb-1">Your bank vs Loop</h4>
          <p className="text-sm text-text-muted">Your bank costs you <span className="font-bold text-danger">{formatCurrency(data.summary.annualProjection)}/yr</span>. Here&apos;s what each Loop plan saves you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.planComparison || []).map((plan, i) => {
            const isRec = plan.recommended;
            return (
              <motion.div
                key={plan.plan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  isRec
                    ? "border-[#C4F6C6] bg-[#01251e] text-white scale-[1.03] shadow-[0_0_30px_rgba(196,246,198,0.3)]"
                    : "border-border bg-white text-text"
                }`}
              >
                {isRec && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C4F6C6] text-[#004639] text-xs font-bold uppercase tracking-wider rounded-full">
                    Recommended
                  </div>
                )}
                <div className="mb-4">
                  <h5 className={`text-lg font-bold ${isRec ? "text-white" : "text-loop-deep"}`}>{plan.plan}</h5>
                  <p className={`text-sm ${isRec ? "text-white/60" : "text-text-dim"}`}>
                    {plan.monthlyFee === 0 ? "Free" : `$${plan.monthlyFee}/mo`}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>FX Rate</p>
                    <p className={`text-lg font-bold ${isRec ? "text-[#99E5FD]" : "text-loop"}`}>{plan.fxRate}%</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>Annual Cost on Plan</p>
                    <p className={`text-lg font-bold ${isRec ? "text-white" : "text-text"}`}>{formatCurrency(plan.annualCostOnPlan)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>Annual Savings vs Bank</p>
                    <p className={`text-2xl font-bold ${isRec ? "text-[#C4F6C6]" : "text-loop"}`}>{formatCurrency(plan.annualSavingsVsBank)}</p>
                  </div>
                </div>

                <a
                  href="https://bankonloop.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all text-sm ${
                    isRec
                      ? "bg-[#C4F6C6] text-[#004639] hover:brightness-110"
                      : "bg-loop/10 text-loop hover:bg-loop/20"
                  }`}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* What savings could buy — attached to recommended plan */}
        {(() => {
          const rec = (data.planComparison || []).find(p => p.recommended);
          const savings = rec?.annualSavingsVsBank || data.summary.annualSavings;
          if (savings <= 0) return null;
          return (
            <div className="bg-[#01251e] rounded-xl p-5 text-white">
              <p className="text-sm text-white/60 mb-3">What {formatCurrency(savings)}/yr in savings could buy your business:</p>
              <div className="flex flex-wrap gap-3">
                {[
                  savings >= 50 ? `${Math.floor(savings / 50)} months of software tools` : null,
                  savings >= 85 ? `${Math.floor(savings / 85)} hours of contractor work` : null,
                  savings >= 500 ? `${Math.floor(savings / 500)} ad campaigns` : null,
                ].filter(Boolean).map((item) => (
                  <span key={item} className="text-sm px-3 py-1 bg-white/10 rounded-full text-white/80">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Share Buttons */}
      <ShareButtons data={data} />
    </motion.div>
  );
}

const loopPlans = [
  { name: "Basic", monthlyFee: 0, fxRate: 0.5, features: ["Free USD/EUR/GBP accounts", "20 virtual cards", "1x points on CAD"] },
  { name: "Plus", monthlyFee: 79, fxRate: 0.25, features: ["Unlimited virtual cards", "10 free physical cards", "2x points all spend", "Instant deposits"] },
  { name: "Power", monthlyFee: 299, fxRate: 0.10, features: ["50 free physical cards", "Dedicated concierge", "Custom rewards", "2x points all spend"] },
];

function CalculatorTab() {
  const [revenue, setRevenue] = useState(50000);
  const [intlPercent, setIntlPercent] = useState(30);
  const [bankIdx, setBankIdx] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(0);
  
  const bank = banks[bankIdx];
  const intlAmount = revenue * (intlPercent / 100);
  const bankFees = intlAmount * (bank.markup / 100);

  const planResults = loopPlans.map(plan => {
    const loopFxFees = intlAmount * (plan.fxRate / 100);
    const monthlyTotal = loopFxFees + plan.monthlyFee;
    const monthlySavings = bankFees - monthlyTotal;
    return { ...plan, loopFxFees, monthlyTotal, monthlySavings, annualSavings: monthlySavings * 12 };
  });

  // Auto-recommend: best net annual savings
  const bestIdx = planResults.reduce((best, p, i) => p.annualSavings > planResults[best].annualSavings ? i : best, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-2">Monthly Revenue (CAD)</label>
            <input type="range" min={5000} max={500000} step={5000} value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="w-full accent-loop" />
            <div className="text-2xl font-bold text-loop-deep mt-1">{formatCurrency(revenue)}</div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">% International Transactions</label>
            <input type="range" min={5} max={100} step={5} value={intlPercent} onChange={(e) => setIntlPercent(Number(e.target.value))} className="w-full accent-loop" />
            <div className="text-2xl font-bold text-loop-deep mt-1">{intlPercent}%</div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Current Bank</label>
            <select value={bankIdx} onChange={(e) => setBankIdx(Number(e.target.value))} className="w-full bg-white border border-border rounded-xl p-3 text-text">
              {banks.map((b, i) => (
                <option key={b.name} value={i}>{b.name} (~{b.markup}% markup)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border-2 border-danger/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-dim">{bank.name} charges you</p>
            <p className="text-xs text-text-dim">{bank.markup}% markup × {formatCurrency(intlAmount)}</p>
          </div>
          <p className="text-3xl font-bold text-danger">{formatCurrency(bankFees)}<span className="text-sm text-text-dim font-normal">/mo</span></p>
        </div>
      </div>

      {/* Plan toggle */}
      <div>
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white border border-border rounded-xl p-1">
            {loopPlans.map((plan, i) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(i)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  selectedPlan === i ? "bg-[#004639] text-white" : "text-text-muted hover:text-text"
                }`}
              >
                {plan.name}
                {i === bestIdx && (
                  <span className="absolute -top-2 -right-1 w-2 h-2 bg-[#C4F6C6] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planResults.map((plan, i) => {
            const isSelected = selectedPlan === i;
            const isBest = i === bestIdx;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedPlan(i)}
                className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                  isSelected
                    ? isBest
                      ? "border-[#C4F6C6] bg-[#01251e] text-white shadow-[0_0_30px_rgba(196,246,198,0.3)] scale-[1.02]"
                      : "border-[#004639] bg-[#01251e] text-white scale-[1.02]"
                    : "border-border bg-white hover:border-loop/30"
                }`}
              >
                {isBest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C4F6C6] text-[#004639] text-xs font-bold uppercase tracking-wider rounded-full">
                    Best Value
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <h5 className={`font-bold ${isSelected ? "text-white" : "text-loop-deep"}`}>{plan.name}</h5>
                  <span className={`text-sm ${isSelected ? "text-white/60" : "text-text-dim"}`}>
                    {plan.monthlyFee === 0 ? "Free" : `$${plan.monthlyFee}/mo`}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className={isSelected ? "text-white/60" : "text-text-dim"}>FX Rate</span>
                    <span className={`font-semibold ${isSelected ? "text-[#99E5FD]" : "text-loop"}`}>{plan.fxRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isSelected ? "text-white/60" : "text-text-dim"}>Loop cost/mo</span>
                    <span className={`font-semibold ${isSelected ? "text-white" : "text-text"}`}>{formatCurrency(plan.monthlyTotal)}</span>
                  </div>
                </div>
                <div className={`rounded-lg p-3 text-center ${isSelected ? "bg-white/10" : "bg-loop/5"}`}>
                  <p className={`text-xs ${isSelected ? "text-white/50" : "text-text-dim"}`}>Annual savings</p>
                  <p className={`text-2xl font-bold ${plan.annualSavings > 0 ? (isSelected ? "text-[#C4F6C6]" : "text-loop") : "text-danger"}`}>
                    {formatCurrency(plan.annualSavings)}
                  </p>
                </div>
                {isSelected && plan.features && (
                  <div className="mt-4 space-y-1.5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3 h-3 text-[#C4F6C6]" /> {f}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <a
          href="https://bankonloop.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#004639] hover:bg-[#01251e] text-white font-semibold rounded-xl transition-colors text-lg"
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
