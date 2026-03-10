"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSignupModal } from "./SignupModalProvider";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { openSignup } = useSignupModal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-border-light shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Bleed by Loop — FX audit tool for Canadian businesses" className="h-7 w-auto" />
          <span className="font-bold text-lg tracking-tight text-loop-deep">bleed</span>
          <span className="text-xs text-text-dim">by Loop</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#tool" className="text-sm text-text-muted hover:text-text transition-colors hidden sm:block">
            Audit Tool
          </a>
          <a href="/blog" className="text-sm text-text-muted hover:text-text transition-colors hidden sm:block">
            Blog
          </a>
          <button
            onClick={() => window.dispatchEvent(new Event("open-send-calculator"))}
            className="text-sm px-3 py-1.5 border border-[#004639]/20 text-[#004639] rounded-lg hover:bg-[#C4F6C6]/30 transition-colors hidden sm:block"
          >
            💸 Calculate
          </button>
          <button
            onClick={openSignup}
            className="text-sm px-4 py-2 bg-loop hover:bg-loop-dark text-white rounded-lg transition-colors cursor-pointer"
          >
            Switch to Loop
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
