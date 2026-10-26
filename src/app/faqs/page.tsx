'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';

export default function FaqsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I fund my investment account?',
      a: 'Navigate to the Deposit page from your dashboard. Choose your preferred funding method (Bank Wire Transfer, ACH Direct Debit, or Crypto USDT/BTC). Follow the on-screen escrow routing details and include your unique deposit reference. Once our operations desk matches the settlement, your cash balance is credited atomically.',
    },
    {
      q: 'How are share purchases and sales executed?',
      a: 'You can execute orders directly from the dashboard or the dedicated Trade page. Enter the desired number of shares or dollar amount. Our engine validates your available cash, records the trade, and updates your holdings and cost basis with zero commission fees.',
    },
    {
      q: 'What is the withdrawal processing timeline?',
      a: 'We maintain an operational processing target of 72 hours for all standard withdrawal requests. Once approved by our compliance desk, payouts are transmitted via federal wire or payment rails. All fees ($15 for wires, $0 for ACH) are deducted transparently from the payout amount.',
    },
    {
      q: 'Is my financial data secure?',
      a: 'Yes. All authentication utilizes salted bcrypt password hashing, encrypted JWT session cookies, and server-side role enforcement. Every balance change is preserved in an immutable double-entry ledger with cryptographic audit logging.',
    },
    {
      q: 'How do I contact customer support?',
      a: 'Every registered user has direct access to our two-way internal messaging system from the dashboard sidebar. Our administration desk reviews inquiries continuously and replies directly into your conversation thread.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E82127]">
            Knowledge Base & Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Answers to common questions regarding account management, trading, and funding.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between text-sm font-bold text-white hover:text-gray-200 transition-colors"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#E82127] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-8 rounded-3xl bg-[#0E1117] border border-white/5 text-center space-y-3">
          <h3 className="text-base font-bold text-white">Have a specific question or inquiry?</h3>
          <p className="text-xs text-gray-400">
            Speak directly with our administration and compliance desk through the encrypted messaging portal.
          </p>
          <div className="pt-2">
            <Link
              href="/messages"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold shadow-lg shadow-[#E82127]/25 transition-all"
            >
              <span>Open Support Chat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
