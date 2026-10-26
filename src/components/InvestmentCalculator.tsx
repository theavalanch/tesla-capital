'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  PieChart,
} from 'lucide-react';

export default function InvestmentCalculator() {
  const [initialCapital, setInitialCapital] = useState(5000);
  const [targetPrice, setTargetPrice] = useState(850);
  const [years, setYears] = useState(3);
  const currentPrice = 462.78;

  const shares = initialCapital / currentPrice;
  const futureStockValue = shares * targetPrice;
  const annualEnergyYieldRate = 0.048; // 4.8% APY Megapack staking
  const totalYieldEarned = initialCapital * Math.pow(1 + annualEnergyYieldRate, years) - initialCapital;
  const totalProjectedValue = futureStockValue + totalYieldEarned;
  const netProfit = totalProjectedValue - initialCapital;
  const percentageGain = ((netProfit / initialCapital) * 100).toFixed(1);

  return (
    <div className="w-full rounded-3xl bg-[#090C12]/95 border border-white/10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-6 sm:p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E82127]/10 text-[#E82127] text-xs font-semibold border border-[#E82127]/20 mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tesla Equity & Energy Yield Projection
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Simulate your equity appreciation and Megapack grid yield based on autonomous scale.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-gray-400">
          <span>TSLA Base Price: <strong className="text-white">${currentPrice.toFixed(2)}</strong></span>
          <span>•</span>
          <span>Staking APY: <strong className="text-emerald-400">4.8%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Input Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Capital */}
          <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-300">Initial Capital</span>
              <span className="font-mono font-extrabold text-white text-base">
                ${initialCapital.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full accent-[#E82127] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>$500</span>
              <span>$25,000</span>
              <span>$50,000</span>
              <span>$100,000</span>
            </div>
          </div>

          {/* Slider 2: Target Price */}
          <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-300">Projected TSLA Price Target</span>
              <span className="font-mono font-extrabold text-emerald-400 text-base">
                ${targetPrice.toLocaleString()} / share
              </span>
            </div>
            <input
              type="range"
              min="465"
              max="1500"
              step="25"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>$465 (Baseline)</span>
              <span>$750 (Cybercab Scale)</span>
              <span>$1,000 (FSD Monopolization)</span>
              <span>$1,500 (Optimus TAM)</span>
            </div>
          </div>

          {/* Slider 3: Holding Timeframe */}
          <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-300">Investment Horizon</span>
              <span className="font-mono font-extrabold text-blue-400 text-base">
                {years} {years === 1 ? 'Year' : 'Years'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    years === y
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#141824] text-gray-400 hover:text-white'
                  }`}
                >
                  {y} {y === 1 ? 'Yr' : 'Yrs'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#10141E] border border-white/10 p-6 space-y-5">
          <div className="text-xs uppercase font-mono tracking-wider text-gray-400">
            Projected Valuation ({years}Y Horizon)
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white text-glow-red">
              ${totalProjectedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-4 h-4" />
              <span>+${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+{percentageGain}%)</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>TSLA Shares Owned:</span>
                <span className="font-mono text-white font-bold">{shares.toFixed(3)} TSLA</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Equity Growth:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${futureStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Megapack Staking Yield (4.8% APY):</span>
                <span className="font-mono text-blue-400 font-bold">
                  +${totalYieldEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#181D2A] overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, (initialCapital / totalProjectedValue) * 100)}%` }}
                className="h-full bg-white/20"
                title="Principal Capital"
              />
              <div
                style={{ width: `${Math.max(0, 100 - (initialCapital / totalProjectedValue) * 100)}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-[#E82127]"
                title="Projected Capital Appreciation"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>Principal: ${initialCapital.toLocaleString()}</span>
              <span>Appreciation: +${netProfit.toFixed(0)}</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="tesla-btn-red w-full py-3.5 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#E82127]/30"
          >
            <span>Lock In This Investment Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
