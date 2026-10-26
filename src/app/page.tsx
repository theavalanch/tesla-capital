'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Lock, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Layers, 
  ChevronRight, 
  Menu, 
  X, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface NotificationState {
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

interface OrderBookEntry {
  price: string;
  size: number;
  total: number;
}

interface AssetMetrics {
  price: number;
  change: number;
  marketCap: string;
  volume: string;
  sla: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TSLA' | 'CYBERCAB' | 'FLEET'>('TSLA');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesAmount, setSharesAmount] = useState('10');
  const [selectedRole, setSelectedRole] = useState('Institutional LP');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Simulated Market Data
  const [marketData, setMarketData] = useState<Record<'TSLA' | 'CYBERCAB' | 'FLEET', AssetMetrics>>({
    TSLA: { price: 462.78, change: 2.81, marketCap: '842.5B', volume: '34.2M', sla: '<12ms' },
    CYBERCAB: { price: 128.40, change: 5.14, marketCap: '120.8B', volume: '12.8M', sla: '<9ms' },
    FLEET: { price: 89.15, change: -0.62, marketCap: '45.2B', volume: '8.4M', sla: '<14ms' }
  });

  // Simulated Order Book State
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({ asks: [], bids: [] });

  // Generate realistic order book depth
  useEffect(() => {
    const basePrice = marketData[activeTab].price;
    const generateOrders = () => {
      const asks = Array.from({ length: 6 }, (_, i) => ({
        price: (basePrice + (i + 1) * 0.15).toFixed(2),
        size: Math.floor(Math.random() * 400) + 100,
        total: 0
      })).reverse();

      const bids = Array.from({ length: 6 }, (_, i) => ({
        price: (basePrice - (i + 1) * 0.15).toFixed(2),
        size: Math.floor(Math.random() * 450) + 120,
        total: 0
      }));

      setOrderBook({ asks, bids });
    };

    generateOrders();
    const interval = setInterval(() => {
      // Dynamic price fluctuation simulation
      const delta = (Math.random() - 0.48) * 0.25;
      setMarketData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          price: Math.max(10, +(prev[activeTab].price + delta).toFixed(2)),
          change: +(prev[activeTab].change + delta * 0.1).toFixed(2)
        }
      }));
      generateOrders();
    }, 2500);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle Simulated Order Execution
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrice = marketData[activeTab].price;
    const totalVal = (parseFloat(sharesAmount) || 0) * currentPrice;

    setNotification({
      type: 'success',
      title: 'Order Settlement Completed',
      message: `${tradeType} ${sharesAmount} ${activeTab} @ $${currentPrice.toFixed(2)} ($${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) routed through Double-Entry Ledger.`
    });

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-red-500 selection:text-white antialiased overflow-x-hidden">
      
      {/* Top Ledger & SLA Ticker Bar */}
      <div className="bg-[#0b0f19] border-b border-slate-800/80 text-xs text-slate-400 py-2 px-4 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-2">
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-0.5">
            <span className="flex items-center text-emerald-400 font-semibold gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              EXECUTION SLA: &lt;15MS MATCHING
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              DOUBLE-ENTRY LEDGER: <span className="text-emerald-400 font-mono font-medium ml-1">100% RECONCILED</span>
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              REAL-TIME NASDAQ FEED: DIRECT L3
            </span>
          </div>

          <div className="flex items-center space-x-4 ml-auto text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Tier Access:</span>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="Institutional LP" className="bg-slate-900">Institutional LP</option>
                <option value="Family Office" className="bg-slate-900">Family Office</option>
                <option value="Hedge Fund" className="bg-slate-900">Hedge Fund Desk</option>
                <option value="Retail Prime" className="bg-slate-900">Retail Prime Demo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Header */}
      <header className="border-b border-slate-800/60 bg-[#07090e]/80 backdrop-blur-xl sticky top-[33px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 border border-red-400/30">
                <span className="font-extrabold text-xl tracking-tighter text-white font-mono">T</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  TESLA <span className="text-red-500 text-xs tracking-widest px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40 font-mono">CAPITAL</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">INSTITUTIONAL EQUITY DESK</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
              <Link href="/" className="text-white hover:text-red-400 transition-colors flex items-center gap-1">
                Home
              </Link>
              <Link href="/market" className="text-slate-300 hover:text-white transition-colors">Invest</Link>
              <a href="#invest" className="text-slate-300 hover:text-white transition-colors">Ledger &amp; Security</a>
              <a href="#fleet" className="text-slate-300 hover:text-white transition-colors">Autonomous Assets</a>
              <a href="#faqs" className="text-slate-300 hover:text-white transition-colors">Institutional FAQ</a>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition shadow-sm flex items-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-red-500" />
                Live Demo
              </Link>
              <Link 
                href="/register"
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/30 border border-red-500/40 transition-all transform active:scale-95"
              >
                Open Investment Account
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-[#0c101a] px-4 pt-3 pb-6 space-y-3">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 font-medium hover:text-red-400">Home</Link>
            <Link href="/market" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 font-medium hover:text-red-400">Invest</Link>
            <a href="#invest" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 font-medium hover:text-red-400">Ledger Security</a>
            <a href="#fleet" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 font-medium hover:text-red-400">Autonomous Assets</a>
            <div className="pt-2 space-y-2">
              <Link 
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 text-xs font-bold rounded-lg bg-red-600 text-white shadow-md"
              >
                Open Investment Account
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
              >
                Access Live Demo ($12,482 AUM)
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Floating Notification System */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900/95 border border-red-500/40 shadow-2xl rounded-xl p-4 backdrop-blur-xl animate-fade-in flex items-start space-x-3">
          <div className="p-2 bg-red-950/60 rounded-lg text-red-400 border border-red-800/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glowing Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-medium mb-6 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Institutional Equity Infrastructure</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Elevate Your <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent">Tesla Investment</span> Experience
            </h1>
            
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Direct market execution, automated double-entry ledger security, 72-hour guaranteed settlement, and fractional exposure to Tesla's autonomous fleet energy ecosystems.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-950/50 border border-red-400/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Open Investment Account</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <a 
                href="#terminal-widget" 
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span>Explore Live Terminal (Demo)</span>
              </a>
            </div>
          </div>

          {/* INTERACTIVE LIVE TERMINAL WIDGET */}
          <div id="terminal-widget" className="rounded-2xl border border-slate-800/80 bg-[#0b0e17]/90 shadow-2xl overflow-hidden backdrop-blur-2xl">
            
            {/* Terminal Header Bar */}
            <div className="bg-[#0e1320] px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-xs font-mono text-slate-400 border-l border-slate-700 pl-3">
                  TERMINAL v4.2 // NASDAQ DIRECT
                </span>
              </div>

              {/* Ticker Selector Tabs */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                {(['TSLA', 'CYBERCAB', 'FLEET'] as const).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setActiveTab(symbol)}
                    className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                      activeTab === symbol
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center space-x-4 text-xs font-mono">
                <span className="text-slate-400">SLA: <strong className="text-emerald-400">{marketData[activeTab].sla}</strong></span>
                <span className="text-slate-400">LATENCY: <strong className="text-blue-400">1.2ms</strong></span>
              </div>
            </div>

            {/* Terminal Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
              
              {/* Left Column: Live Chart Canvas Simulation (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between">
                
                {/* Asset Stats Bar */}
                <div className="flex flex-wrap items-baseline justify-between mb-4 gap-2">
                  <div>
                    <span className="text-xs text-slate-400 font-mono block">SYMBOL</span>
                    <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      {activeTab} <span className="text-xs font-normal text-slate-400">/ USD</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">LAST PRICE</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-mono text-white">
                        ${marketData[activeTab].price.toFixed(2)}
                      </span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded flex items-center ${
                        marketData[activeTab].change >= 0 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-red-950/80 text-red-400 border border-red-800/50'
                      }`}>
                        {marketData[activeTab].change >= 0 ? '+' : ''}{marketData[activeTab].change}%
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="text-xs text-slate-400 font-mono block">24H VOLUME</span>
                    <span className="text-sm font-semibold font-mono text-slate-200">
                      {marketData[activeTab].volume}
                    </span>
                  </div>
                </div>

                {/* Simulated Chart Box */}
                <InteractiveChart price={marketData[activeTab].price} symbol={activeTab} />

                {/* Ledger Verification Tag */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Double-Entry Hash: 0x8f2...e491 Verified
                  </span>
                  <span>72h Settlement Lock: ACTIVE</span>
                </div>
              </div>

              {/* Middle Column: Order Book (2 cols) */}
              <div className="lg:col-span-2 p-4 bg-[#090d16] font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-800 text-[10px] uppercase font-semibold">
                    <span>Price (USD)</span>
                    <span>Size</span>
                  </div>

                  {/* Asks (Sell Orders) */}
                  <div className="space-y-1 py-2">
                    {orderBook.asks.map((order, idx) => (
                      <div key={`ask-${idx}`} className="flex justify-between items-center text-red-400 hover:bg-red-950/30 px-1 py-0.5 rounded transition">
                        <span>{order.price}</span>
                        <span className="text-slate-400">{order.size}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current Spread Bar */}
                  <div className="my-2 py-1.5 px-2 bg-slate-900 border-y border-slate-800 flex justify-between items-center text-slate-200 font-bold">
                    <span className="text-[10px] text-slate-400">SPREAD</span>
                    <span className="text-emerald-400">${(0.04).toFixed(2)}</span>
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div className="space-y-1 py-2">
                    {orderBook.bids.map((order, idx) => (
                      <div key={`bid-${idx}`} className="flex justify-between items-center text-emerald-400 hover:bg-emerald-950/30 px-1 py-0.5 rounded transition">
                        <span>{order.price}</span>
                        <span className="text-slate-400">{order.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 flex justify-between">
                  <span>Feed Status: L3</span>
                  <span className="text-emerald-400">Synced</span>
                </div>
              </div>

              {/* Right Column: Execution Form (3 cols) */}
              <div className="lg:col-span-3 p-4 sm:p-6 bg-[#0c101b] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-500" /> Instant Execution Panel
                  </h4>

                  {/* Buy / Sell Toggle */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTradeType('BUY')}
                      className={`py-2 rounded-md text-xs font-bold transition-all ${
                        tradeType === 'BUY'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType('SELL')}
                      className={`py-2 rounded-md text-xs font-bold transition-all ${
                        tradeType === 'SELL'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleExecuteTrade} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        SHARES QUANTITY
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={sharesAmount}
                          onChange={(e) => setSharesAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500 transition"
                          placeholder="10"
                          min="1"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                          UNITS
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>EST. VALUE:</span>
                        <span className="text-white font-bold">
                          ${((parseFloat(sharesAmount) || 0) * marketData[activeTab].price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>SETTLEMENT:</span>
                        <span className="text-emerald-400">Guaranteed 72h</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>LEDGER FEE:</span>
                        <span className="text-slate-300">0.00% (Institutional)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition transform active:scale-95 ${
                        tradeType === 'BUY'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                          : 'bg-red-600 hover:bg-red-500 shadow-red-950/50'
                      }`}
                    >
                      Execute {tradeType} Order
                    </button>
                  </form>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 leading-tight">
                  Orders executed are subject to institutional liquidity matching and double-entry reconciliation protocols.
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* METRICS & FEATURE GRID */}
      <section id="invest" className="py-16 bg-[#090d16] border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Core Pillars
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Designed for high-net-worth investors, family offices, and sovereign funds looking for seamless exposure to Tesla's growth engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-400 mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-red-400 font-semibold tracking-wider uppercase">AUTONOMOUS FLEET</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Cybercab &amp; AI Assets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct exposure to Tesla's autonomous ride-hailing revenues with real-time mileage settlement telemetry and fractional unit ownership.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">FLEET VALUATION</span>
                <span className="text-emerald-400 font-bold">$2.8B+ ORDERED</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">LEDGER SECURITY</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Double-Entry Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immutable double-entry balance updates with 100% cryptographic audit trail guaranteeing asset integrity against fractional reserve risk.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">RECONCILIATION</span>
                <span className="text-emerald-400 font-bold">100% AUTOMATED</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-blue-400 font-semibold tracking-wider uppercase">GLOBAL LIQUIDITY</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Institutional Equity Desk</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly to NASDAQ Level 3 liquidity feeds with sub-15ms execution windows and custom block-trade settlement options.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">MARKET CAP</span>
                <span className="text-blue-400 font-bold">$800B+ COVERED</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DETAILED STATS SECTION */}
      <section id="fleet" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div>
              <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">Global Autonomous Fleet Metrics</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 leading-tight">
                Real-Time Autonomous Telemetry &amp; Energy Grid Settlement
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Our proprietary platform hooks directly into Tesla Supercharger telemetry and Robotaxi fleet smart contracts to distribute daily dividends straight to your account ledger.
              </p>

              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">DAILY MILEAGE</span>
                  <span className="text-xl font-bold text-white">18,400+ MI</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">SETTLEMENT TIME</span>
                  <span className="text-xl font-bold text-emerald-400">72 HOURS</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Telemetry Items */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cybercab Yield Allocation</h4>
                    <p className="text-xs text-slate-400">Automated L3 Fleet Revenue Routing</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">+12.4% APY</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Megapack Energy Storage</h4>
                    <p className="text-xs text-slate-400">Grid Balancing Dividend Tranche</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-blue-400 font-bold">99.8% Efficiency</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-950/80 text-red-400 rounded-lg">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Multi-Sig Vault Protection</h4>
                    <p className="text-xs text-slate-400">Institutional Custody via Cold Storage</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-300 font-bold">SEC Compliant</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FAQ SECTION */}
      <section id="faqs" className="py-16 bg-[#090d16] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-2">Institutional compliance and execution mechanics</p>
          </div>

          <div className="space-y-4">
            <FaqItem 
              question="How does the 72-hour guaranteed settlement work?"
              answer="All trades executed through our institutional terminal are double-entry reconciled immediately and locked into our clearinghouse protocol, guaranteeing physical stock delivery and fund clearance within a 72-hour window."
            />
            <FaqItem 
              question="What is the Double-Entry Ledger Security framework?"
              answer="Every asset transfer, order match, and dividend yield allocation creates two immutable ledger entries simultaneously. This guarantees that total liabilities and total assets match cryptographically across every single block tick."
            />
            <FaqItem 
              question="Can I gain direct exposure to Cybercab and Autonomous Fleet revenues?"
              answer="Yes. Through our specialized asset tranches, accredited investors can purchase fractional revenue claims on active Tesla autonomous fleets with real-time mileage dividend payouts."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05070b] border-t border-slate-800/80 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white">T</div>
                <span className="text-base font-bold text-white tracking-wider">TESLA CAPITAL</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Institutional equity desk providing direct access to Tesla ecosystem growth, energy storage tranches, and autonomous fleet revenues.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#terminal-widget" className="hover:text-white transition">Live Terminal</a></li>
                <li><Link href="/market" className="hover:text-white transition">Order Book L3</Link></li>
                <li><a href="#invest" className="hover:text-white transition">Double-Entry Security</a></li>
                <li><a href="#fleet" className="hover:text-white transition">Cybercab Telemetry</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Compliance</h4>
              <ul className="space-y-2">
                <li><a href="#faqs" className="hover:text-white transition">SLA Guarantee</a></li>
                <li><Link href="/faqs" className="hover:text-white transition">KYC/AML Requirements</Link></li>
                <li><Link href="/risks" className="hover:text-white transition">SEC Regulatory Filings</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition">Audit Certificates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Desk Support</h4>
              <p className="text-slate-400 text-xs mb-2">Institutional LP Line: +1 (800) 555-TSLA</p>
              <p className="text-slate-400 text-xs">Encrypted Desk: desk@teslacapital-demo.com</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} Tesla Capital Institutional Desk. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/risks" className="hover:text-slate-300">Privacy Policy</Link>
              <Link href="/risks" className="hover:text-slate-300">Terms of Service</Link>
              <Link href="/risks" className="hover:text-slate-300">Market Disclosures</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Subcomponent: Dynamic Interactive Canvas Chart
function InteractiveChart({ price, symbol }: { price: number; symbol: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : 600;
      const height = 200;
      canvas.width = width;
      canvas.height = height;

      const points = 30;
      const data = Array.from({ length: points }, (_, i) => {
        const noise = (Math.sin(i * 0.5) * 15) + (Math.cos(i * 0.8) * 10);
        return price - 10 + noise + (i * 0.8);
      });

      // Drawing Logic
      ctx.clearRect(0, 0, width, height);

      const min = Math.min(...data) - 5;
      const max = Math.max(...data) + 5;
      const range = max - min || 1;

      const getX = (i: number) => (i / (points - 1)) * width;
      const getY = (val: number) => height - ((val - min) / range) * height * 0.8 - 20;

      // Gradient Background Area
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

      ctx.beginPath();
      ctx.moveTo(getX(0), getY(data[0]));
      for (let i = 1; i < points; i++) {
        ctx.lineTo(getX(i), getY(data[i]));
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Chart Line
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(data[0]));
      for (let i = 1; i < points; i++) {
        ctx.lineTo(getX(i), getY(data[i]));
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Highlight last point
      const lastX = getX(points - 1);
      const lastY = getY(data[points - 1]);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [price, symbol]);

  return (
    <div className="w-full bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 relative">
      <canvas ref={canvasRef} className="w-full h-[200px] block" />
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="text-[10px] font-mono bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
          INTERVAL: 1M
        </span>
        <span className="text-[10px] font-mono bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
          LIVE FEED
        </span>
      </div>
    </div>
  );
}

// Subcomponent: FAQ Accordion Item
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl bg-[#0c101b] border border-slate-800/80 overflow-hidden transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left font-bold text-sm text-white flex justify-between items-center hover:text-red-400 transition-colors"
      >
        <span>{question}</span>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
