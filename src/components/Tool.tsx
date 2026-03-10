"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Upload, FileText, Calculator, AlertTriangle, TrendingDown, DollarSign, BarChart3, ArrowRight, Check, X, Shield, Zap, CreditCard, Building2, Share2, Copy, Linkedin, Download, Mail, MessageCircle, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buildShareUrl } from "@/lib/report-codec";
import { generateAuditPdf } from "@/lib/generatePdf";
import AnimatedNumber from "./AnimatedNumber";
import ProjectionCharts from "./Charts";
import { useSignupModal } from "./SignupModalProvider";

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 mx-auto border-2 border-loop border-t-transparent rounded-full"
            />
            <p className="text-text-muted font-medium">{progress || "Analyzing your statement..."}</p>
            {/* Progress bar */}
            <div className="max-w-xs mx-auto h-1.5 bg-surface-dark rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-loop rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "90%" }}
                transition={{ duration: 8, ease: "easeOut" }}
              />
            </div>
            <div className="max-w-xs mx-auto space-y-3">
              {["Extracting transactions", "Identifying FX conversions", "Calculating hidden markups", "Generating audit report"].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 1.2 }}
                  className="flex items-center gap-2 text-sm text-text-dim"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 1.2 + 0.8 }}
                  >
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

/* ── Email Gate Form ── */
function EmailGateForm({ onSubmit, loading }: { onSubmit: (data: { name: string; email: string; company: string }) => void; loading: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), company: company.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-loop-deep mb-1">Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-loop-deep mb-1">Work Email *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-loop-deep mb-1">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
          placeholder="Company name"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? "Unlocking..." : "Unlock Full Report →"}
      </button>
      <p className="text-xs text-text-dim text-center">We&apos;ll send you a copy. No spam, ever.</p>
    </form>
  );
}

/* ── Share / Referral Buttons ── */
function ShareButtons({ data }: { data: AuditResult }) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = buildShareUrl(baseUrl, data as unknown as Record<string, unknown>);
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
          <MessageCircle className="w-4 h-4" />
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

/* ── Referral Section ── */
function ReferralSection({ data }: { data: AuditResult }) {
  const [copied, setCopied] = useState(false);
  const refCode = useMemo(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralUrl = `${baseUrl}?ref=${refCode}`;
  const savings = formatCurrency(data.summary.annualSavings);
  const msg = `I just found out my bank was charging me ${formatCurrency(data.summary.annualProjection)}/yr in hidden FX fees. I'm saving ${savings}/yr by switching to Loop. See what your bank is hiding:`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${msg} ${referralUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(referralUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Your bank might be hiding fees too")}&body=${encodeURIComponent(`${msg}\n\n${referralUrl}`)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#01251e] to-[#004639] rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#C4F6C6]/20 flex items-center justify-center">
          <span className="text-xl">🏆</span>
        </div>
        <div>
          <h4 className="text-lg font-bold">Challenge a Friend</h4>
          <p className="text-sm text-white/60">Think their bank is better? Prove it.</p>
        </div>
      </div>
      <p className="text-sm text-white/70 mb-4">
        Share this tool and help someone else discover how much their bank is really costing them. You&apos;re saving <span className="text-[#C4F6C6] font-bold">{savings}/yr</span> — they could too.
      </p>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-lg transition-colors">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium rounded-lg transition-colors">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          Post
        </a>
        <a href={emailUrl} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
          <Mail className="w-4 h-4" /> Email
        </a>
        <button onClick={copyLink} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
          {copied ? <Check className="w-4 h-4 text-[#C4F6C6]" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

/* ── Audit Report with Email Gate ── */
function AuditReport({ data, onReset }: { data: AuditResult; onReset: () => void }) {
  const { openSignup } = useSignupModal();
  const isDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true";
  const [unlocked, setUnlocked] = useState(isDemo);
  const [gateLoading, setGateLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const nothingFound = data.findings.length === 0 && data.summary.totalFeesFound === 0 && data.recommendations.length === 0;

  const handleEmailSubmit = async (formData: { name: string; email: string; company: string }) => {
    setGateLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bankName: data.bankName,
          totalFees: data.summary.totalFeesFound,
          annualProjection: data.summary.annualProjection,
        }),
      });
      setUnlocked(true);
    } catch {
      // Still unlock on error — don't punish user
      setUnlocked(true);
    } finally {
      setGateLoading(false);
    }
  };

  const handleDownloadReport = () => {
    setDownloading(true);
    try {
      generateAuditPdf(data);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

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
            We found {data.findings.length} issue{data.findings.length !== 1 ? "s" : ""} costing you {formatCurrency(data.summary.annualProjection)}/yr
          </h3>
          {data.bankName !== "Unknown" && (
            <p className="text-sm text-text-dim mt-1">{data.bankName} · {data.statementPeriod}</p>
          )}
        </div>
        <button onClick={onReset} className="p-2 hover:bg-surface-dark rounded-lg transition-colors">
          <X className="w-5 h-5 text-text-dim" />
        </button>
      </div>

      {/* Summary Cards — always visible */}
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

      {/* ── EMAIL GATE: Blurred content + form overlay ── */}
      {!unlocked && (
        <div className="relative">
          {/* Blurred teaser of the report */}
          <div className="filter blur-[8px] pointer-events-none select-none" aria-hidden="true">
            <div className="bg-white border border-border rounded-xl p-4 mb-4">
              <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border-light">
                    <div className="h-4 bg-gray-200 rounded w-64" />
                    <div className="h-4 bg-red-100 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
            <ProjectionCharts summary={data.summary} plans={data.planComparison} />
          </div>

          {/* Overlay form */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-loop/30 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-loop/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-loop" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-loop-deep">Unlock Your Full Report</h4>
                  <p className="text-sm text-text-muted">See all findings, charts & savings breakdown</p>
                </div>
              </div>
              <EmailGateForm onSubmit={handleEmailSubmit} loading={gateLoading} />
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Full report content (only shown after email gate) ── */}
      {unlocked && (
        <>
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

          <p className="text-xs text-gray-400">
            FX markups calculated using today&apos;s mid-market rates. Actual rates at the time of transaction may have differed slightly.
          </p>

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
                        <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>FX Markup</p>
                        <p className={`text-lg font-bold ${isRec ? "text-[#99E5FD]" : "text-loop"}`}>{plan.fxRate}%</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>
                          Total Annual Cost {plan.monthlyFee > 0 ? <span className="opacity-70">(incl. ${plan.monthlyFee}×12 plan fee)</span> : <span className="opacity-70">(no plan fee)</span>}
                        </p>
                        <p className={`text-lg font-bold ${isRec ? "text-white" : "text-text"}`}>{formatCurrency(plan.annualCostOnPlan)}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>You Save vs Your Bank</p>
                        <p className={`text-2xl font-bold ${plan.annualSavingsVsBank > 0 ? (isRec ? "text-[#C4F6C6]" : "text-loop") : "text-danger"}`}>
                          {plan.annualSavingsVsBank > 0 ? formatCurrency(plan.annualSavingsVsBank) : `-${formatCurrency(Math.abs(plan.annualSavingsVsBank))}`}
                        </p>
                        {plan.annualSavingsVsBank <= 0 && plan.monthlyFee > 0 && (
                          <p className={`text-xs mt-1 ${isRec ? "text-white/50" : "text-text-dim"}`}>
                            Plan fee exceeds savings at your current volume
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={openSignup}
                      className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all text-sm ${
                        isRec
                          ? "bg-[#C4F6C6] text-[#004639] hover:brightness-110"
                          : "bg-loop/10 text-loop hover:bg-loop/20"
                      }`}
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* What savings could buy */}
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

          {/* Referral Section */}
          <ReferralSection data={data} />

          {/* Share Buttons */}
          <ShareButtons data={data} />

          {/* FX Rate Disclaimer */}
          <p className="text-xs text-text-dim text-center">
            FX markups calculated using today&apos;s mid-market rates. Actual rates at the time of transaction may have differed slightly.
          </p>

          {/* Download Report + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-loop text-loop hover:bg-loop/5 font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={openSignup}
              className="inline-flex items-center gap-2 px-8 py-3 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Stop the Bleed — Switch to Loop
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

const loopPlans = [
  { name: "Basic", monthlyFee: 0, fxRate: 0.5, features: ["Free USD/EUR/GBP accounts", "20 virtual cards", "1x points on CAD"] },
  { name: "Plus", monthlyFee: 79, fxRate: 0.25, features: ["Unlimited virtual cards", "10 free physical cards", "2x points all spend", "Instant deposits"] },
  { name: "Power", monthlyFee: 299, fxRate: 0.10, features: ["50 free physical cards", "Dedicated concierge", "Custom rewards", "2x points all spend"] },
];

function CalculatorTab() {
  const { openSignup } = useSignupModal();
  const [intlVolume, setIntlVolume] = useState(50000);
  const [wireCount, setWireCount] = useState(5);
  const [bankIdx, setBankIdx] = useState(0);

  const bank = banks[bankIdx];
  const bankFxCost = intlVolume * (bank.markup / 100);
  const bankWireCost = wireCount * 40;
  const bankMonthlyCost = bankFxCost + bankWireCost;
  const bankYearlyCost = bankMonthlyCost * 12;

  const planResults = loopPlans.map(plan => {
    const loopFxCost = intlVolume * (plan.fxRate / 100);
    const loopMonthlyCost = loopFxCost + plan.monthlyFee;
    const loopYearlyCost = loopMonthlyCost * 12;
    const annualSavings = bankYearlyCost - loopYearlyCost;
    return { ...plan, loopFxCost, loopMonthlyCost, loopYearlyCost, annualSavings };
  });

  const bestIdx = planResults.reduce((best, p, i) => p.annualSavings > planResults[best].annualSavings ? i : best, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-2">Monthly international transaction volume (CAD)</label>
            <input type="range" min={1000} max={1000000} step={1000} value={intlVolume} onChange={(e) => setIntlVolume(Number(e.target.value))} className="w-full accent-loop" />
            <input type="number" min={1000} max={1000000} step={1000} value={intlVolume} onChange={(e) => setIntlVolume(Math.max(1000, Math.min(1000000, Number(e.target.value) || 1000)))} className="w-full mt-1 bg-white border border-border rounded-lg px-3 py-1.5 text-lg font-bold text-loop-deep font-mono focus:outline-none focus:ring-2 focus:ring-loop/30" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Number of international wires per month</label>
            <input type="range" min={0} max={50} step={1} value={wireCount} onChange={(e) => setWireCount(Number(e.target.value))} className="w-full accent-loop" />
            <input type="number" min={0} max={50} step={1} value={wireCount} onChange={(e) => setWireCount(Math.max(0, Math.min(50, Number(e.target.value) || 0)))} className="w-full mt-1 bg-white border border-border rounded-lg px-3 py-1.5 text-lg font-bold text-loop-deep font-mono focus:outline-none focus:ring-2 focus:ring-loop/30" />
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

        {/* Bank cost breakdown */}
        <div className="bg-white border-2 border-danger/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">{bank.name} costs you</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">FX markup ({bank.markup}% × {formatCurrency(intlVolume)})</span>
              <span className="font-semibold text-danger">{formatCurrency(bankFxCost)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Wire fees ({wireCount} × $40)</span>
              <span className="font-semibold text-danger">{formatCurrency(bankWireCost)}/mo</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-text">Total monthly cost</span>
              <span className="text-xl font-bold text-danger">{formatCurrency(bankMonthlyCost)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text">Total yearly cost</span>
              <span className="text-xl font-bold text-danger">{formatCurrency(bankYearlyCost)}/yr</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-center text-lg font-bold text-loop-deep mb-6">What you&apos;d pay on Loop instead</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planResults.map((plan, i) => {
            const isBest = i === bestIdx;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl p-5 border-2 transition-all ${
                  isBest
                    ? "border-[#C4F6C6] bg-[#01251e] text-white shadow-[0_0_30px_rgba(196,246,198,0.3)] scale-[1.02]"
                    : "border-border bg-white"
                }`}
              >
                {isBest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C4F6C6] text-[#004639] text-xs font-bold uppercase tracking-wider rounded-full">
                    Best Value
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h5 className={`font-bold text-lg ${isBest ? "text-white" : "text-loop-deep"}`}>{plan.name}</h5>
                  <span className={`text-sm ${isBest ? "text-white/60" : "text-text-dim"}`}>
                    {plan.monthlyFee === 0 ? "Free" : `$${plan.monthlyFee}/mo`}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className={isBest ? "text-white/60" : "text-text-dim"}>FX cost ({plan.fxRate}% × {formatCurrency(intlVolume)})</span>
                    <span className={`font-semibold ${isBest ? "text-white" : "text-text"}`}>{formatCurrency(plan.loopFxCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isBest ? "text-white/60" : "text-text-dim"}>Wire fees</span>
                    <span className={`font-semibold ${isBest ? "text-[#C4F6C6]" : "text-loop"}`}>$0 (free)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isBest ? "text-white/60" : "text-text-dim"}>Plan fee</span>
                    <span className={`font-semibold ${isBest ? "text-white" : "text-text"}`}>{plan.monthlyFee === 0 ? "$0" : formatCurrency(plan.monthlyFee)}</span>
                  </div>
                  <div className={`border-t pt-2 flex justify-between ${isBest ? "border-white/20" : "border-border"}`}>
                    <span className={`font-semibold ${isBest ? "text-white" : "text-text"}`}>Monthly total</span>
                    <span className={`font-bold ${isBest ? "text-white" : "text-text"}`}>{formatCurrency(plan.loopMonthlyCost)}</span>
                  </div>
                </div>
                <div className={`rounded-lg p-3 text-center ${isBest ? "bg-white/10" : "bg-loop/5"}`}>
                  <p className={`text-xs ${isBest ? "text-white/50" : "text-text-dim"}`}>Annual savings vs {bank.name}</p>
                  <p className={`text-2xl font-bold ${plan.annualSavings > 0 ? (isBest ? "text-[#C4F6C6]" : "text-loop") : "text-danger"}`}>
                    {plan.annualSavings > 0 ? formatCurrency(plan.annualSavings) : `-${formatCurrency(Math.abs(plan.annualSavings))}`}
                  </p>
                  <p className={`text-xs mt-1 ${isBest ? "text-white/40" : "text-text-dim"}`}>
                    ({formatCurrency(plan.loopYearlyCost)}/yr on Loop vs {formatCurrency(bankYearlyCost)}/yr at {bank.name})
                  </p>
                </div>
                {plan.features && (
                  <div className="mt-4 space-y-1.5">
                    {plan.features.map(f => (
                      <div key={f} className={`flex items-center gap-2 text-xs ${isBest ? "text-white/70" : "text-text-dim"}`}>
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
        <button
          onClick={openSignup}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#004639] hover:bg-[#01251e] text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Start saving with Loop
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-text-dim text-center mt-6">
        Loop&apos;s advertised FX rates are charged on top of plan fees. Savings estimates are approximate and based on current mid-market rates. Actual rates may vary.
      </p>
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

        <p className="text-xs text-gray-400 text-center mt-8">
          Loop&apos;s advertised FX rates are charged on top of plan fees. Savings estimates are approximate and based on current mid-market rates.
        </p>
      </div>
    </section>
  );
}
