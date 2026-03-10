"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignupModal } from "./SignupModalProvider";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openSignup } = useSignupModal();
  const pathname = usePathname();
  const router = useRouter();

  const handleCalculate = useCallback(() => {
    if (pathname === "/") {
      window.dispatchEvent(new Event("open-send-calculator"));
    } else {
      router.push("/?calculator=true");
    }
    setMobileOpen(false);
  }, [pathname, router]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = (
    <>
      <a href="/#tool" className="text-sm text-text-muted hover:text-text transition-colors" onClick={() => setMobileOpen(false)}>
        Audit Tool
      </a>
      <a href="/blog" className="text-sm text-text-muted hover:text-text transition-colors" onClick={() => setMobileOpen(false)}>
        Blog
      </a>
      <a href="/banks/rbc" className="text-sm text-text-muted hover:text-text transition-colors" onClick={() => setMobileOpen(false)}>
        Compare Banks
      </a>
      <button
        onClick={handleCalculate}
        className="text-sm px-3 py-1.5 border border-[#004639]/20 text-[#004639] rounded-lg hover:bg-[#C4F6C6]/30 transition-colors"
      >
        💸 Calculate
      </button>
    </>
  );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? "bg-white/95 backdrop-blur-xl border-b border-border-light shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Bleed by Loop — FX audit tool for Canadian businesses" className="h-7 w-auto" />
          <span className="font-bold text-lg tracking-tight text-loop-deep">bleed</span>
          <span className="text-xs text-text-dim">by Loop</span>
        </a>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks}
          <button
            onClick={openSignup}
            className="text-sm px-4 py-2 bg-loop hover:bg-loop-dark text-white rounded-lg transition-colors cursor-pointer"
          >
            Switch to Loop
          </button>
        </div>
        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={openSignup}
            className="text-sm px-3 py-1.5 bg-loop hover:bg-loop-dark text-white rounded-lg transition-colors cursor-pointer"
          >
            Switch to Loop
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 text-loop-deep">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-border-light"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
