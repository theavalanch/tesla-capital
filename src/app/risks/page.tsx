'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react';

export default function RisksPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#E82127] uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Regulatory & Compliance Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Investment Risks & Legal Notice</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Essential disclosures concerning equity market risk, volatility, platform ownership, and custodial segregation.
          </p>
        </div>

        <div className="space-y-6 text-xs text-gray-300 leading-relaxed">
          {/* Disclosure Card 1 */}
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Scale className="w-4 h-4 text-[#E82127]" />
              <span>Independent Ownership & Trademark Disclaimer</span>
            </div>
            <p className="text-gray-400">
              This platform is an independent financial technology demonstration and does not falsely imply official sponsorship, endorsement, or direct corporate affiliation with Tesla, Inc. All trademarks and brand assets are the property of their respective owners.
            </p>
          </div>

          {/* Disclosure Card 2 */}
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Equity Market Risk & No Guaranteed Returns</span>
            </div>
            <p className="text-gray-400">
              Investing in common equity securities involves substantial risk of loss, including the possible loss of principal capital. Share prices can fluctuate significantly based on macroeconomic conditions, automotive delivery volumes, regulatory shifts, and technological competition. Past performance is no guarantee of future results.
            </p>
          </div>

          {/* Disclosure Card 3 */}
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transparent Processing Windows & Fee Policies</span>
            </div>
            <p className="text-gray-400">
              The 72-hour withdrawal window is a standard operational processing target, subject to federal banking clearance, AML verification, and intermediary bank settlement schedules. We never demand unexpected external payments, tax unlock fees, or surprise charges to release legitimate account funds.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
