"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useSignupModal } from "./SignupModalProvider";

interface StickyCTAProps {
  amount?: number;
}

function formatCurrency(n: number) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

export default function StickyCTA({ amount }: StickyCTAProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { openSignup } = useSignupModal();

  const displayAmount = amount || 12000;

  useEffect(() => {
    let lastScrollY = 0;

    const handler = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      if (scrollY > heroHeight && !dismissed) {
        setVisible(true);
      } else if (scrollY <= heroHeight * 0.5) {
        setVisible(false);
        setDismissed(false); // Reset dismiss when back at top
      }

      // Show again if user scrolls down after dismissing and passes hero again
      if (dismissed && scrollY > lastScrollY && scrollY > heroHeight * 1.5) {
        setDismissed(false);
        setVisible(true);
      }

      lastScrollY = scrollY;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[90] bg-[#01251e] border-t border-[#C4F6C6]/20 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg hidden sm:block">💸</span>
              <p className="text-white text-sm sm:text-base font-medium truncate">
                Stop losing <span className="text-[#C4F6C6] font-bold">{formatCurrency(displayAmount)}/yr</span> to your bank
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={openSignup}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#C4F6C6] text-[#004639] font-semibold rounded-xl hover:brightness-110 transition-all text-sm"
              >
                Open Free Account
                <ArrowRight className="w-4 h-4 hidden sm:block" />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-2 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
