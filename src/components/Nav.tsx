"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

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
          <div className="w-2 h-2 rounded-full bg-loop animate-pulse" />
          <span className="font-bold text-lg tracking-tight text-loop-deep">bleed</span>
          <span className="text-xs text-text-dim">by Loop</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#tool" className="text-sm text-text-muted hover:text-text transition-colors hidden sm:block">
            Audit Tool
          </a>
          <a
            href="https://bankonloop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 bg-loop hover:bg-loop-dark text-white rounded-lg transition-colors"
          >
            Switch to Loop
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
