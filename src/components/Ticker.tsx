"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const hardcodedStats = [
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
  const [liveStats, setLiveStats] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates?.USD) {
          const usdCad = (1 / data.rates.USD).toFixed(4);
          const bankUsd = (1 / data.rates.USD * 1.025).toFixed(4);
          const eurCad = (1 / data.rates.EUR).toFixed(4);
          setLiveStats([
            `Mid-market USD/CAD: ${usdCad}`,
            `Your bank charges ~2.5% on top → ${bankUsd}`,
            `Mid-market EUR/CAD: ${eurCad}`,
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const stats = [...liveStats, ...hardcodedStats, ...liveStats, ...hardcodedStats];

  return (
    <section ref={ref} className="py-4 border-y border-border-light overflow-hidden bg-loop-deep">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="flex animate-ticker whitespace-nowrap"
      >
        {stats.map((stat, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-sm text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green mr-3 shrink-0" />
            {stat}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
