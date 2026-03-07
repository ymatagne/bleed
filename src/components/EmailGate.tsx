"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Mail, User, Building2, Check, AlertTriangle } from "lucide-react";

interface EmailGateProps {
  issuesCount: number;
  annualProjection: number;
  onUnlock: (lead: { name: string; email: string; company: string }) => void;
}

function formatCurrency(n: number) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

export default function EmailGate({ issuesCount, annualProjection, onUnlock }: EmailGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      onUnlock({ name, email, company });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Teaser stats */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-danger/10 border border-danger/20 mb-4"
        >
          <AlertTriangle className="w-4 h-4 text-danger" />
          <span className="text-sm font-semibold text-danger">Audit Complete</span>
        </motion.div>

        <h3 className="text-3xl sm:text-4xl font-bold text-loop-deep mb-3">
          We found <span className="text-danger">{issuesCount} issue{issuesCount !== 1 ? "s" : ""}</span> costing you
        </h3>
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-5xl sm:text-6xl font-bold text-danger"
        >
          {formatCurrency(annualProjection)}/yr
        </motion.p>
      </div>

      {/* Blurred preview placeholder */}
      <div className="relative mb-8 rounded-xl overflow-hidden">
        <div className="blur-md opacity-50 pointer-events-none select-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-border rounded-xl p-4 h-24" />
            ))}
          </div>
          <div className="bg-white border border-border rounded-xl p-4 h-48 mb-4" />
          <div className="bg-white border border-border rounded-xl p-4 h-32" />
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 text-loop mx-auto mb-2" />
            <p className="text-sm text-text-muted font-medium">Enter your email to unlock the full report</p>
          </div>
        </div>
      </div>

      {/* Email capture form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-md mx-auto bg-white border-2 border-loop/20 rounded-2xl p-6 shadow-lg"
      >
        <h4 className="text-lg font-bold text-loop-deep mb-1 text-center">Get your full report</h4>
        <p className="text-sm text-text-muted text-center mb-5">See every fee, recommendation, and savings plan.</p>

        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="email"
              placeholder="work@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Company name (optional)"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-loop/30 focus:border-loop"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-danger mt-2 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={submitting || !name.trim() || !email.trim()}
          className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-loop hover:bg-loop-dark disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Unlock Full Report <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-xs text-text-dim text-center mt-3">
          We&apos;ll also email you the PDF report. No spam, ever.
        </p>
      </motion.form>
    </motion.div>
  );
}
