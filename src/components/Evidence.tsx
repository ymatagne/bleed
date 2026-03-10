"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const stats = [
  { value: "$8.2B", label: "FX revenue earned by Canada's Big 5 banks in 2023" },
  { value: "2.5%", label: "Average hidden markup on retail FX transactions" },
  { value: "73%", label: "of SMBs don't know their bank's FX markup" },
  { value: "$0", label: "What banks disclose about their FX spread" },
];

const quotes = [
  {
    text: "Banks are not required to disclose the markup they apply to foreign exchange rates for retail customers.",
    source: "Financial Consumer Agency of Canada",
  },
  {
    text: "The lack of transparency in foreign exchange pricing means most small businesses are unaware of the true cost of their international transactions.",
    source: "Canadian Federation of Independent Business, 2023 Report",
  },
  {
    text: "Foreign exchange revenue represents one of the most profitable and least understood fee categories for Canadian banks.",
    source: "Bank of Canada Financial System Review",
  },
];

export default function Evidence() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-loop-deep">
            The evidence is <span className="text-danger">overwhelming</span>.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            This isn&apos;t a conspiracy theory. These are publicly available numbers the banks hope you never look at.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-border rounded-xl p-6 text-center"
            >
              <p className="text-3xl sm:text-4xl font-bold text-loop">{stat.value}</p>
              <p className="text-sm text-text-muted mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          {quotes.map((quote, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white border border-border rounded-xl p-6 relative"
            >
              <Quote className="w-8 h-8 text-loop/15 absolute top-4 right-4" />
              <p className="text-text-muted leading-relaxed italic pr-10">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-sm text-text-dim mt-3">— {quote.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
