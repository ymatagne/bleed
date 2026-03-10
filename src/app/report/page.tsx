"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  DollarSign,
  BarChart3,
  Shield,
  TrendingDown,
  Zap,
  ArrowRight,
  Check,
  CreditCard,
  Building2,
  Share2,
  Copy,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import { decodeReportData } from "@/lib/report-codec";
import AnimatedNumber from "@/components/AnimatedNumber";
import ProjectionCharts from "@/components/Charts";
import { useSignupModal } from "@/components/SignupModalProvider";

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
  _trimmed?: boolean;
  _summaryOnly?: boolean;
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

function ShareReportButtons({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const shareText = "Check out this FX audit report — see how much Canadian banks really charge in hidden fees →";

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-4 h-4 text-text-dim" />
        <span className="text-sm font-semibold text-text-dim uppercase tracking-wider">Share this report</span>
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
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <button onClick={copyLink} className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-dark hover:bg-border text-text text-sm font-medium rounded-lg transition-colors">
          {copied ? <Check className="w-4 h-4 text-loop" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function SharedReport() {
  const searchParams = useSearchParams();
  const { openSignup } = useSignupModal();
  const encoded = searchParams.get("d");

  const data = useMemo(() => {
    if (!encoded) return null;
    return decodeReportData(encoded) as AuditResult | null;
  }, [encoded]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center py-24 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-loop-deep mb-4">Report Not Found</h1>
            <p className="text-text-muted mb-6">This link doesn&apos;t contain a valid report. Try uploading a statement to generate a new one.</p>
            <a href="/#tool" className="inline-flex items-center gap-2 px-6 py-3 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors">
              Run a Free Audit <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 py-16 px-6 bg-surface">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span className="text-sm font-mono text-danger uppercase tracking-wider">Banking Audit Report</span>
            </div>
            <h1 className="text-2xl font-bold text-loop-deep">
              {data.findings.length > 0
                ? `${data.findings.length} issue${data.findings.length !== 1 ? "s" : ""} found costing ${formatCurrency(data.summary.annualProjection)}/yr`
                : `${formatCurrency(data.summary.annualProjection)}/yr in hidden fees detected`}
            </h1>
            {data.bankName !== "Unknown" && (
              <p className="text-sm text-text-dim mt-1">{data.bankName} · {data.statementPeriod}</p>
            )}
            {(data._trimmed || data._summaryOnly) && (
              <p className="text-xs text-text-dim mt-2 bg-surface-dark inline-block px-3 py-1 rounded-full">
                📊 Summary view — <a href="/#tool" className="text-loop underline">run your own full audit</a>
              </p>
            )}
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
              <p className="text-xs text-text-dim uppercase tracking-wider">Potential Savings/Year</p>
              <p className="text-2xl font-bold mt-1 text-loop">
                <AnimatedNumber value={data.summary.annualSavings} format={formatCurrencyAnim} />
              </p>
            </motion.div>
          </div>

          {/* Charts */}
          <ProjectionCharts summary={data.summary} plans={data.planComparison} />

          {/* Findings */}
          {data.findings.length > 0 && (
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
          )}

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

          {/* Plan Comparison */}
          {data.planComparison && data.planComparison.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-bold text-loop-deep mb-1">Your bank vs Loop</h4>
                <p className="text-sm text-text-muted">
                  This bank costs <span className="font-bold text-danger">{formatCurrency(data.summary.annualProjection)}/yr</span>. Here&apos;s what each Loop plan saves.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.planComparison.map((plan, i) => {
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
                          <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>Total Annual Cost</p>
                          <p className={`text-lg font-bold ${isRec ? "text-white" : "text-text"}`}>{formatCurrency(plan.annualCostOnPlan)}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${isRec ? "text-white/50" : "text-text-dim"}`}>You Save vs Bank</p>
                          <p className={`text-2xl font-bold ${plan.annualSavingsVsBank > 0 ? (isRec ? "text-[#C4F6C6]" : "text-loop") : "text-danger"}`}>
                            {plan.annualSavingsVsBank > 0 ? formatCurrency(plan.annualSavingsVsBank) : `-${formatCurrency(Math.abs(plan.annualSavingsVsBank))}`}
                          </p>
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
            </div>
          )}

          {/* Share + CTA */}
          <ShareReportButtons url={currentUrl} />

          <div className="text-center pt-4">
            <p className="text-text-muted mb-4">Want to audit your own bank statements?</p>
            <a
              href="/#tool"
              className="inline-flex items-center gap-2 px-8 py-3 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Run Your Free Audit <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-loop border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SharedReport />
    </Suspense>
  );
}
