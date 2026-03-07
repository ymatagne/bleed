"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useSignupModal } from "./SignupModalProvider";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openSignup } = useSignupModal();

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden bg-loop-deep">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(153,229,253,0.08),transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
          Stop the bleed.
          <br />
          <span className="text-accent-green">Switch to Loop.</span>
        </h2>
        <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
          Join thousands of Canadian businesses that stopped overpaying their bank on foreign exchange. Setup takes 5 minutes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={openSignup}
            className="group px-8 py-4 bg-accent-green text-loop-deep font-semibold rounded-xl transition-all duration-300 hover:brightness-110 text-lg inline-flex items-center gap-2 cursor-pointer"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#tool"
            className="px-8 py-4 border border-white/20 hover:border-white/40 text-white/80 hover:text-white rounded-xl transition-all duration-300 text-lg"
          >
            Run the audit first
          </a>
        </div>
      </motion.div>
    </section>
  );
}
