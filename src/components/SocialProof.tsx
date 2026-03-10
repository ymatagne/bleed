"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jordan Kendal",
    role: "Founder",
    company: "Sheet Happens",
    quote: "We were losing thousands every month on FX conversions and didn't even know it. Loop made it transparent and cut our costs immediately. It's a no-brainer for any business paying international suppliers.",
    savings: "$38,000/yr",
  },
  {
    name: "Ben Kelly",
    role: "Owner",
    company: "Pure Muskoka",
    quote: "When we saw the audit of what our bank was actually charging us on USD conversions, we were furious. Switching to Loop took 20 minutes and saves us more than our accountant costs.",
    savings: "$24,000/yr",
  },
  {
    name: "Dante Timpano",
    role: "Founder",
    company: "DT Ecom",
    quote: "As an ecom business, FX is a massive part of our costs. The banks were taking 2.5% on every transaction and calling it 'the rate.' Loop charges a fraction of that. The savings are real.",
    savings: "$52,000/yr",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-loop-deep">
            They stopped the bleed.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Real businesses. Real savings. Real results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-loop text-loop" />
                ))}
              </div>
              <p className="text-text-muted leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 pt-4 border-t border-border-light flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-loop-deep">{t.name}</p>
                  <p className="text-xs text-text-dim">{t.role}, {t.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-loop">{t.savings}</p>
                  <p className="text-xs text-text-dim">saved</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
