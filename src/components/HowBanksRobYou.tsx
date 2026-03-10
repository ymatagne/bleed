"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "The Mid-Market Rate",
    desc: "There's a real exchange rate — the mid-market rate — that banks and institutions use to trade currencies between themselves. This is the fair rate.",
    visual: (
      <div className="font-mono text-center space-y-2">
        <p className="text-text-dim text-sm">USD/CAD Mid-Market Rate</p>
        <p className="text-4xl font-bold text-loop-deep">1.3520</p>
        <p className="text-text-dim text-xs">What the currency is actually worth</p>
      </div>
    ),
  },
  {
    num: "02",
    title: "The Bank's Markup",
    desc: "Your bank adds 2–3% on top of the real rate. They don't tell you this — they just show you \"their rate\" as if it's the market price. It's not.",
    visual: (
      <div className="font-mono text-center space-y-2">
        <p className="text-text-dim text-sm">What your bank shows you</p>
        <p className="text-4xl font-bold text-loop-deep">1.3858</p>
        <div className="flex items-center justify-center gap-2 text-danger">
          <span className="text-sm">+2.5% hidden markup</span>
          <span className="text-lg font-bold">= $338 in hidden fees</span>
        </div>
        <p className="text-text-dim text-xs">On a $13,520 conversion</p>
      </div>
    ),
  },
  {
    num: "03",
    title: "Wire & Transfer Fees",
    desc: "On top of the markup, they charge $25–$50 per wire transfer. And the receiving bank often takes a cut too. Fee on fee on fee.",
    visual: (
      <div className="font-mono text-center space-y-3">
        <div className="flex justify-between text-sm border-b border-border-light pb-2">
          <span className="text-text-dim">FX Markup</span>
          <span className="text-danger">$338.00</span>
        </div>
        <div className="flex justify-between text-sm border-b border-border-light pb-2">
          <span className="text-text-dim">Wire fee (sending)</span>
          <span className="text-danger">$40.00</span>
        </div>
        <div className="flex justify-between text-sm border-b border-border-light pb-2">
          <span className="text-text-dim">Wire fee (receiving)</span>
          <span className="text-danger">$15.00</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-loop-deep">Total hidden cost</span>
          <span className="text-danger">$393.00</span>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    title: "It Compounds",
    desc: "Do 10 transactions a month? That's nearly $4,000/month in hidden fees. Over a year, you're giving your bank the equivalent of a full-time employee's salary.",
    visual: (
      <div className="font-mono text-center space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-dim">Monthly</p>
            <p className="text-2xl font-bold text-danger">$3,930</p>
          </div>
          <div>
            <p className="text-text-dim">Annually</p>
            <p className="text-2xl font-bold text-danger">$47,160</p>
          </div>
        </div>
        <p className="text-xs text-text-dim">Based on 10 transactions/month at $13,520 avg.</p>
      </div>
    ),
  },
];

export default function HowBanksRobYou() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-loop-deep">
            How banks <span className="text-danger">mark up</span> every transaction.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            The markup is invisible by design. Here&apos;s how it works.
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <span className="text-loop font-mono text-sm">{step.num}</span>
                <h3 className="text-xl font-bold mt-1 mb-3 text-loop-deep">{step.title}</h3>
                <p className="text-text-muted leading-relaxed">{step.desc}</p>
              </div>
              <div className={`bg-surface border border-border rounded-xl p-6 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <a href="#tool" className="inline-flex items-center gap-2 text-loop hover:text-loop-dark transition-colors font-medium">
            See your real numbers <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
