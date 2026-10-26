'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StockChart from '@/components/StockChart';
import Link from 'next/link';
import { TrendingUp, BarChart2, DollarSign, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MarketPage() {
  const [range, setRange] = useState('1Y');
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/market-data?range=${range}`)
      .then((res) => res.json())
      .then((data) => setMarketData(data));
  }, [range]);

  const quote = marketData?.quote || {
    price: 462.78,
    change: 12.64,
    changePercent: 2.81,
    marketCap: '$800.4B',
    open: 451.20,
    high: 468.32,
    low: 448.76,
    volume: '92.4M',
    peRatio: 162.4,
    eps: 2.41,
    week52Low: 138.80,
    week52High: 468.54,
    beta: 2.12,
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#E82127] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E82127] animate-pulse" />
              <span>Real-Time Market Data Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Tesla, Inc. (NASDAQ: TSLA)</h1>
            <p className="text-sm text-gray-400 mt-1">
              Live quote, intraday price movements, valuation metrics, and historical performance.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold shadow-lg shadow-[#E82127]/25 transition-all self-start md:self-auto"
          >
            Trade TSLA Shares
          </Link>
        </div>

        {/* Large Market Performance Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1117] border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                ${quote.price.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-bold text-[#10B981] font-mono">
                  +{quote.change.toFixed(2)} (+{quote.changePercent}%) Today
                </span>
                <span className="text-xs text-gray-500">• NASDAQ Real-Time Feed</span>
              </div>
            </div>

            <div className="flex space-x-1.5 p-1 rounded-xl bg-[#141822] text-xs">
              {['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    range === r
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <StockChart
            data={marketData?.history || []}
            height={320}
            isPositive={quote.change >= 0}
            showAxes={true}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-6 border-t border-white/5 text-xs">
            <div>
              <div className="text-gray-500">Day Open</div>
              <div className="font-mono font-bold text-white mt-0.5">${quote.open.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Day High</div>
              <div className="font-mono font-bold text-white mt-0.5">${quote.high.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Day Low</div>
              <div className="font-mono font-bold text-white mt-0.5">${quote.low.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Volume</div>
              <div className="font-mono font-bold text-white mt-0.5">{quote.volume}</div>
            </div>
            <div>
              <div className="text-gray-500">P/E Ratio</div>
              <div className="font-mono font-bold text-white mt-0.5">{quote.peRatio}</div>
            </div>
            <div>
              <div className="text-gray-500">Market Cap</div>
              <div className="font-mono font-bold text-white mt-0.5">{quote.marketCap}</div>
            </div>
          </div>
        </div>

        {/* Corporate Profile & Valuation Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <h3 className="text-base font-bold text-white">Automotive EV Scale</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Global production volume exceeding 2M units annually across Fremont, Shanghai, Austin, and Berlin Gigafactories with industry-leading manufacturing margins.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <h3 className="text-base font-bold text-white">Megapack & Energy Storage</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Utility-scale energy storage deployments reaching unprecedented gigawatt-hour volumes, providing high-margin recurring infrastructure revenues.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3">
            <h3 className="text-base font-bold text-white">Autonomous Robotaxi & AI</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cybercab architecture, end-to-end neural network vision AI (FSD V13+), and Optimus general-purpose humanoid robots expanding total addressable market.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
