"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pb-20 overflow-hidden bg-white">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,70,57,0.06),transparent_60%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-tint mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-loop animate-pulse" />
          <span className="text-sm text-text-muted">Free FX Audit Tool</span>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-loop-deep">
          Your bank is{" "}
          <span className="text-danger">bleeding</span>
          <br />
          you dry.
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Canadian banks hide 2.5–3% markups on every foreign exchange transaction.
          Upload your bank statement and we&apos;ll show you exactly how much they&apos;re taking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#tool"
            className="group relative px-8 py-4 bg-loop hover:bg-loop-dark text-white font-semibold rounded-xl transition-all duration-300 animate-pulse-glow text-lg"
          >
            Upload Your Statement
          </a>
          <a
            href="#tool"
            className="px-8 py-4 border border-border hover:border-loop text-text-muted hover:text-loop rounded-xl transition-all duration-300 text-lg"
          >
            Calculate Manually
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-text-dim px-4"
        >
          No signup required. Your data stays private.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-5 h-5 text-text-dim" />
        </motion.div>
      </motion.div>
    </section>
  );
}
