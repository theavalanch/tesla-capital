'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Maximize2,
  RefreshCw,
  Sparkles,
  BarChart2,
} from 'lucide-react';

interface ChartPoint {
  time: string;
  price: number;
  volume: number;
}

export default function LiveTradingTerminal() {
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');
  const [currentPrice, setCurrentPrice] = useState(462.78);
  const [prevPrice, setPrevPrice] = useState(462.78);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderAmount, setOrderAmount] = useState('1000');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CHART' | 'ORDER_BOOK' | 'RECENT_TRADES'>('CHART');
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Generate realistic chart data based on timeframe
  const chartData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    const count = 36;
    let base = 448.0;
    const now = new Date();

    if (selectedRange === '1D') {
      base = 452.4;
      for (let i = 0; i < count; i++) {
        const hour = 9 + Math.floor((i * 6.5) / count);
        const minute = Math.floor(((i * 6.5) % 1) * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} EST`;
        const noise = Math.sin(i * 0.4) * 4.2 + (i / count) * 8.5 + (Math.sin(i * 1.5) * 1.8);
        const price = Number((base + noise).toFixed(2));
        const volume = Math.floor(120000 + Math.abs(Math.sin(i)) * 450000);
        points.push({ time: timeStr, price, volume });
      }
    } else if (selectedRange === '1W') {
      base = 432.0;
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      for (let i = 0; i < count; i++) {
        const dayIdx = Math.floor((i / count) * 5);
        const timeStr = `${days[dayIdx]} ${9 + (i % 7)}:00`;
        const price = Number((base + Math.sin(i * 0.3) * 12 + i * 0.85).toFixed(2));
        const volume = Math.floor(350000 + Math.random() * 500000);
        points.push({ time: timeStr, price, volume });
      }
    } else if (selectedRange === '1M') {
      base = 398.0;
      for (let i = 0; i < count; i++) {
        const day = i + 1;
        const timeStr = `Oct ${day}`;
        const price = Number((base + (i * 1.8) + Math.sin(i * 0.5) * 14).toFixed(2));
        const volume = Math.floor(400000 + Math.random() * 600000);
        points.push({ time: timeStr, price, volume });
      }
    } else if (selectedRange === '1Y') {
      base = 248.0;
      const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      for (let i = 0; i < count; i++) {
        const mIdx = Math.floor((i / count) * 12);
        const timeStr = `${months[mIdx]} 2026`;
        const price = Number((base + (i * 6.0) + Math.sin(i * 0.6) * 22).toFixed(2));
        const volume = Math.floor(800000 + Math.random() * 1200000);
        points.push({ time: timeStr, price, volume });
      }
    } else {
      // ALL
      base = 85.0;
      for (let i = 0; i < count; i++) {
        const year = 2021 + Math.floor((i / count) * 5);
        const timeStr = `Q${(i % 4) + 1} ${year}`;
        const price = Number((base + Math.pow(i * 0.75, 1.7) + Math.sin(i * 0.8) * 35).toFixed(2));
        const volume = Math.floor(1200000 + Math.random() * 2000000);
        points.push({ time: timeStr, price, volume });
      }
    }

    // Set the latest point to currentPrice
    if (points.length > 0) {
      points[points.length - 1].price = currentPrice;
    }
    return points;
  }, [selectedRange, currentPrice]);

  // Live real-time tick engine simulating sub-second NASDAQ ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.45; // slight upward drift
        const next = Number(Math.max(450, prev + delta).toFixed(2));
        setPrevPrice(prev);
        setPriceFlash(next >= prev ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 600);
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const priceChange = Number((currentPrice - 450.14).toFixed(2));
  const percentChange = Number(((priceChange / 450.14) * 100).toFixed(2));
  const isPositive = priceChange >= 0;

  // Order Book simulated data
  const orderBook = useMemo(() => {
    const bids = [
      { price: (currentPrice - 0.05).toFixed(2), shares: 420, total: 194367 },
      { price: (currentPrice - 0.12).toFixed(2), shares: 850, total: 393240 },
      { price: (currentPrice - 0.25).toFixed(2), shares: 1240, total: 573542 },
      { price: (currentPrice - 0.40).toFixed(2), shares: 2500, total: 1156000 },
      { price: (currentPrice - 0.55).toFixed(2), shares: 3100, total: 1432820 },
    ];
    const asks = [
      { price: (currentPrice + 0.05).toFixed(2), shares: 380, total: 175896 },
      { price: (currentPrice + 0.15).toFixed(2), shares: 720, total: 333288 },
      { price: (currentPrice + 0.28).toFixed(2), shares: 1450, total: 671295 },
      { price: (currentPrice + 0.45).toFixed(2), shares: 2100, total: 972300 },
      { price: (currentPrice + 0.60).toFixed(2), shares: 4800, total: 2223840 },
    ];
    return { bids, asks };
  }, [currentPrice]);

  // Recent simulated trades
  const recentTrades = useMemo(() => [
    { time: '14:48:22', price: currentPrice.toFixed(2), size: '45.00', side: 'BUY' },
    { time: '14:48:19', price: (currentPrice - 0.04).toFixed(2), size: '120.00', side: 'BUY' },
    { time: '14:48:15', price: (currentPrice - 0.08).toFixed(2), size: '18.50', side: 'SELL' },
    { time: '14:48:02', price: (currentPrice - 0.02).toFixed(2), size: '310.00', side: 'BUY' },
    { time: '14:47:51', price: (currentPrice - 0.11).toFixed(2), size: '82.00', side: 'SELL' },
    { time: '14:47:40', price: (currentPrice - 0.15).toFixed(2), size: '250.00', side: 'BUY' },
  ], [currentPrice]);

  // Order calculator
  const numericAmount = parseFloat(orderAmount) || 0;
  const estimatedShares = numericAmount > 0 ? (numericAmount / currentPrice).toFixed(4) : '0.0000';

  const handleExecuteSimulatedTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;
    setOrderSuccess(
      `Order Executed: ${orderType} ${estimatedShares} TSLA @ $${currentPrice.toFixed(2)} ($${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})`
    );
    setTimeout(() => setOrderSuccess(null), 5000);
  };

  // SVG Chart Dimensions & Rendering
  const svgWidth = 860;
  const svgHeight = 280;
  const paddingX = 20;
  const paddingY = 30;
  const chartUsableWidth = svgWidth - paddingX * 2;
  const chartUsableHeight = svgHeight - paddingY * 2;

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const getX = (index: number) => paddingX + (index / (chartData.length - 1)) * chartUsableWidth;
  const getY = (val: number) => svgHeight - paddingY - ((val - minPrice) / priceRange) * chartUsableHeight;

  // Path generation
  const pathD = chartData.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.price);
    return `${acc} ${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${getX(chartData.length - 1).toFixed(1)} ${svgHeight - paddingY} L ${getX(0).toFixed(1)} ${svgHeight - paddingY} Z`;

  return (
    <div className="w-full rounded-3xl bg-[#090C12]/95 border border-white/10 shadow-[0_30px_100px_-20px_rgba(232,33,39,0.25)] backdrop-blur-2xl overflow-hidden">
      {/* Top Cockpit Header Bar */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
        {/* Symbol & Live Price */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-[#E82127]/15 border border-[#E82127]/30 text-[#E82127] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(232,33,39,0.25)]">
            TSLA
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-mono text-gray-400 font-semibold">
                Tesla, Inc. • NASDAQ
              </span>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE FEED</span>
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono transition-colors duration-300 ${
                  priceFlash === 'up'
                    ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : priceFlash === 'down'
                    ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                    : 'text-white'
                }`}
              >
                ${currentPrice.toFixed(2)}
              </span>

              <div
                className={`flex items-center space-x-1 text-xs sm:text-sm font-semibold font-mono px-2 py-0.5 rounded-md ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}
                  {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
                  {percentChange}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Range Selectors & Tab Controls */}
        <div className="flex items-center space-x-2">
          {/* Timeframe Buttons */}
          <div className="flex items-center bg-[#10141E] p-1 rounded-xl border border-white/5 text-xs font-mono">
            {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === range
                    ? 'bg-[#E82127] text-white font-bold shadow-md shadow-[#E82127]/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* View Tab Toggle */}
          <div className="hidden sm:flex items-center bg-[#10141E] p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setActiveTab('CHART')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'CHART' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setActiveTab('ORDER_BOOK')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'ORDER_BOOK' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>
            <button
              onClick={() => setActiveTab('RECENT_TRADES')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'RECENT_TRADES' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tape</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Cockpit Body: Split Chart / Order Book + Quick Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        {/* Left Side: Chart / Market Data (8 Cols) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between">
          {activeTab === 'CHART' && (
            <div className="space-y-4">
              {/* Chart Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase font-mono">Day Range</div>
                  <div className="font-mono font-bold text-gray-200 mt-0.5">$448.20 - $468.90</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase font-mono">24h Volume</div>
                  <div className="font-mono font-bold text-gray-200 mt-0.5">92,481,200 TSLA</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase font-mono">Market Cap</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">$800.4 Billion</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase font-mono">Execution SLA</div>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">&lt; 15ms Latency</div>
                </div>
              </div>

              {/* Interactive SVG Chart Canvas */}
              <div className="relative w-full h-[280px] bg-[#07090E]/60 rounded-2xl p-2 border border-white/5 overflow-hidden">
                {/* Floating Tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-3 left-4 z-20 px-3 py-1.5 rounded-xl bg-[#141822]/95 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-none">
                    <div className="text-[10px] text-gray-400 font-mono">{hoveredPoint.time}</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      ${hoveredPoint.price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Vol: {hoveredPoint.volume.toLocaleString()}
                    </div>
                  </div>
                )}

                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#10B981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
                    const y = paddingY + ratio * chartUsableHeight;
                    const val = maxPrice - ratio * priceRange;
                    return (
                      <g key={i}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="rgba(255,255,255,0.04)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={svgWidth - paddingX - 4}
                          y={y - 4}
                          fill="#4B5563"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          ${val.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill */}
                  <path d={areaD} fill="url(#chartGradient)" />

                  {/* Stroke Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Volume Histogram Bars at bottom */}
                  {chartData.map((pt, i) => {
                    const barWidth = (chartUsableWidth / chartData.length) * 0.55;
                    const barHeight = (pt.volume / 2000000) * 45;
                    const x = getX(i) - barWidth / 2;
                    const y = svgHeight - paddingY - barHeight;
                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#10B981"
                        opacity="0.18"
                        rx="1"
                      />
                    );
                  })}

                  {/* Interactive Crosshair Points */}
                  {chartData.map((pt, i) => {
                    const x = getX(i);
                    const y = getY(pt.price);
                    const isHovered = hoveredPoint === pt;

                    return (
                      <g key={`pt-${i}`}>
                        <rect
                          x={x - chartUsableWidth / chartData.length / 2}
                          y="0"
                          width={chartUsableWidth / chartData.length}
                          height={svgHeight}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredPoint(pt)}
                        />
                        {isHovered && (
                          <>
                            <line
                              x1={x}
                              y1={paddingY}
                              x2={x}
                              y2={svgHeight - paddingY}
                              stroke="rgba(255,255,255,0.25)"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="animate-pulse"
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {activeTab === 'ORDER_BOOK' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5 font-mono">
                <span>PRICE (USD)</span>
                <span>SHARES (TSLA)</span>
                <span>TOTAL (USD)</span>
              </div>
              <div className="space-y-1">
                {orderBook.asks.map((a, i) => (
                  <div key={`ask-${i}`} className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-red-500/[0.04]">
                    <span className="text-red-400 font-bold">${a.price}</span>
                    <span className="text-gray-300">{a.shares}</span>
                    <span className="text-gray-400">${a.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="py-2 text-center text-xs font-mono font-bold text-white bg-white/5 rounded-lg border border-white/10">
                SPREAD: $0.10 (0.02%) • NASDAQ EQUITIES
              </div>
              <div className="space-y-1">
                {orderBook.bids.map((b, i) => (
                  <div key={`bid-${i}`} className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-emerald-500/[0.04]">
                    <span className="text-emerald-400 font-bold">${b.price}</span>
                    <span className="text-gray-300">{b.shares}</span>
                    <span className="text-gray-400">${b.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'RECENT_TRADES' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5 font-mono">
                <span>TIMESTAMP</span>
                <span>PRICE</span>
                <span>SIZE (TSLA)</span>
                <span>SIDE</span>
              </div>
              {recentTrades.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono py-1.5 px-3 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-500">{t.time}</span>
                  <span className="text-white font-bold">${t.price}</span>
                  <span className="text-gray-300">{t.size}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {t.side}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Security / Execution Micro-Guarantee */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-4 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Double-entry ledger verified • Zero phantom slippage</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-gray-500">
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Sub-millisecond NASDAQ routing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Buy/Sell Order Ticket (4 Cols) */}
        <div className="lg:col-span-4 p-6 bg-[#0B0E15]/80 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#E82127]" />
                <span>Instant Execution Desk</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">0% Commission</span>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#10141E] border border-white/5">
              <button
                type="button"
                onClick={() => setOrderType('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderType === 'BUY'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                BUY TSLA
              </button>
              <button
                type="button"
                onClick={() => setOrderType('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderType === 'SELL'
                    ? 'bg-[#E82127] text-white shadow-lg shadow-[#E82127]/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                SELL TSLA
              </button>
            </div>

            {orderSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{orderSuccess}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleExecuteSimulatedTrade} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-mono text-gray-400 mb-1.5">
                  Investment Capital (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#E82127] transition-all"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Quick Capital Preset Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {['250', '500', '1000', '5000'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setOrderAmount(chip)}
                    className={`py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      orderAmount === chip
                        ? 'bg-white/10 border-white/20 text-white font-bold'
                        : 'bg-[#10141E] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    ${chip}
                  </button>
                ))}
              </div>

              {/* Calculation Summary */}
              <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Current Price:</span>
                  <span className="font-mono text-white">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Estimated Allocation:</span>
                  <span className="font-mono font-bold text-emerald-400">{estimatedShares} TSLA</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Trading Fee:</span>
                  <span className="font-mono text-emerald-400">$0.00 (Free)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Settlement:</span>
                  <span className="font-mono text-blue-400">Instant Double-Entry</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
                  orderType === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                    : 'bg-[#E82127] hover:bg-[#FF2E35] text-white shadow-[#E82127]/25'
                }`}
              >
                <span>Simulate {orderType} Order</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick link to live production dashboard */}
          <div className="pt-4 mt-4 border-t border-white/5 text-center">
            <Link
              href="/trade"
              className="text-xs text-gray-400 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Open full institutional trading desk</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E82127]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
