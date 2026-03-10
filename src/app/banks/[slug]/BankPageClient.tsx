"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Bank {
  slug: string;
  name: string;
  fullName: string;
  markup: number;
  color: string;
  description: string;
}

export default function BankPageClient({
  bank,
  otherBanks,
}: {
  bank: Bank;
  otherBanks: Bank[];
}) {
  const [amount, setAmount] = useState(10000);

  const hiddenFee = amount * (bank.markup / 100);
  const yearlyFee = hiddenFee * 12;

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-extrabold text-loop-deep leading-tight mb-6"
        >
          How Much Does {bank.name} Really Charge You for Foreign Exchange?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-text-muted max-w-2xl"
        >
          {bank.description}
        </motion.p>
      </section>

      {/* Markup stat */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-surface rounded-2xl p-8 sm:p-12 border border-border-light">
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-7xl font-extrabold text-loop-deep mb-2">
              ~{bank.markup}%
            </div>
            <div className="text-text-muted text-lg">
              Average FX markup by {bank.fullName}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 border border-border-light">
              <div className="text-sm text-text-dim mb-1">On $1,000 USD</div>
              <div className="text-xl font-bold text-danger">
                ${(1000 * bank.markup / 100).toFixed(0)} hidden
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border-light">
              <div className="text-sm text-text-dim mb-1">On $10,000 USD</div>
              <div className="text-xl font-bold text-danger">
                ${(10000 * bank.markup / 100).toFixed(0)} hidden
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border-light">
              <div className="text-sm text-text-dim mb-1">On $100,000 USD</div>
              <div className="text-xl font-bold text-danger">
                ${(100000 * bank.markup / 100).toFixed(0)} hidden
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-loop-deep mb-6">
          Calculate Your Hidden {bank.name} FX Fees
        </h2>
        <div className="bg-surface-tint rounded-2xl p-8 border border-border-light">
          <label className="block text-sm font-medium text-text-muted mb-2">
            Monthly USD conversion amount
          </label>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-text-dim text-lg">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="flex-1 bg-white border border-border rounded-lg px-4 py-3 text-lg font-mono text-loop-deep focus:outline-none focus:ring-2 focus:ring-loop/30"
            />
            <span className="text-text-dim">USD/month</span>
          </div>

          {/* Bank cost */}
          <div className="bg-white rounded-xl p-6 border-2 border-danger/20 mb-4">
            <div className="text-sm text-text-dim mb-1">
              Yearly cost at {bank.name}
            </div>
            <div className="text-4xl font-extrabold text-danger">
              ${yearlyFee.toLocaleString("en-CA", { maximumFractionDigits: 0 })}/yr
            </div>
            <div className="text-xs text-text-dim mt-1">
              {bank.markup}% markup × ${amount.toLocaleString("en-CA")} × 12 months
            </div>
          </div>

          {/* Loop plans comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Basic", fee: 0, rate: 0.5 },
              { name: "Plus", fee: 79, rate: 0.25 },
              { name: "Power", fee: 299, rate: 0.10 },
            ].map((plan) => {
              const loopYearly = (amount * (plan.rate / 100) + plan.fee) * 12;
              return (
                <div key={plan.name} className="bg-white rounded-xl p-5 border border-border-light">
                  <div className="text-sm font-semibold text-loop-deep mb-1">Loop {plan.name}</div>
                  <div className="text-2xl font-extrabold text-loop-deep">
                    ${loopYearly.toLocaleString("en-CA", { maximumFractionDigits: 0 })}/yr
                  </div>
                  <div className="text-xs text-text-dim mt-1">
                    {plan.rate}% FX{plan.fee > 0 ? ` + $${plan.fee}/mo plan` : ", no plan fee"}
                  </div>
                  {yearlyFee - loopYearly > 0 && (
                    <div className="text-sm font-bold text-loop mt-2">
                      Save ${(yearlyFee - loopYearly).toLocaleString("en-CA", { maximumFractionDigits: 0 })}/yr
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-text-dim mt-4 text-center">
            Plus: domestic and international payments are free on all Loop plans — no wire fees, ever.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 mb-16 text-center">
        <div className="bg-loop rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            See Your Real {bank.name} FX Costs
          </h2>
          <p className="text-accent-green/80 mb-6 max-w-lg mx-auto">
            Upload your {bank.name} bank statement and our free audit tool will
            show you exactly how much you&apos;re losing to hidden FX markups.
          </p>
          <a
            href="/#tool"
            className="inline-block bg-white text-loop font-semibold px-8 py-3 rounded-lg hover:bg-accent-green transition-colors"
          >
            Audit My {bank.name} Statement →
          </a>
        </div>
      </section>

      {/* Compare other banks */}
      <section className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-loop-deep mb-6">
          Compare Other Banks
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {otherBanks.map((b) => (
            <a
              key={b.slug}
              href={`/banks/${b.slug}`}
              className="bg-surface rounded-xl p-4 border border-border-light hover:border-loop/30 transition-colors text-center"
            >
              <div className="font-bold text-loop-deep text-lg">{b.name}</div>
              <div className="text-danger font-mono text-sm">~{b.markup}%</div>
              <div className="text-xs text-text-dim mt-1">FX markup</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
