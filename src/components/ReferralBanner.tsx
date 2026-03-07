"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function formatCurrency(n: number) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

export default function ReferralBanner() {
  const [fees, setFees] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const feesParam = params.get("fees");
    if (ref && feesParam) {
      setFees(parseInt(feesParam, 10));
    }
  }, []);

  if (!fees || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-16 left-0 right-0 z-40 bg-danger text-white"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-center flex-1">
            🔥 Your friend found <span className="font-bold">{formatCurrency(fees)}</span> in hidden fees. What about you?{" "}
            <a href="#tool" className="underline font-bold">Run your free audit →</a>
          </p>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
