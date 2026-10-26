'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import StockChart from '@/components/StockChart';
import TradeModal from '@/components/TradeModal';
import {
  PieChart,
  TrendingUp,
  Download,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function PortfolioPage() {
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [range, setRange] = useState('1Y');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const fetchPortfolio = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    fetch(`/api/portfolio?range=${range}`)
      .then((res) => res.json())
      .then((data) => setPortfolio(data));
  };

  useEffect(() => {
    fetchPortfolio();
  }, [range]);

  const account = portfolio?.account || { availableCash: 1245.00, investedCapital: 11417.13 };
  const position = portfolio?.positions?.[0] || {
    shares: 26.98,
    averageCost: 423.17,
    currentPrice: 462.78,
    marketValue: 12482.36,
    unrealizedPnl: 965.12,
    unrealizedPnlPercent: 8.45,
    dailyGain: 341.12,
  };

  const totalValue = portfolio?.totalPortfolioValue || 12482.36;
  const quote = portfolio?.quote || { price: 462.78, change: 12.64, changePercent: 2.81 };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Portfolio Overview</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Asset allocation, cost basis tracking, and performance trajectory.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/transactions"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1A202E] border border-white/10 text-xs font-semibold text-white transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Statement</span>
              </Link>
              <button
                onClick={() => {
                  setTradeType('BUY');
                  setIsTradeModalOpen(true);
                }}
                className="px-5 py-2 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-xs font-semibold text-white shadow-lg shadow-[#E82127]/25 transition-all"
              >
                Trade TSLA
              </button>
            </div>
          </div>

          {/* Portfolio Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400">Total Portfolio Value</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-[#10B981] font-mono font-semibold">+6.42% (24h)</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400">Unrealized Capital Gains</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono">
                +${position.unrealizedPnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 font-mono">+{position.unrealizedPnlPercent}% overall return</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400">Available Liquid Cash</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${account.availableCash.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Ready for instant orders</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2">
              <div className="text-xs text-gray-400">Invested Capital</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${account.investedCapital.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 font-mono">Principal deployed</div>
            </div>
          </div>

          {/* Performance Area Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Historical Performance Curve</h2>
                <p className="text-xs text-gray-400">Tracking equity curve and re-invested earnings</p>
              </div>

              <div className="flex space-x-1.5 p-1 rounded-xl bg-[#141822] text-xs">
                {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => (
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

            <div className="py-2">
              <StockChart
                data={portfolio?.performanceChart || []}
                height={260}
                isPositive={true}
                showAxes={true}
              />
            </div>
          </div>

          {/* Holdings Breakdown Table */}
          <div className="rounded-3xl bg-[#0E1117] border border-white/5 p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">Active Equity Positions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                    <th className="py-3 px-4">Asset Symbol</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4 text-right">Shares Owned</th>
                    <th className="py-3 px-4 text-right">Avg Cost Basis</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">Market Value</th>
                    <th className="py-3 px-4 text-right">Unrealized Gain/Loss</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-mono font-bold text-[#E82127]">TSLA</td>
                    <td className="py-4 px-4 font-semibold text-white">Tesla, Inc.</td>
                    <td className="py-4 px-4 text-right font-mono text-white">{position.shares}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-300">${position.averageCost.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-white">${quote.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ${position.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#10B981]">
                      +${position.unrealizedPnl.toFixed(2)} (+{position.unrealizedPnlPercent}%)
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setTradeType('BUY');
                          setIsTradeModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#E82127]/20 text-[#E82127] font-semibold hover:bg-[#E82127]/30 transition-colors"
                      >
                        Buy More
                      </button>
                      <button
                        onClick={() => {
                          setTradeType('SELL');
                          setIsTradeModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        defaultType={tradeType}
        currentPrice={quote.price}
        availableCash={account.availableCash}
        ownedShares={position.shares}
        onTradeSuccess={fetchPortfolio}
      />
    </div>
  );
}
