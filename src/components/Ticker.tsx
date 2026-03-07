"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  "Canadian banks earned $8.2B in FX fees last year",
  "Average hidden markup: 2.5% per transaction",
  "SMBs lose $12,000–$48,000/year to FX fees",
  "Only 14% of businesses know their true FX cost",
  "Big 5 banks mark up FX rates by 200–300 basis points",
  "Wire transfer fees add $25–$50 per transaction",
  "Loop saves businesses up to 80% on FX",
  "Canadian banks earned $8.2B in FX fees last year",
  "Average hidden markup: 2.5% per transaction",
  "SMBs lose $12,000–$48,000/year to FX fees",
  "Only 14% of businesses know their true FX cost",
  "Big 5 banks mark up FX rates by 200–300 basis points",
  "Wire transfer fees add $25–$50 per transaction",
  "Loop saves businesses up to 80% on FX",
];

export default function Ticker() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-4 border-y border-border overflow-hidden bg-surface">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="flex animate-ticker whitespace-nowrap"
      >
        {stats.map((stat, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-sm text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-blood mr-3 shrink-0" />
            {stat}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
