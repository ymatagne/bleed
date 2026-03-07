"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Mail, MessageCircle, Linkedin, Share2, Smartphone } from "lucide-react";

interface ReferralChallengeProps {
  annualProjection: number;
  bankName: string;
}

function formatCurrency(n: number) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ReferralChallenge({ annualProjection, bankName }: ReferralChallengeProps) {
  const [copied, setCopied] = useState(false);

  const referralCode = useMemo(() => generateReferralCode(), []);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://bleed.bankonloop.com";
  const referralUrl = `${baseUrl}?ref=${referralCode}&fees=${Math.round(annualProjection)}`;

  const shareText = `I just found out my bank is charging me ${formatCurrency(annualProjection)}/yr in hidden fees. Think YOUR bank is any better? Run the free audit → `;
  const shareTextFull = shareText + referralUrl;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channels = [
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-700 hover:bg-gray-800",
      href: `mailto:?subject=${encodeURIComponent(`${bankName} is charging me ${formatCurrency(annualProjection)}/yr in hidden fees`)}&body=${encodeURIComponent(shareTextFull)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] hover:bg-[#1da851]",
      href: `https://wa.me/?text=${encodeURIComponent(shareTextFull)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] hover:bg-[#004182]",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: "X",
      icon: Share2,
      color: "bg-black hover:bg-neutral-800",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: "SMS",
      icon: Smartphone,
      color: "bg-blue-500 hover:bg-blue-600",
      href: `sms:?body=${encodeURIComponent(shareTextFull)}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#01251e] rounded-2xl p-6 sm:p-8 text-white"
    >
      <div className="text-center mb-6">
        <span className="text-3xl mb-3 block">🔥</span>
        <h4 className="text-xl sm:text-2xl font-bold mb-2">
          Think YOUR bank is bad?
        </h4>
        <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto">
          Challenge a business friend to run their own audit. See who&apos;s getting ripped off more.
        </p>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {channels.map(ch => (
          <a
            key={ch.name}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 ${ch.color} text-white text-sm font-medium rounded-lg transition-colors`}
          >
            <ch.icon className="w-4 h-4" />
            {ch.name}
          </a>
        ))}
      </div>

      {/* Copy link */}
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        <div className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 truncate font-mono">
          {referralUrl}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C4F6C6] text-[#004639] text-sm font-semibold rounded-lg hover:brightness-110 transition-all flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </motion.div>
  );
}
