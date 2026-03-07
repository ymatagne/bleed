"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  totalFeesFound: number;
  totalFxMarkups: number;
  totalAccountFees: number;
  totalWireFees: number;
  totalOtherFees: number;
  annualProjection: number;
  loopAnnualCost: number;
  annualSavings: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = {
  bank: "#dc2626",
  loop: "#004639",
  loopDeep: "#01251e",
  accentGreen: "#C4F6C6",
  accentBlue: "#99E5FD",
};

function MonthlyBarChart({ data }: { data: ChartData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const monthlyBank = data.annualProjection / 12;
  const monthlyLoop = data.loopAnnualCost / 12;
  const max = monthlyBank * 1.15;

  return (
    <div ref={ref} className="bg-white border border-border rounded-xl p-5">
      <h5 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-4">Monthly Cost Comparison</h5>
      <div className="flex items-end gap-1.5 sm:gap-2 h-48">
        {MONTHS.map((m, i) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex gap-px w-full items-end flex-1">
              <motion.div
                className="flex-1 rounded-t-sm bg-danger"
                style={{ minWidth: 4 }}
                initial={{ height: 0 }}
                animate={inView ? { height: `${(monthlyBank / max) * 100}%` } : { height: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
              <motion.div
                className="flex-1 rounded-t-sm bg-loop"
                style={{ minWidth: 4 }}
                initial={{ height: 0 }}
                animate={inView ? { height: `${(monthlyLoop / max) * 100}%` } : { height: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
              />
            </div>
            <span className="text-[10px] text-text-dim">{m}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-text-dim">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" /> Your Bank</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-loop inline-block" /> Loop</span>
      </div>
    </div>
  );
}

function CumulativeLineChart({ data }: { data: ChartData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const monthlyBank = data.annualProjection / 12;
  const monthlyLoop = data.loopAnnualCost / 12;

  const w = 300, h = 160, px = 30, py = 10;
  const plotW = w - px, plotH = h - py * 2;
  const maxVal = monthlyBank * 12 * 1.1;

  const bankPoints = MONTHS.map((_, i) => {
    const x = px + (i / 11) * plotW;
    const y = py + plotH - ((monthlyBank * (i + 1)) / maxVal) * plotH;
    return `${x},${y}`;
  });
  const loopPoints = MONTHS.map((_, i) => {
    const x = px + (i / 11) * plotW;
    const y = py + plotH - ((monthlyLoop * (i + 1)) / maxVal) * plotH;
    return `${x},${y}`;
  });

  const bankPath = `M ${bankPoints.join(" L ")}`;
  const loopPath = `M ${loopPoints.join(" L ")}`;

  return (
    <div ref={ref} className="bg-white border border-border rounded-xl p-5">
      <h5 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-4">Cumulative Fees Over 12 Months</h5>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1={px} x2={w} y1={py + plotH * (1 - pct)} y2={py + plotH * (1 - pct)} stroke="#e5e7eb" strokeWidth={0.5} />
        ))}
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((pct) => (
          <text key={pct} x={px - 3} y={py + plotH * (1 - pct) + 3} fontSize={7} fill="#9ca3af" textAnchor="end">
            {formatCurrency(maxVal * pct)}
          </text>
        ))}
        {/* Bank line */}
        <motion.path
          d={bankPath}
          fill="none"
          stroke={COLORS.bank}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={1000}
          initial={{ strokeDashoffset: 1000 }}
          animate={inView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1000 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Loop line */}
        <motion.path
          d={loopPath}
          fill="none"
          stroke={COLORS.loop}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={1000}
          initial={{ strokeDashoffset: 1000 }}
          animate={inView ? { strokeDashoffset: 0 } : { strokeDashoffset: 1000 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
        {/* Month labels */}
        {MONTHS.filter((_, i) => i % 2 === 0).map((m, idx) => {
          const i = idx * 2;
          return (
            <text key={m} x={px + (i / 11) * plotW} y={h - 1} fontSize={7} fill="#9ca3af" textAnchor="middle">{m}</text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs text-text-dim">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" /> Your Bank</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-loop inline-block" /> Loop</span>
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: ChartData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const total = data.totalFeesFound || 1;

  const segments = [
    { label: "Account Fees", value: data.totalAccountFees, color: COLORS.loop },
    { label: "FX Markups", value: data.totalFxMarkups, color: COLORS.loopDeep },
    { label: "Wire Fees", value: data.totalWireFees, color: COLORS.accentBlue },
    { label: "Other Fees", value: data.totalOtherFees, color: "#6b9e8a" },
  ].filter((s) => s.value > 0);

  const r = 60, stroke = 16, circumference = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <div ref={ref} className="bg-white border border-border rounded-xl p-5">
      <h5 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-4">Fee Breakdown</h5>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 160 160" className="w-32 h-32 flex-shrink-0">
          {segments.map((seg) => {
            const pct = seg.value / total;
            const dashLen = pct * circumference;
            const offset = -accumulated * circumference + circumference * 0.25;
            accumulated += pct;
            return (
              <motion.circle
                key={seg.label}
                cx={80} cy={80} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            );
          })}
          <text x={80} y={76} textAnchor="middle" fontSize={14} fontWeight="bold" fill={COLORS.loopDeep}>
            {formatCurrency(total)}
          </text>
          <text x={80} y={92} textAnchor="middle" fontSize={8} fill="#9ca3af">total fees</text>
        </svg>
        <div className="space-y-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-text-muted">{seg.label}</span>
              <span className="font-semibold text-text ml-auto">{Math.round((seg.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectionCharts({ summary }: { summary: ChartData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MonthlyBarChart data={summary} />
      <CumulativeLineChart data={summary} />
      <DonutChart data={summary} />
    </div>
  );
}
