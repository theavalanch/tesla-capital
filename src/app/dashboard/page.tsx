'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import StockChart from '@/components/StockChart';
import TradeModal from '@/components/TradeModal';
import {
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [chartRange, setChartRange] = useState('1Y');
  const [stockMiniRange, setStockMiniRange] = useState('1D');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const fetchAllData = () => {
    // Current User
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // Portfolio
    fetch(`/api/portfolio?range=${chartRange}`)
      .then((res) => res.json())
      .then((data) => setPortfolioData(data))
      .catch((err) => console.error('Portfolio error:', err));

    // Market Quote
    fetch(`/api/market-data?range=${stockMiniRange}`)
      .then((res) => res.json())
      .then((data) => setMarketData(data))
      .catch((err) => console.error('Market error:', err));

    // Notifications
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAllData();
  }, [chartRange, stockMiniRange]);

  const handleMarkNotificationsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const quote = marketData?.quote || {
    price: 462.78,
    change: 12.64,
    changePercent: 2.81,
    open: 451.20,
    high: 468.32,
    low: 448.76,
    volume: '92.4M',
    marketCap: '$800.4B',
    peRatio: 162.4,
    eps: 2.41,
    week52Low: 138.80,
    week52High: 468.54,
    dividendYield: 0.0,
    beta: 2.12,
    lastUpdated: new Date().toISOString(),
  };

  const account = portfolioData?.account || {
    availableCash: 1245.00,
    investedCapital: 11417.13,
  };

  const position = portfolioData?.positions?.[0] || {
    shares: 26.98,
    averageCost: 423.17,
    marketValue: 12482.36,
    unrealizedPnl: 965.12,
    dailyGain: 341.12,
    dailyGainPercent: 2.81,
  };

  const totalPortfolioValue = portfolioData?.totalPortfolioValue || 12482.36;
  const displayName = user?.fullName || 'Jason Evans';
  const firstName = displayName.split(' ')[0] || 'Jason';

  return (
    <div className="flex min-h-screen bg-[#060709] text-[#F3F4F6]">
      {/* Sidebar */}
      <Sidebar
        unreadMessages={1}
        isAdmin={user?.role === 'ADMIN'}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar
          user={user || { fullName: 'Jason Evans', role: 'USER' }}
          notifications={notifications}
          onNotificationRead={handleMarkNotificationsRead}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner matching mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Good Morning, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Your Tesla investment dashboard
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/deposit"
                className="px-4 py-2 rounded-full bg-[#10141E] hover:bg-[#161C2B] border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
              >
                Deposit Funds
              </Link>
              <button
                onClick={() => {
                  setTradeType('BUY');
                  setIsTradeModalOpen(true);
                }}
                className="tesla-btn-red px-5 py-2 text-xs font-bold"
              >
                Trade TSLA
              </button>
            </div>
          </div>

          {/* TOP GRID: TSLA Stock Card & Portfolio Value */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TSLA Stock Card (Left Column) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E82127]/15 border border-[#E82127]/30 text-[#E82127] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(232,33,39,0.2)]">
                      T
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-gray-400">TSLA</div>
                      <div className="text-sm font-bold text-white">Tesla, Inc.</div>
                    </div>
                  </div>

                  {/* Range selectors for stock mini chart */}
                  <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#10141E] text-[11px]">
                    {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setStockMiniRange(r)}
                        className={`px-2 py-0.5 rounded-lg transition-colors ${
                          stockMiniRange === r
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display & Buttons */}
                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      ${quote.price.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-bold text-[#10B981] font-mono">
                        +{quote.change.toFixed(2)} (+{quote.changePercent}%)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        NASDAQ • As of Oct 20, 2026 4:00 PM (ET)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setTradeType('BUY');
                        setIsTradeModalOpen(true);
                      }}
                      className="px-5 py-2 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-bold shadow-md shadow-[#E82127]/30 transition-all transform hover:-translate-y-0.5"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => {
                        setTradeType('SELL');
                        setIsTradeModalOpen(true);
                      }}
                      className="px-5 py-2 rounded-full bg-[#10141E] hover:bg-[#161C2B] text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>

              {/* Mini Stock Chart */}
              <div className="my-3">
                <StockChart
                  data={marketData?.history || []}
                  height={135}
                  isPositive={quote.change >= 0}
                  showAxes={false}
                />
              </div>

              {/* Stock Details Footnotes */}
              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-white/[0.06] text-[11px]">
                <div>
                  <div className="text-gray-500">Open</div>
                  <div className="font-mono font-semibold text-white">${quote.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">High</div>
                  <div className="font-mono font-semibold text-white">${quote.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Low</div>
                  <div className="font-mono font-semibold text-white">${quote.low.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Volume</div>
                  <div className="font-mono font-semibold text-white">{quote.volume}</div>
                </div>
                <div>
                  <div className="text-gray-500">Market Cap</div>
                  <div className="font-mono font-semibold text-white">{quote.marketCap}</div>
                </div>
              </div>
            </div>

            {/* Portfolio Value Card (Right Column) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="text-xs font-mono text-gray-400">Portfolio Value</div>
                <div className="text-xs text-gray-500 mt-0.5">Total Value</div>

                <div className="mt-2 flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-[#10B981] font-mono">
                    +6.42% (24h)
                  </span>
                </div>
              </div>

              <div className="space-y-4 my-4">
                <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-400">Total Gain / Loss</div>
                    <div className="text-sm font-bold text-[#10B981] font-mono mt-0.5">
                      +${position.unrealizedPnl?.toFixed(2) || '965.12'} (+1.38%)
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/5">
                    <div className="text-[11px] text-gray-500">Holdings</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {position.shares} shares
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/5">
                    <div className="text-[11px] text-gray-500">Avg. Cost</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      ${position.averageCost?.toFixed(2) || '423.17'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-gray-400">Available Cash Balance</span>
                <span className="font-mono font-bold text-white">
                  ${account.availableCash.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: Portfolio Performance Chart & Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Portfolio Performance (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 sm:p-7 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Portfolio Performance</h2>
                  <p className="text-xs text-gray-400 font-mono">Historical Asset Trajectory</p>
                </div>

                <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#10141E] text-xs">
                  {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        chartRange === r
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="py-2">
                <StockChart
                  data={portfolioData?.performanceChart || []}
                  height={240}
                  isPositive={true}
                  showAxes={true}
                />
              </div>
            </div>

            {/* Key Metrics (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white mb-4">Key Metrics</h2>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-gray-400">P/E Ratio</span>
                    <span className="font-mono font-semibold text-white">{quote.peRatio}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-gray-400">EPS (TTM)</span>
                    <span className="font-mono font-semibold text-white">${quote.eps}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-gray-400">52 Week Range</span>
                    <span className="font-mono font-semibold text-white">
                      ${quote.week52Low} - ${quote.week52High}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Dividend Yield</span>
                    <span className="font-mono font-semibold text-white">{quote.dividendYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Beta</span>
                    <span className="font-mono font-semibold text-white">{quote.beta}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 mt-4 rounded-2xl bg-[#10141E] border border-white/5 text-[11px] text-gray-400">
                Data refreshed via NASDAQ simulation service. Execution is instantaneous with automated ledger verification.
              </div>
            </div>
          </div>

          {/* BOTTOM GRID: Recent Activity, Top News, Holdings, Promo Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Recent Activity (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">Recent Activity</h2>
                  <Link href="/transactions" className="text-xs text-[#E82127] hover:underline font-medium">
                    View All
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      title: 'Bought 5 Shares',
                      sub: 'TSLA • Oct 18, 2026',
                      amount: '-$2,315.90',
                      subAmount: '@ $463.18',
                      icon: ArrowDownLeft,
                      color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
                    },
                    {
                      title: 'Price Alert',
                      sub: 'TSLA reached $460.00 • Oct 18, 2026',
                      amount: '',
                      icon: Bell,
                      color: 'text-[#E82127] bg-[#E82127]/10 border border-[#E82127]/20',
                    },
                    {
                      title: 'Dividend Received',
                      sub: 'TSLA • Oct 5, 2026',
                      amount: '+$0.00',
                      subAmount: '(No dividend)',
                      icon: CheckCircle,
                      color: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',
                    },
                    {
                      title: 'Sold 2 Shares',
                      sub: 'TSLA • Sep 29, 2026',
                      amount: '+$925.36',
                      subAmount: '@ $462.68',
                      icon: ArrowUpRight,
                      color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
                    },
                  ].map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{act.title}</div>
                            <div className="text-[10px] text-gray-400">{act.sub}</div>
                          </div>
                        </div>

                        {act.amount && (
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">{act.amount}</div>
                            {act.subAmount && (
                              <div className="text-[10px] text-gray-500 font-mono">{act.subAmount}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link
                href="/transactions"
                className="mt-4 pt-3 border-t border-white/[0.06] text-center text-xs text-gray-400 hover:text-white transition-colors"
              >
                Download Statement (CSV) &rarr;
              </Link>
            </div>

            {/* Top News (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Top News</h2>
                <Link href="/news" className="text-xs text-[#E82127] hover:underline font-medium">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Tesla reports stronger-than-expected Q3 earnings, driven by energy and AI',
                    source: 'Reuters',
                    date: 'Oct 18, 2026',
                    tag: 'Earnings',
                  },
                  {
                    title: 'New Cybercab prototype impresses at Tesla AI Day 2026',
                    source: 'Bloomberg',
                    date: 'Oct 12, 2026',
                    tag: 'Autonomous',
                  },
                  {
                    title: 'Tesla energy storage deployments hit new quarterly record',
                    source: 'CNBC',
                    date: 'Oct 8, 2026',
                    tag: 'Energy',
                  },
                  {
                    title: 'Wall Street analysts raise Tesla price target after bullish delivery outlook',
                    source: 'MarketWatch',
                    date: 'Oct 5, 2026',
                    tag: 'Market',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-semibold text-gray-200 group-hover:text-white line-clamp-2 leading-snug">
                      {item.title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-gray-500">
                      <span className="font-medium text-gray-400">{item.source}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Holdings & Promo Banner (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Your Holdings Box */}
              <div className="rounded-3xl bg-[#0B0E14] border border-white/[0.07] p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-3">Your Holdings</h2>

                <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold text-xs">
                        T
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">TSLA</div>
                        <div className="text-[10px] text-gray-400">Tesla, Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">
                        ${position.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-[#10B981] font-mono font-semibold">
                        +${position.dailyGain?.toFixed(2)} (+{position.dailyGainPercent}%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
                    <div>
                      <span className="text-gray-500">Shares: </span>
                      <span className="font-mono text-white">{position.shares}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Avg Cost: </span>
                      <span className="font-mono text-white">${position.averageCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Card matching the mockup! */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0B0E14] p-5 shadow-xl group">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-3 relative">
                  <img
                    src="/images/promo-road.jpg"
                    alt="Tesla car driving on highway"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-white">More than a stock. It&apos;s a movement.</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Clean energy. Smarter technology. A sustainable tomorrow.
                  </p>
                  <button
                    onClick={() => {
                      setTradeType('BUY');
                      setIsTradeModalOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold text-[#E82127] hover:underline flex items-center space-x-1"
                  >
                    <span>Invest in Tesla</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        defaultType={tradeType}
        currentPrice={quote.price}
        availableCash={account.availableCash}
        ownedShares={position.shares}
        onTradeSuccess={fetchAllData}
      />
    </div>
  );
}
