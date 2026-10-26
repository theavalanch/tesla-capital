'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import StockChart from '@/components/StockChart';
import TradeModal from '@/components/TradeModal';
import {
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function TradePage() {
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [range, setRange] = useState('1D');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [defaultTradeType, setDefaultTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const refreshData = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => setPortfolio(data));

    fetch(`/api/market-data?range=${range}`)
      .then((res) => res.json())
      .then((data) => setMarketData(data));
  };

  useEffect(() => {
    refreshData();
  }, [range]);

  const quote = marketData?.quote || {
    price: 462.78,
    change: 12.64,
    changePercent: 2.81,
    open: 451.20,
    high: 468.32,
    low: 448.76,
    volume: '92.4M',
    marketCap: '$800.4B',
  };

  const account = portfolio?.account || { availableCash: 1245.00 };
  const position = portfolio?.positions?.[0] || { shares: 26.98, averageCost: 423.17 };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Tesla Trading Desk</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Execute fractional share market orders with instant server ledger settlement.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setDefaultTradeType('BUY');
                  setIsTradeModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-xs font-bold text-white shadow-lg shadow-[#E82127]/30 transition-all"
              >
                Buy TSLA
              </button>
              <button
                onClick={() => {
                  setDefaultTradeType('SELL');
                  setIsTradeModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#141822] hover:bg-[#1A202E] border border-white/10 text-xs font-bold text-white transition-all"
              >
                Sell TSLA
              </button>
            </div>
          </div>

          {/* TSLA Live Price Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1117] border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E82127]/20 border border-[#E82127]/30 text-[#E82127] flex items-center justify-center font-bold text-base">
                  T
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">Tesla, Inc.</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                      NASDAQ: TSLA
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Electric Vehicles, Solar Energy & AI Robotics
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="sm:text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  ${quote.price.toFixed(2)}
                </div>
                <div className="text-xs font-bold text-[#10B981] font-mono mt-0.5">
                  +{quote.change.toFixed(2)} (+{quote.changePercent}%) Today
                </div>
              </div>
            </div>

            {/* Timeframe Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Interactive Order Chart</span>
              <div className="flex space-x-1.5 p-1 rounded-xl bg-[#141822] text-xs">
                {['1D', '1W', '1M', '3M', '1Y'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setRange(t)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      range === t
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="py-2">
              <StockChart
                data={marketData?.history || []}
                height={260}
                isPositive={quote.change >= 0}
                showAxes={true}
              />
            </div>
          </div>

          {/* Account Balance & Holdings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400 font-medium">Available Cash to Trade</div>
              <div className="text-2xl font-bold text-white font-mono">
                ${account.availableCash.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500">FDIC-insured segregated custodial balance</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400 font-medium">TSLA Shares Owned</div>
              <div className="text-2xl font-bold text-white font-mono">
                {position.shares} shares
              </div>
              <div className="text-[11px] text-gray-500">Average Cost Basis: ${position.averageCost.toFixed(2)}</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400 font-medium">Brokerage Commission</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                $0.00 Free
              </div>
              <div className="text-[11px] text-gray-500">Zero commission trades for Tesla platform members</div>
            </div>
          </div>
        </main>
      </div>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        defaultType={defaultTradeType}
        currentPrice={quote.price}
        availableCash={account.availableCash}
        ownedShares={position.shares}
        onTradeSuccess={refreshData}
      />
    </div>
  );
}
