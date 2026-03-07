"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useSignupModal } from "./SignupModalProvider";

export default function StickyCTA() {
  const { openSignup } = useSignupModal();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 600;
    if (scrolled && !dismissed) {
      setVisible(true);
    }
  }, [dismissed]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    // Come back after 30s
    setTimeout(() => {
      setDismissed(false);
      if (window.scrollY > 600) setVisible(true);
    }, 30000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#01251e] border-t border-[#C4F6C6]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-white/80 text-sm sm:text-base font-medium hidden sm:block">
              Your bank is costing you. <span className="text-[#C4F6C6] font-bold">Open a free Loop account</span>
            </p>
            <p className="text-white/80 text-sm font-medium sm:hidden">
              Stop overpaying your bank.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={openSignup}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C4F6C6] text-[#004639] font-semibold rounded-xl hover:brightness-110 transition-all text-sm"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
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
