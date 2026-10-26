'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ShieldCheck, Database, ArrowRight, CheckCircle2, Lock, DollarSign } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Open Your Investor Account',
      desc: 'Register in seconds with email verification and compliance identity validation.',
    },
    {
      num: '02',
      title: 'Fund Your Available Balance',
      desc: 'Submit a deposit request via Bank Wire, ACH, or Crypto USDT. Funds are held in segregated custodial accounts.',
    },
    {
      num: '03',
      title: 'Execute Real-Time TSLA Trades',
      desc: 'Place fractional market buy and sell orders with zero commissions and immediate double-entry ledger settlement.',
    },
    {
      num: '04',
      title: 'Withdraw With 72-Hour Target SLA',
      desc: 'Initiate payouts directly to your verified bank or crypto wallet with upfront fee transparency.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E82127]">
            Architecture & Mechanics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How The Platform Works</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            A real full-stack financial application governed by immutable double-entry ledger rules.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3 relative overflow-hidden"
            >
              <div className="text-3xl font-extrabold text-[#E82127]/30 font-mono">{s.num}</div>
              <h3 className="text-base font-bold text-white">{s.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture Box */}
        <div className="p-8 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 text-[#E82127]">
            <Database className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Server-Side Double-Entry Ledger Principles</h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            In compliance with strict financial platform guidelines, client balances are never computed ad-hoc in the browser. Every deposit, stock purchase, sale, dividend credit, or withdrawal generates an immutable ledger entry with previous and resulting balance snapshots, unique cryptographic transaction references, and strict audit logs.
          </p>
        </div>
      </main>
    </div>
  );
}
