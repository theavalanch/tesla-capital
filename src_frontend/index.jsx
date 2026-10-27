import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
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
  DollarSign,
  User,
  LogOut,
  LayoutDashboard,
  ArrowRight,
  Send,
  AlertCircle,
  Building2,
  RefreshCw,
  Star,
  Quote,
  Key,
  ShieldAlert,
  MessageSquare,
  Check,
  ArrowDown,
  FileText,
  Sliders,
  Search,
  Award
} from 'lucide-react';

// ==========================================
// MAIN REACT ROOT APPLICATION
// ==========================================
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCashRef = useRef(null);

  // Fetch authenticated user on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Real-time polling for balance changes and messages (Requirement 2 & 4)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && currentUser.role === 'USER') {
        fetch('/api/portfolio')
          .then(res => res.json())
          .then(data => {
            if (data && data.account) {
              const currentCash = data.account.availableCash;
              if (lastCashRef.current !== null && lastCashRef.current !== currentCash) {
                const diff = currentCash - lastCashRef.current;
                setNotification({
                  type: 'info',
                  title: 'Account Balance Reconciled',
                  message: `Your settled cash balance is now $${currentCash.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${diff >= 0 ? '+' : ''}$${diff.toFixed(2)} USD). Reconciled in real time by Tesla Operations Desk.`
                });
              }
              lastCashRef.current = currentCash;
            }
          })
          .catch(() => {});

        fetch('/api/messages')
          .then(res => res.json())
          .then(data => {
            const unread = (data.messages || []).filter(m => m.senderRole === 'ADMIN' && !m.isRead).length;
            setUnreadCount(unread);
          })
          .catch(() => {});
      } else if (currentUser && currentUser.role === 'ADMIN') {
        fetch('/api/admin/metrics')
          .then(res => res.json())
          .then(data => {
            if (data && data.unreadChats !== undefined) {
              setUnreadCount(data.unreadChats);
            }
          })
          .catch(() => {});
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleSwitchRole = async (targetRole, targetEmail = null) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole, email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setCurrentView(data.user.role === 'ADMIN' ? 'admin' : 'dashboard');
        setNotification({
          type: 'success',
          title: `Switched Perspective: ${data.user.fullName}`,
          message: `Active session converted to ${data.user.role === 'ADMIN' ? 'Tesla Operations Clearinghouse' : 'Investor Workstation'} for seamless simulation testing.`
        });
      }
    } catch (e) {
      alert('Error switching perspective');
    }
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
                defaultValue="Institutional LP"
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="Institutional LP" className="bg-slate-900">Institutional LP</option>
                <option value="Family Office" className="bg-slate-900">Family Office</option>
                <option value="Hedge Fund" className="bg-slate-900">Hedge Fund Desk</option>
                <option value="Retail Prime" className="bg-slate-900">Retail Prime Desk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Perspective & Testing Banner */}
      <div className="bg-gradient-to-r from-red-950/90 via-[#0c101c] to-blue-950/90 border-b border-red-500/30 text-xs py-2 px-4 sticky top-[33px] z-45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider uppercase animate-pulse">
              SIMULATION HARNESS
            </span>
            <span className="text-slate-300 hidden md:inline text-xs">
              Complete User &amp; Admin Dashboard Simulation Desk
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono ml-auto">
            <span className="text-slate-400">
              Active Persona: <strong className="text-white">{currentUser ? currentUser.fullName : 'Guest'}</strong> 
              {currentUser && <span className="text-slate-400 ml-1">({currentUser.role})</span>}
            </span>

            {currentUser?.role === 'ADMIN' ? (
              <button
                onClick={() => handleSwitchRole('USER')}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Switch to Jason Evans (Investor)</span>
              </button>
            ) : (
              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md transition"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Switch to Tesla Admin Desk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Header */}
      <header className="border-b border-slate-800/60 bg-[#07090e]/80 backdrop-blur-xl sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 border border-red-400/30">
                <span className="font-extrabold text-xl tracking-tighter text-white font-mono">T</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  TESLA <span className="text-red-500 text-xs tracking-widest px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40 font-mono">CAPITAL</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">INSTITUTIONAL EQUITY DESK</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
              <button 
                onClick={() => setCurrentView('landing')}
                className={`transition-colors flex items-center gap-1 ${currentView === 'landing' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView('trade')}
                className={`transition-colors ${currentView === 'trade' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Trade Desk
              </button>
              <button 
                onClick={() => setCurrentView('transactions')}
                className={`transition-colors ${currentView === 'transactions' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Ledger &amp; Security
              </button>
              <button 
                onClick={() => setCurrentView('deposit')}
                className={`transition-colors ${currentView === 'deposit' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Deposit
              </button>
              <button 
                onClick={() => setCurrentView('withdrawal')}
                className={`transition-colors ${currentView === 'withdrawal' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Withdraw (72h SLA)
              </button>
              <button 
                onClick={() => setCurrentView('messages')}
                className={`transition-colors flex items-center gap-1.5 ${currentView === 'messages' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Action Buttons - Clean Standard Authentication */}
            <div className="hidden lg:flex items-center space-x-3.5">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentView(currentUser.role === 'ADMIN' ? 'admin' : 'dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-white"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-red-500" />
                    <span>{currentUser.role === 'ADMIN' ? 'Admin Portal' : 'Workstation'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setCurrentView('login')}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition shadow-sm"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setCurrentView('admin-login')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-900 text-red-400 border border-red-900/40 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-red-500" />
                    <span>Admin Portal</span>
                  </button>
                  <button 
                    onClick={() => setCurrentView('register')}
                    className="px-5 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/30 border border-red-500/40 transition-all transform active:scale-95"
                  >
                    Open Account
                  </button>
                </div>
              )}
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
            <button onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Home</button>
            <button onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Investor Workstation</button>
            <button onClick={() => { setCurrentView('trade'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Trade Desk</button>
            <button onClick={() => { setCurrentView('deposit'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Deposit</button>
            <button onClick={() => { setCurrentView('withdrawal'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Withdrawal (72h SLA)</button>
            <button onClick={() => { setCurrentView('transactions'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Ledger Security</button>
            <button onClick={() => { setCurrentView('messages'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-200 font-medium hover:text-red-400">Messages</button>
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <button 
                onClick={() => { setCurrentView('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-900 text-slate-200 border border-slate-700"
              >
                Investor Sign In
              </button>
              <button 
                onClick={() => { setCurrentView('admin-login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-950 text-red-400 border border-red-900/40"
              >
                Admin Security Login
              </button>
              <button 
                onClick={() => { setCurrentView('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-red-600 text-white shadow-md"
              >
                Open Investment Account
              </button>
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

      {/* RENDER ACTIVE VIEW */}
      {currentView === 'landing' && (
        <LandingPageView 
          onOpenAccount={() => setCurrentView('register')}
          onOpenTerminal={() => {
            const el = document.getElementById('terminal-widget');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSimulateTrade={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardView 
          currentUser={currentUser} 
          onNavigate={(v) => setCurrentView(v)}
        />
      )}

      {currentView === 'trade' && (
        <TradeView 
          currentUser={currentUser}
          onTradeSuccess={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      )}

      {currentView === 'deposit' && (
        <DepositView 
          currentUser={currentUser}
          onNavigate={(v) => setCurrentView(v)}
          onSuccess={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      )}

      {currentView === 'withdrawal' && (
        <WithdrawalView 
          currentUser={currentUser}
          onNavigate={(v) => setCurrentView(v)}
          onSuccess={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      )}

      {currentView === 'transactions' && (
        <TransactionsView currentUser={currentUser} onNavigate={(v) => setCurrentView(v)} />
      )}

      {currentView === 'messages' && (
        <MessagesView currentUser={currentUser} onNavigate={(v) => setCurrentView(v)} />
      )}

      {currentView === 'admin' && (
        <AdminView 
          currentUser={currentUser}
          onNavigate={(v) => setCurrentView(v)}
          onSuccess={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      )}

      {currentView === 'register' && (
        <RegisterView 
          onRegistered={(user) => {
            setCurrentUser(user);
            setCurrentView('dashboard');
          }}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'login' && (
        <LoginView 
          onLoggedIn={(user) => {
            setCurrentUser(user);
            setCurrentView(user.role === 'ADMIN' ? 'admin' : 'dashboard');
          }}
          onSwitchToRegister={() => setCurrentView('register')}
          onSwitchToAdmin={() => setCurrentView('admin-login')}
        />
      )}

      {currentView === 'admin-login' && (
        <AdminLoginView 
          onAdminLoggedIn={(user) => {
            setCurrentUser(user);
            setCurrentView('admin');
          }}
          onSwitchToInvestorLogin={() => setCurrentView('login')}
        />
      )}

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
                <li><button onClick={() => setCurrentView('landing')} className="hover:text-white transition">Live Terminal</button></li>
                <li><button onClick={() => setCurrentView('trade')} className="hover:text-white transition">Trade Desk</button></li>
                <li><button onClick={() => setCurrentView('transactions')} className="hover:text-white transition">Double-Entry Security</button></li>
                <li><button onClick={() => setCurrentView('withdrawal')} className="hover:text-white transition">72-Hour Settlement</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Administration &amp; Compliance</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentView('admin-login')} className="text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1"><Key className="w-3 h-3" /> Admin Portal Login</button></li>
                <li><span className="text-slate-400">SLA Guarantee (72h)</span></li>
                <li><span className="text-slate-400">KYC/AML Tier 2 Verification</span></li>
                <li><span className="text-slate-400">Double-Entry Ledger Audit</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Desk Support</h4>
              <p className="text-slate-400 text-xs mb-2">Institutional LP Line: +1 (800) 555-TSLA</p>
              <p className="text-slate-400 text-xs">Encrypted Desk: desk@teslacapital.com</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} Tesla Capital Institutional Desk. Powered by Python &amp; React.</p>
            <div className="flex space-x-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Market Disclosures</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ==========================================
// 1. LANDING PAGE VIEW (WITH TESTIMONIALS)
// ==========================================
function LandingPageView({ onOpenAccount, onOpenTerminal, onSimulateTrade }) {
  const [activeTab, setActiveTab] = useState('TSLA');
  const [tradeType, setTradeType] = useState('BUY');
  const [sharesAmount, setSharesAmount] = useState('10');

  const [marketData, setMarketData] = useState({
    TSLA: { price: 462.78, change: 2.81, marketCap: '842.5B', volume: '34.2M', sla: '<12ms' },
    CYBERCAB: { price: 128.40, change: 5.14, marketCap: '120.8B', volume: '12.8M', sla: '<9ms' },
    FLEET: { price: 89.15, change: -0.62, marketCap: '45.2B', volume: '8.4M', sla: '<14ms' }
  });

  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });

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

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    const currentPrice = marketData[activeTab].price;
    const totalVal = (parseFloat(sharesAmount) || 0) * currentPrice;

    onSimulateTrade({
      type: 'success',
      title: 'Order Settlement Completed',
      message: `${tradeType} ${sharesAmount} ${activeTab} @ $${currentPrice.toFixed(2)} ($${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) routed through Double-Entry Ledger.`
    });
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
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
              <button 
                onClick={onOpenAccount}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-950/50 border border-red-400/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Open Investment Account</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={onOpenTerminal}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span>Explore Live Terminal</span>
              </button>
            </div>
          </div>

          {/* INTERACTIVE LIVE TERMINAL WIDGET */}
          <div id="terminal-widget" className="rounded-2xl border border-slate-800/80 bg-[#0b0e17]/90 shadow-2xl overflow-hidden backdrop-blur-2xl">
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
                {['TSLA', 'CYBERCAB', 'FLEET'].map((symbol) => (
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
              
              {/* Left Column: Chart (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between">
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

                <InteractiveChart price={marketData[activeTab].price} symbol={activeTab} />

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

                  <div className="space-y-1 py-2">
                    {orderBook.asks.map((order, idx) => (
                      <div key={`ask-${idx}`} className="flex justify-between items-center text-red-400 hover:bg-red-950/30 px-1 py-0.5 rounded transition">
                        <span>{order.price}</span>
                        <span className="text-slate-400">{order.size}</span>
                      </div>
                    ))}
                  </div>

                  <div className="my-2 py-1.5 px-2 bg-slate-900 border-y border-slate-800 flex justify-between items-center text-slate-200 font-bold">
                    <span className="text-[10px] text-slate-400">SPREAD</span>
                    <span className="text-emerald-400">${(0.04).toFixed(2)}</span>
                  </div>

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

      {/* INSTITUTIONAL TESTIMONIALS SECTION */}
      <section className="py-20 bg-[#090d16] border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              <span>Institutional Validation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trusted by Family Offices &amp; Accredited TSLA LPs
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Over $4.8 Billion in Tesla equity, Megapack grid storage tranches, and autonomous fleet revenues reconciled with zero downtime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="p-8 rounded-3xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "The atomic double-entry ledger is a game changer for institutional custody. Unlike retail brokers with multi-day reconciliation lags, our TSLA equity block orders execute with sub-15ms latency and immediate cryptographically verified balance snapshots."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Vance</h4>
                  <p className="text-[11px] text-slate-400">Managing Partner, Apex Alpha Capital</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px] font-mono font-bold">
                  $42M AUM
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-3xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "Routing our corporate treasury into Tesla Megapack energy yield contracts has delivered a steady 4.8% APY with quarterly automated distribution. The guaranteed 72-hour settlement SLA has been flawless across every single wire withdrawal."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Elena Rostova</h4>
                  <p className="text-[11px] text-slate-400">CIO, Horizon Grid Ventures</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/50 text-[10px] font-mono font-bold">
                  $18.5M AUM
                </span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-3xl bg-[#0d121f] border border-slate-800 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "Being able to hold fractional claims on Cybercab autonomous fleet revenues as Tesla ramps Robotaxi deployments in 2026 gives us asymmetric upside that simply cannot be found on standard brokerage apps."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">David Sterling</h4>
                  <p className="text-[11px] text-slate-400">Senior PM, Silicon Horizon Tech Fund</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/50 text-[10px] font-mono font-bold">
                  $25M AUM
                </span>
              </div>
            </div>

          </div>

          {/* Testimonial Trust Matrix Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#07090e] border border-slate-800 text-center font-mono">
            <div>
              <div className="text-2xl font-black text-white">$4.8B+</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Audited Volume</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Double-Entry Audit</div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-400">&lt; 15ms</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Execution Latency</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">72-Hour</div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Guaranteed Settlement</div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & FEATURE GRID */}
      <section id="invest" className="py-16 bg-[#090d16] border-b border-slate-800/80 relative">
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
    </div>
  );
}

// Dynamic Canvas Chart
function InteractiveChart({ price, symbol }) {
  const canvasRef = useRef(null);

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

      ctx.clearRect(0, 0, width, height);

      const min = Math.min(...data) - 5;
      const max = Math.max(...data) + 5;
      const range = max - min || 1;

      const getX = (i) => (i / (points - 1)) * width;
      const getY = (val) => height - ((val - min) / range) * height * 0.8 - 20;

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

      ctx.beginPath();
      ctx.moveTo(getX(0), getY(data[0]));
      for (let i = 1; i < points; i++) {
        ctx.lineTo(getX(i), getY(data[i]));
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

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

function FaqItem({ question, answer }) {
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

// =========================================================================
// 2. INVESTOR DASHBOARD VIEW (DEDICATED BROKERAGE WORKSTATION LAYOUT)
// =========================================================================
function DashboardView({ currentUser, onNavigate }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('1D');
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchDashboardData = () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/withdrawals')
      .then(res => res.json())
      .then(data => setWithdrawals(data.withdrawals || []))
      .catch(() => {});

    fetch('/api/deposits')
      .then(res => res.json())
      .then(data => setDeposits(data.deposits || []))
      .catch(() => {});

    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        const msgs = data.messages || [];
        const unread = msgs.filter(m => !m.read && m.senderRole === 'admin').length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3500);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="inline-block animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full"></div>
        <div className="text-sm font-mono text-slate-400 tracking-wider">CONNECTING TO DOUBLE-ENTRY CUSTODY VAULT...</div>
      </div>
    );
  }

  const val = portfolio?.valuation || {
    totalPortfolioValue: 12482.36,
    availableCash: 1245.00,
    totalStockValue: 12485.80,
    dailyGain: 341.03,
    dailyGainPercent: 2.81,
    investedCapital: 11417.13,
    realizedPnl: 142.50
  };

  return (
    <div className="min-h-screen bg-[#05070d] pb-20">
      
      {/* Workstation Cockpit Top Banner */}
      <div className="bg-[#090d16] border-b border-slate-800/90 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-white text-lg font-mono shadow-lg shadow-red-900/30">
              JE
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {currentUser?.fullName || 'Jason Evans'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>TIER 2 VERIFIED</span>
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mt-0.5">
                <span>ACCT: <strong className="text-slate-300">#TSLA-INV-8942</strong></span>
                <span>•</span>
                <span>CUSTODY: <strong className="text-slate-300">JPMorgan Chase N.A.</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">FEED: L3 REAL-TIME</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('deposit')}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition"
            >
              Deposit Capital
            </button>
            <button 
              onClick={() => onNavigate('withdrawal')}
              className="px-4 py-2.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
            >
              Withdraw (72h SLA)
            </button>
            <button 
              onClick={() => onNavigate('trade')}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 transition"
            >
              Order Desk
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Main Workstation 12-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Workstation Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Equity Valuation Hero Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Total Portfolio Net Asset Value (NAV)
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-white mt-1">
                    ${val.totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center space-x-3 mt-2 text-xs font-mono font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +${val.dailyGain.toFixed(2)} (+{val.dailyGainPercent}%) 24H Return
                    </span>
                    <span className="text-slate-400">All positions marked to NASDAQ</span>
                  </div>
                </div>

                {/* Period Selector Pills */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRange(r)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeRange === r ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workstation Interactive SVG/Canvas Curve */}
              <div className="relative pt-2">
                <InteractiveChart price={portfolio?.quote?.price || 462.78} symbol="PORTFOLIO" />
              </div>
            </div>

            {/* Workstation KPI Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">Settled Cash</span>
                <div className="text-xl font-bold text-emerald-400">${val.availableCash.toLocaleString()}</div>
                <span className="text-[10px] text-slate-400">100% Liquidity</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">Invested Capital</span>
                <div className="text-xl font-bold text-white">${val.investedCapital.toLocaleString()}</div>
                <span className="text-[10px] text-slate-400">Original Basis</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">Realized P&amp;L</span>
                <div className="text-xl font-bold text-emerald-400">+${val.realizedPnl.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Ledger Cleared</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">SLA Processing</span>
                <div className="text-xl font-bold text-blue-400">72 Hours</div>
                <span className="text-[10px] text-blue-400 font-semibold">Guaranteed Payout</span>
              </div>
            </div>

            {/* Active Position Management Workstation */}
            <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span>Institutional Position Breakdown</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">NASDAQ Execution Real-Time</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 pb-2">
                      <th className="py-2.5 px-3">ASSET</th>
                      <th className="py-2.5 px-3">SHARES</th>
                      <th className="py-2.5 px-3">AVG BASIS</th>
                      <th className="py-2.5 px-3">CURRENT</th>
                      <th className="py-2.5 px-3">TOTAL VALUE</th>
                      <th className="py-2.5 px-3">UNREALIZED</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portfolio?.positions?.map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-xs">T</span>
                          <span>{p.symbol}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">{p.shares}</td>
                        <td className="py-3 px-3 text-slate-400">${p.averageCost.toFixed(2)}</td>
                        <td className="py-3 px-3 font-bold text-white">${p.currentPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">${p.marketValue.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">+{((p.unrealizedPnl / (p.shares * p.averageCost)) * 100).toFixed(2)}%</td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={() => onNavigate('trade')}
                            className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Workstation Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 72-Hour Withdrawal Processing SLA Tracker Card */}
            {(() => {
              const latestW = withdrawals[0];
              const isSettled = latestW?.status === 'COMPLETED';
              const isPending = latestW && !isSettled && latestW.status !== 'REJECTED';
              const hoursRem = latestW?.hoursRemaining ?? 72;
              const stepName = latestW?.stepName || (isSettled ? 'Settlement Cleared & Payout Successful' : 'Pre-Clearing Review & Ledger Hold');
              const progressPct = isSettled ? 100 : Math.min(100, Math.max(15, ((72 - hoursRem) / 72) * 100));

              return (
                <div className={`p-6 rounded-3xl bg-[#0c101b] border shadow-xl space-y-4 transition-all ${
                  isSettled ? 'border-emerald-700/60 shadow-emerald-950/20' : isPending ? 'border-blue-900/60 shadow-blue-950/20' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                      isSettled ? 'text-emerald-400' : isPending ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      <Clock className="w-3.5 h-3.5" /> 72-Hour Guaranteed Settlement
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      isSettled 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                        : isPending 
                          ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse' 
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {isSettled ? 'SETTLED' : isPending ? `STAGE ${latestW.step || 1} / 4` : 'STANDBY'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-bold font-mono text-white">
                      {latestW ? `$${Number(latestW.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : '$0.00 USD Pending'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {latestW?.destination || 'Wire to JPMorgan Chase (Acct ****4821)'}
                    </div>
                  </div>

                  {/* Progress bar / SLA status */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>{isSettled ? 'Status:' : 'SLA Sequence:'}</span>
                      <span className={`font-bold ${isSettled ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {isSettled ? 'Settled & Cleared' : `${hoursRem.toFixed(1)}h Remaining`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isSettled ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ref: {latestW?.reference || 'N/A'}</span>
                      <span className="truncate max-w-[170px] text-right">{stepName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('withdrawal')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isPending ? 'Open 72h SLA Tracker Desk' : 'Manage Withdrawals'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* Wire Deposit Slip Tracker Card */}
            {(() => {
              const latestD = deposits[0];
              const isApproved = latestD?.status === 'APPROVED';
              const isPending = latestD && !isApproved;

              return (
                <div className={`p-6 rounded-3xl bg-[#0c101b] border shadow-xl space-y-4 transition-all ${
                  isApproved ? 'border-emerald-800/60 shadow-emerald-950/20' : isPending ? 'border-amber-800/50 shadow-amber-950/20' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct Wire Clearing Desk
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      isApproved 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : isPending 
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {latestD ? latestD.status : 'AVAILABLE'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {latestD ? `+$${Number(latestD.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : 'Deposit via Chat Desk'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {latestD ? `Reference: ${latestD.reference}` : 'All incoming wires require admin coordination in chat'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Custodian:</span>
                      <span className="text-slate-200">JPMorgan Chase N.A.</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Channel:</span>
                      <span className="text-emerald-400 font-semibold">1-on-1 Admin Chatroom</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(isPending ? 'messages' : 'deposit')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isPending ? 'Open Chat for Wire Status' : 'Submit Deposit Request'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* Direct Operations Desk Link */}
            <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-950 text-red-400 flex items-center justify-center font-bold relative">
                  <Send className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tesla Clearinghouse Desk</h4>
                  <p className="text-[11px] text-slate-400">
                    {unreadCount > 0 ? (
                      <span className="text-red-400 font-bold">{unreadCount} Unread Admin Transmission(s)</span>
                    ) : (
                      'Encrypted Institutional Chat Active'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('messages')}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition shadow-md shadow-red-950/50 flex items-center justify-center gap-2"
              >
                <span>Open Encrypted Channel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. TRADE VIEW
// ==========================================
function TradeView({ currentUser, onTradeSuccess }) {
  const [symbol, setSymbol] = useState('TSLA');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, side, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (res.ok) {
        onTradeSuccess({
          type: 'success',
          title: 'Trade Executed On-Ledger',
          message: `${side} order for $${amount} of ${symbol} executed and balance updated via double-entry accounting.`
        });
      } else {
        alert(data.detail || 'Trade execution rejected');
      }
    } catch (e) {
      alert('Network error executing trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="p-8 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-mono text-red-500 font-bold uppercase">Institutional Execution Desk</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Execute Tesla Equity Order</h2>
          <p className="text-xs text-slate-400 mt-1">Direct NASDAQ Level 3 matching with 0% institutional commission.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button 
            type="button" 
            onClick={() => setSide('BUY')}
            className={`py-3 rounded-lg text-xs font-bold transition-all ${side === 'BUY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            BUY TSLA
          </button>
          <button 
            type="button" 
            onClick={() => setSide('SELL')}
            className={`py-3 rounded-lg text-xs font-bold transition-all ${side === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            SELL TSLA
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">CAPITAL ALLOCATION (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                step="any"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['250', '500', '1000', '5000'].map(val => (
              <button 
                key={val} 
                type="button" 
                onClick={() => setAmount(val)}
                className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white"
              >
                ${val}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Execution Matching:</span>
              <span className="text-emerald-400 font-bold">&lt; 15ms NASDAQ Route</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Custody Ledger:</span>
              <span className="text-white">Double-Entry Cryptographic</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Commission Fee:</span>
              <span className="text-emerald-400">$0.00 (Zero Fee)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all ${side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
          >
            {loading ? 'Routing Order...' : `Submit ${side} Order`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. DEPOSIT VIEW (CHATROOM COORDINATION WORKFLOW)
// ==========================================
function DepositView({ currentUser, onSuccess, onNavigate }) {
  const [amount, setAmount] = useState('5000');
  const [method, setMethod] = useState('WIRE');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentDeposits, setRecentDeposits] = useState([]);

  useEffect(() => {
    fetch('/api/deposits')
      .then(res => res.json())
      .then(data => setRecentDeposits(data.deposits || []))
      .catch(() => {});
  }, []);

  const handleInitiateChatDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Post deposit enquiry to backend
      const depRes = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), method, memo })
      });
      const depData = await depRes.json();

      // 2. Automatically post message into user's private chatroom with Admin Desk
      const inquiryText = `DEPOSIT INQUIRY [${depData.deposit?.reference || 'NEW'}]: Requesting verified custodial wire coordinates for an incoming institutional deposit of $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD via ${method}. Please provide verified banking routing details and account memo.`;
      
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inquiryText,
          subject: `Deposit Inquiry: $${amount} via ${method}`
        })
      });

      if (onSuccess) {
        onSuccess({
          type: 'success',
          title: 'Deposit Inquiry Sent to Admin Desk',
          message: `Inquiry for $${parseFloat(amount).toLocaleString()} USD transmitted. Redirecting to your private chatroom to receive wire instructions.`
        });
      }

      // 3. Immediately switch user to private chatroom where Admin will reply
      if (onNavigate) {
        onNavigate('messages');
      }
    } catch (err) {
      alert('Network error connecting to custodial desk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Title & Desk Banner */}
      <div className="pb-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Institutional Funding Protocol
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Capital Deposit Desk</h2>
          <p className="text-xs text-slate-400 mt-1">All incoming custodial allocations are coordinated directly via your private administrative chatroom.</p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('messages')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Open Private Desk Chat</span>
        </button>
      </div>

      {/* Prominent Instruction Banner (Requirement 1) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0c101b] to-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Mandatory Deposit Procedure: Contact Admin in Private Chatroom</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                REQUIRED BY COMPLIANCE
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever you want to deposit funds, our compliance policy requires you to contact the operations admin through your <strong>built-in private chatroom</strong>. Your dedicated officer will issue authenticated Federal Reserve Fedwire or ACH routing coordinates and an audited reference tracking ID. Once your wire is confirmed, your account balance will immediately be credited.
            </p>
          </div>
        </div>

        {/* 4-Step Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">STEP 01</span>
            <div className="font-bold text-white">Contact Desk in Chat</div>
            <p className="text-[10px] text-slate-400">Specify intended allocation capital &amp; settlement channel.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">STEP 02</span>
            <div className="font-bold text-white">Receive Coordinates</div>
            <p className="text-[10px] text-slate-400">Admin issues JPMorgan Chase escrow coordinates &amp; ref memo.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">STEP 03</span>
            <div className="font-bold text-white">Wire Transmit</div>
            <p className="text-[10px] text-slate-400">Dispatch funds via your verified commercial banking portal.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block">STEP 04</span>
            <div className="font-bold text-white">Instant Credit</div>
            <p className="text-[10px] text-slate-400">Admin reconciles wire &amp; updates your available cash.</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Chat Inquiry Generator (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Initiate Deposit &amp; Open Chatroom</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Specify your target deposit to send an official wire coordinates request directly to the admin desk.</p>
          </div>

          <form onSubmit={handleInitiateChatDeposit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                INTENDED DEPOSIT ALLOCATION (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="50"
                  step="any"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Quick preset amount pills */}
            <div className="grid grid-cols-4 gap-2">
              {['2500', '5000', '10000', '25000'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition ${
                    amount === val ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  ${parseInt(val).toLocaleString()}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                SETTLEMENT CHANNEL
              </label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="WIRE">Federal Reserve Fedwire (Instant Same-Day Settlement)</option>
                <option value="ACH">ACH Institutional Direct Deposit ($0 Fee)</option>
                <option value="USDC">Custodial Digital Currency (USDC / USDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                OPTIONAL NOTE FOR ADMIN DESK
              </label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="e.g. Allocation for upcoming earnings tranche"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Dispatching to Desk...' : 'Message Admin & Request Wire Coordinates'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Custodial Banking Coordinates & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Bank Coordinates Card */}
          <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Custodial Escrow</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                ACTIVE RE reconciliation
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>Beneficiary:</span>
                <span className="text-white font-bold">Tesla Capital Custody LLC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>Custodial Bank:</span>
                <span className="text-white">JPMorgan Chase Bank, N.A.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>Fedwire Routing:</span>
                <span className="text-emerald-400 font-bold">021000021</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>SWIFT/BIC:</span>
                <span className="text-white font-bold">CHASUS33</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>Escrow Account:</span>
                <span className="text-slate-200">****7892 (Assigned in Chat)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-semibold font-mono">Notice:</span> Exact memo codes and personalized bank sub-account routing are issued in your private chatroom to guarantee zero-loss allocation.
            </div>
          </div>

          {/* Quick Chat Shortcut Card */}
          <div className="p-6 rounded-3xl bg-[#0c101b] border border-emerald-900/40 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Need Wire Assistance?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Our administrative operations clearinghouse is standing by to confirm incoming wires, provide custom SWIFT instructions, and update account balances.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('messages')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 uppercase tracking-wider transition"
            >
              Open Dedicated Chatroom
            </button>
          </div>
        </div>

      </div>

      {/* Recent Deposit Enquiries Table */}
      {recentDeposits.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Your Deposit Enquiries &amp; Clearance History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2.5 px-3">REFERENCE</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">CHANNEL</th>
                  <th className="py-2.5 px-3">DATE INITIATED</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDeposits.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-bold text-white">{dep.reference}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">${parseFloat(dep.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-slate-300">{dep.method}</td>
                    <td className="py-3 px-3 text-slate-400">{dep.createdAt?.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        dep.status === 'APPROVED' 
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60' 
                          : 'bg-blue-950 text-blue-400 border-blue-800/60 animate-pulse'
                      }`}>
                        {dep.status === 'APPROVED' ? 'CLEARED & CREDITED' : 'PENDING DESK REVIEW'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate && onNavigate('messages')}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold"
                      >
                        View Chat →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 5. WITHDRAWAL VIEW (72H GUARANTEED SLA & ACCOUNT CLEARANCE - REQ 3 & 5)
// =========================================================================
function WithdrawalView({ currentUser, onSuccess, onNavigate }) {
  const [portfolio, setPortfolio] = useState(null);
  const [amount, setAmount] = useState('800');
  const [method, setMethod] = useState('WIRE');
  const [destination, setDestination] = useState('JPMorgan Chase (Acct ****4821, Routing 021000021, Jason Evans)');
  const [clearBalanceOnComplete, setClearBalanceOnComplete] = useState(true);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [completedModalData, setCompletedModalData] = useState(null);

  // Fetch portfolio & withdrawals
  const fetchData = () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(() => {});

    fetch('/api/withdrawals')
      .then(res => res.json())
      .then(data => {
        const list = data.withdrawals || [];
        setWithdrawals(list);
        // If the latest withdrawal is completed and wasn't dismissed yet
        if (list.length > 0 && list[0].status === 'COMPLETED' && !list[0]._modalDismissed) {
          // Check if newly completed in last 10 mins
          setCompletedModalData(list[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  const availableCash = portfolio?.account?.availableCash ?? 1245.00;

  const handleWithdrawAll = () => {
    const fee = method === 'WIRE' ? 15.0 : 0.0;
    const maxWithdraw = Math.max(0, availableCash - fee);
    setAmount(maxWithdraw.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          method, 
          destination,
          clearBalanceOnComplete 
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: '72-Hour Withdrawal Sequence Active',
            message: `Payout reference ${data.withdrawal.reference} for $${amount} reserved. 72-hour institutional sequence initiated.`
          });
        }
        fetchData();
      } else {
        alert(data.detail || 'Withdrawal rejected');
      }
    } catch (e) {
      alert('Network error connecting to clearinghouse');
    } finally {
      setLoading(false);
    }
  };

  // Simulation step advance directly from user view for testing/demo
  const handleSimulateAdvance = async (wthId) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wthId}/advance`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (data.withdrawal?.status === 'COMPLETED') {
          setCompletedModalData(data.withdrawal);
        }
        fetchData();
      }
    } catch (e) {}
  };

  const activeWithdrawal = withdrawals.find(w => w.status !== 'COMPLETED' && w.status !== 'REJECTED') || withdrawals[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* "WITHDRAWAL SUCCESSFUL" NOTIFICATION MODAL (Requirement 3 & 5) */}
      {completedModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full bg-[#0a0e18] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.35)] space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold tracking-widest uppercase">
                72-HOUR SLA COMPLETED
              </span>
              <h3 className="text-2xl font-black text-white mt-2">Withdrawal Successful</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your simulated payout sequence has completed successfully. Federal Reserve wire confirmation has cleared.
              </p>
            </div>

            {/* Clearance Details Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Reference:</span>
                <span className="text-white font-bold">{completedModalData.reference}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Net Payout Cleared:</span>
                <span className="text-emerald-400 font-bold">${parseFloat(completedModalData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination Bank:</span>
                <span className="text-slate-200">{completedModalData.destinationMasked}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fedwire Confirmation:</span>
                <span className="text-emerald-400 font-bold">#FED-8942-SETTLED</span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                <span className="text-slate-400">Account Clearance Status:</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  RECONCILED TO $0.00
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCompletedModalData(null)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition"
              >
                Confirm &amp; Acknowledge
              </button>
              <button
                onClick={() => {
                  setCompletedModalData(null);
                  if (onNavigate) onNavigate('transactions');
                }}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition"
              >
                View Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 72-Hour Guaranteed Settlement SLA
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Capital Withdrawal Desk</h2>
          <p className="text-xs text-slate-400 mt-1">Multi-stage institutional liquidation sequence with guaranteed settlement and account clearance.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">Settled Liquidity:</span>
          <span className="text-emerald-400 font-bold text-sm">${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* ACTIVE 72-HOUR PROCESSING SEQUENCE CARD (Requirement 3) */}
      {activeWithdrawal && (
        <div className={`p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-6 ${
          activeWithdrawal.status === 'COMPLETED' 
            ? 'bg-[#0a1215] border-emerald-500/40' 
            : 'bg-[#0a0f1d] border-blue-500/40'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
                activeWithdrawal.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {activeWithdrawal.status === 'COMPLETED' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-spin" />}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Settlement Flow</span>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{activeWithdrawal.reference}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-mono">${parseFloat(activeWithdrawal.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                activeWithdrawal.status === 'COMPLETED' 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
              }`}>
                {activeWithdrawal.status === 'COMPLETED' ? 'WITHDRAWAL SUCCESSFUL' : `STAGE ${activeWithdrawal.step || 1} OF 4 IN PROGRESS`}
              </span>

              {activeWithdrawal.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleSimulateAdvance(activeWithdrawal.id)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold shadow transition"
                  title="Simulate step advance for demo presentation"
                >
                  Advance Step (Demo)
                </button>
              )}
            </div>
          </div>

          {/* 72-Hour Countdown Clock & Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>SLA Guaranteed Processing Window:</span>
              </span>
              <span className={`text-sm font-bold ${activeWithdrawal.status === 'COMPLETED' ? 'text-emerald-400' : 'text-blue-400 animate-pulse'}`}>
                {activeWithdrawal.status === 'COMPLETED' ? '0h 00m 00s (Settled)' : `${activeWithdrawal.hoursRemaining || 72}h 00m Remaining`}
              </span>
            </div>

            {/* Visual 4-Step Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-[10px]">
              {[
                { num: 1, title: 'Pre-Clearing', sub: 'Reserve Hold' },
                { num: 2, title: 'Custodial KYC', sub: 'Compliance OK' },
                { num: 3, title: 'Fedwire Route', sub: 'Dispatching' },
                { num: 4, title: 'Final Settlement', sub: 'Account Cleared' }
              ].map(step => {
                const currentStep = activeWithdrawal.status === 'COMPLETED' ? 4 : (activeWithdrawal.step || 1);
                const isPassed = step.num <= currentStep;
                const isCurrent = step.num === currentStep;

                return (
                  <div key={step.num} className="space-y-1.5">
                    <div className={`h-2 rounded-full transition-all ${
                      isPassed ? (activeWithdrawal.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-slate-800'
                    }`}></div>
                    <div className="flex items-center space-x-1">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        isPassed ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.num}
                      </span>
                      <span className={`font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-900 text-xs text-slate-300">
              <span className="text-slate-400">Current Phase: </span>
              <strong className="text-white">{activeWithdrawal.stepName || 'Pre-Clearing Review & Ledger Hold'}</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeWithdrawal.stepDescription || 'Funds held in double-entry ledger. Staging Federal Reserve transmission.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form & Destination Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Withdrawal Form (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Submit New Withdrawal Request</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Submitted requests appear on the admin dashboard for compliance review and 72-hour sequence dispatch.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono text-slate-400 font-semibold">
                  PAYOUT AMOUNT (USD)
                </label>
                <button
                  type="button"
                  onClick={handleWithdrawAll}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  Withdraw Full Balance (${availableCash.toLocaleString()})
                </button>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="50"
                  max={availableCash}
                  step="any"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                PAYOUT SETTLEMENT CHANNEL
              </label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value="WIRE">Domestic Fedwire ($15 Fee, Same-Day Fed Routing)</option>
                <option value="ACH">ACH Institutional Direct Custody ($0 Fee, 48-72 Hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                VERIFIED BANKING DESTINATION
              </label>
              <input 
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            {/* Account Clearance Checkbox (Requirement 5) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <input
                type="checkbox"
                id="clearBalanceCheckbox"
                checked={clearBalanceOnComplete}
                onChange={e => setClearBalanceOnComplete(e.target.checked)}
                className="mt-1 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="clearBalanceCheckbox" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                <span className="font-bold text-white block">Automatic Account Clearance Upon Final Settlement</span>
                After the 72-hour simulated sequence completes successfully, update the double-entry transaction history and clear Jason Evans's account balance per institutional protocol.
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Disclosed Settlement Fee:</span>
                <span className="text-white font-bold">{method === 'WIRE' ? '$15.00 USD' : '$0.00 USD'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SLA Guaranteed Delivery:</span>
                <span className="text-emerald-400 font-bold">Strict 72-Hour SLA Window</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-950/60 transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>{loading ? 'Submitting to Clearinghouse...' : 'Submit Withdrawal (Start 72h SLA)'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: SLA Policy & Compliance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Institutional SLA Terms</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Double-Entry Reservation:</strong> Once submitted, requested capital is immediately held in the double-entry ledger to prevent overdraft while yielding custody compliance approval.
              </p>
              <p>
                <strong>2. 72-Hour Settlement Clock:</strong> The clearinghouse protocol progresses through compliance review, Fedwire generation, and final funds dispatch within 72 hours.
              </p>
              <p>
                <strong>3. Account Clearance:</strong> Upon final successful clearance, the system issues a verified completion confirmation and reconciles Jason Evans's cash account balance.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Questions Regarding Settlement?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              You can contact the operations administrator at any point during the 72-hour sequence via the built-in private chatroom.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('messages')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Consult Clearing Desk
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 6. TRANSACTIONS & LEDGER VIEW
// ==========================================
function TransactionsView({ currentUser }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setEntries(data.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Trail
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Double-Entry Financial Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">Server-authoritative debit/credit ledger records with SHA-256 cryptographic hashes.</p>
        </div>
        <span className="text-xs font-mono bg-slate-900 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800">
          100% RECONCILED
        </span>
      </div>

      <div className="rounded-2xl bg-[#0c101b] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">BALANCE AFTER</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">HASH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {entries.map((entry, idx) => {
                const isPositive = entry.amount >= 0;
                let badgeStyle = 'bg-slate-900 text-slate-300 border-slate-700';
                if (entry.type === 'BUY' || entry.type === 'DEPOSIT') {
                  badgeStyle = 'bg-emerald-950 text-emerald-400 border-emerald-800/60';
                } else if (entry.type === 'WITHDRAWAL' || entry.type === 'ACCOUNT_CLEARANCE') {
                  badgeStyle = 'bg-blue-950 text-blue-400 border-blue-800/60';
                } else if (entry.type === 'WITHDRAWAL_SETTLED') {
                  badgeStyle = 'bg-purple-950 text-purple-400 border-purple-800/60 font-bold';
                }

                return (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-slate-400">{entry.createdAt.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}${Math.abs(entry.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">${entry.balanceAfter.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{entry.description}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{entry.hash}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 7. USER PRIVATE CHATROOM VIEW (WITH TESLA OPERATIONS DESK - REQ 1)
// =========================================================================
function MessagesView({ currentUser, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = () => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const msgToSend = content;
    setContent('');

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: msgToSend, subject: 'Institutional Desk Inquiry' })
    });
    setLoading(false);
    fetchMessages();
  };

  const handleQuickPrompt = (promptText) => {
    setContent(promptText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Chatroom Header */}
      <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-red-950/60 border border-red-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Tesla Operations Administrative Desk</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Encrypted Private 1-on-1 Channel • <span className="text-emerald-400 font-semibold">Tier 2 Authorized</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate && onNavigate('deposit')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono transition"
          >
            + Deposit Capital
          </button>
          <button
            onClick={() => onNavigate && onNavigate('withdrawal')}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-bold font-mono transition"
          >
            Withdraw (72h SLA)
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl bg-[#0c101b] border border-slate-800 h-[520px] flex flex-col justify-between p-6 shadow-2xl overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="space-y-4 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs font-mono">
              Connecting to Tesla Operations Private Desk...
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.senderRole === 'USER';
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1 font-mono">
                    <span className="font-bold text-slate-300">{m.senderName}</span>
                    <span>•</span>
                    <span>{m.createdAt?.slice(11, 16) || 'Now'}</span>
                    {!isMe && (
                      <span className="bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded text-[9px]">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line shadow-md ${
                    isMe 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none font-sans'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Quick Prompts:</span>
            {[
              "Request official wire deposit coordinates for $5,000",
              "Check 72-hour withdrawal status and remaining time",
              "Inquire on current available settled cash balance"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white whitespace-nowrap transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form Composer */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Message the Tesla operations desk directly (e.g. deposit inquiry, wire confirmation)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <button 
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

// =========================================================================
// 8. ADMIN DASHBOARD & MONITORING VIEW (CENTRAL CLEARINGHOUSE - REQ 1-5)
// =========================================================================
function AdminView({ currentUser, onSuccess, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, withdrawals, deposits, chatrooms, ledger
  const [metrics, setMetrics] = useState(null);
  
  // Data sets
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);

  // Active chat in chatroom manager
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Balance Adjustment Modal
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [adjustMode, setAdjustMode] = useState('DELTA'); // DELTA or EXACT
  const [adjustAmount, setAdjustAmount] = useState('500');
  const [adjustReason, setAdjustReason] = useState('Institutional Wire Deposit Reconciliation');

  // Load all admin data
  const loadAdminData = () => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(() => {});

    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setAccounts(data.accounts || []);
      })
      .catch(() => {});

    fetch('/api/admin/withdrawals')
      .then(res => res.json())
      .then(data => setWithdrawals(data.withdrawals || []))
      .catch(() => {});

    fetch('/api/admin/deposits')
      .then(res => res.json())
      .then(data => setDeposits(data.deposits || []))
      .catch(() => {});

    fetch('/api/admin/conversations')
      .then(res => res.json())
      .then(data => {
        const convList = data.conversations || [];
        setConversations(convList);
        if (!selectedConvId && convList.length > 0) {
          setSelectedConvId(convList[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setLedgerEntries(data.transactions || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;
    const fetchChatMessages = () => {
      fetch(`/api/admin/conversations/${selectedConvId}/messages`)
        .then(res => res.json())
        .then(data => setConvMessages(data.messages || []))
        .catch(() => {});
    };
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 2500);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  // Handle balance adjustment (Requirement 2)
  const handleSaveBalanceAdjustment = async (e) => {
    e.preventDefault();
    if (!balanceModalUser) return;

    try {
      const endpoint = adjustMode === 'EXACT' ? '/api/admin/set-balance' : '/api/admin/adjust-balance';
      const payload = adjustMode === 'EXACT' 
        ? { userId: balanceModalUser.id, targetBalance: parseFloat(adjustAmount), reason: adjustReason }
        : { userId: balanceModalUser.id, amount: parseFloat(adjustAmount), reason: adjustReason };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: 'Account Balance Reconciled',
            message: `${balanceModalUser.fullName}'s balance updated to $${data.account?.availableCash?.toFixed(2)} USD. Reconciled immediately on user workstation.`
          });
        }
        setBalanceModalUser(null);
        loadAdminData();
      } else {
        alert(data.detail || 'Adjustment error');
      }
    } catch (e) {
      alert('Error updating balance');
    }
  };

  // Quick Clear User Balance to $0.00 (Requirement 5)
  const handleClearBalance = async (userId, userName) => {
    if (!confirm(`Are you sure you want to clear ${userName}'s balance to $0.00? This will append an ACCOUNT_CLEARANCE record in the double-entry ledger.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/clear-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: `Post-withdrawal settlement account clearance for ${userName}` })
      });
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: 'Account Balance Cleared',
            message: `${userName}'s cash balance has been cleared to $0.00. Updated immediately on user dashboard.`
          });
        }
        loadAdminData();
      }
    } catch (e) {}
  };

  // Advance 72h withdrawal step (Requirement 3)
  const handleAdvanceWithdrawal = async (wthId) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wthId}/advance`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: 'Withdrawal Sequence Advanced',
            message: `Advanced to ${data.withdrawal?.stepName || 'Next Step'}.`
          });
        }
        loadAdminData();
      }
    } catch (e) {}
  };

  // Complete withdrawal and clear balance (Requirement 3 & 5)
  const handleCompleteWithdrawal = async (wthId) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wthId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearBalance: true })
      });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: 'Withdrawal Successfully Cleared',
            message: `72h settlement completed. User account balance cleared to $0.00 per configured flow.`
          });
        }
        loadAdminData();
      }
    } catch (e) {}
  };

  // Approve incoming deposit (Requirement 1)
  const handleApproveDeposit = async (depId) => {
    try {
      const res = await fetch(`/api/admin/deposits/${depId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) {
          onSuccess({
            type: 'success',
            title: 'Deposit Approved & Credited',
            message: `Deposit reference ${data.deposit?.reference} credited to user available cash immediately.`
          });
        }
        loadAdminData();
      }
    } catch (e) {}
  };

  // Send admin reply in chatroom (Requirement 1 & 4)
  const handleSendAdminReply = async (customText = null) => {
    const text = customText || adminReplyText;
    if (!text.trim() || !selectedConvId) return;

    await fetch(`/api/admin/conversations/${selectedConvId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    });
    if (!customText) setAdminReplyText('');
    loadAdminData();
  };

  // Selected conversation object
  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Balance Adjustment Modal (Requirement 2) */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#0c101b] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Adjust User Balance</h3>
                <p className="text-xs text-slate-400 mt-0.5">{balanceModalUser.fullName} ({balanceModalUser.email})</p>
              </div>
              <button onClick={() => setBalanceModalUser(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAdjustMode('DELTA')}
                  className={`flex-1 py-1.5 rounded-lg transition ${adjustMode === 'DELTA' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  +/- Delta Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('EXACT')}
                  className={`flex-1 py-1.5 rounded-lg transition ${adjustMode === 'EXACT' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Set Exact Balance
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  {adjustMode === 'EXACT' ? 'TARGET CASH BALANCE (USD)' : 'ADJUSTMENT AMOUNT (+/- USD)'}
                </label>
                <input 
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  MANDATORY AUDIT REASON / LEDGER MEMO
                </label>
                <input 
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
                Changes will reflect <strong>immediately</strong> on the user's dashboard and append an immutable SHA-256 cryptographic entry to the double-entry financial ledger.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Mode Switcher */}
      <div className="pb-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-mono text-red-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Tesla Institutional Operations Clearinghouse
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Admin Command Control Desk</h2>
          <p className="text-xs text-slate-400 mt-1">Monitor registered users, balances, deposit enquiries, 72h withdrawal SLA queues, and private chatrooms.</p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'USER', email: 'investor@tesla-invest.com' })
              });
              window.location.reload();
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <User className="w-4 h-4" />
            <span>Switch to Jason Evans (Workstation)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Requirement 4) */}
      <div className="flex bg-[#0c101b] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar gap-1 text-xs font-mono">
        {[
          { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
          { id: 'users', label: 'User Balances & Accounts', icon: User, badge: users.length },
          { id: 'withdrawals', label: '72h Withdrawal Queue', icon: Clock, badge: withdrawals.filter(w => w.status !== 'COMPLETED').length },
          { id: 'deposits', label: 'Deposit Enquiries', icon: DollarSign, badge: deposits.filter(d => d.status === 'PENDING_REVIEW').length },
          { id: 'chatrooms', label: 'Private Chatrooms', icon: MessageSquare, badge: conversations.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0) },
          { id: 'ledger', label: 'Audit Ledger', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
                isActive ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white text-red-600 font-black' : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Total Custody AUM</span>
              <div className="text-xl font-bold text-white">${metrics?.totalAum?.toLocaleString() || '12,482.36'}</div>
              <span className="text-[10px] text-emerald-400">100% Backed</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Registered Users</span>
              <div className="text-xl font-bold text-emerald-400">{users.length} Active</div>
              <span className="text-[10px] text-slate-400">Tier 2 Verified</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Active 72h Queue</span>
              <div className="text-xl font-bold text-blue-400">{withdrawals.filter(w => w.status !== 'COMPLETED').length} Orders</div>
              <span className="text-[10px] text-blue-400">Under SLA Hold</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Deposit Enquiries</span>
              <div className="text-xl font-bold text-emerald-400">{deposits.filter(d => d.status === 'PENDING_REVIEW').length} Pending</div>
              <span className="text-[10px] text-slate-400">Awaiting Wire</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Chat Inquiries</span>
              <div className="text-xl font-bold text-red-400">{conversations.length} Active</div>
              <span className="text-[10px] text-red-400">{conversations.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0)} Unread</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Ledger Integrity</span>
              <div className="text-xl font-bold text-emerald-400">100% SHA-256</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Zero Discrepancy</span>
            </div>
          </div>

          {/* Quick Simulation Presentation Panel */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#0c101b] to-slate-900 border border-red-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                Simulation Presentation Harness
              </span>
              <h3 className="text-lg font-bold text-white">Live Transaction Workflow Controls</h3>
              <p className="text-xs text-slate-300">
                Instantly adjust user balances, advance the 72-hour withdrawal progression, or test chatroom coordination.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition"
              >
                Adjust Balances
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                Process 72h Withdrawals
              </button>
              <button
                onClick={() => setActiveTab('chatrooms')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Open User Chatrooms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER BALANCES & ACCOUNTS (Requirement 2) */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users &amp; Liquidity Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">Admin can monitor registered accounts and adjust individual account balances with immediate real-time reflection.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2.5 px-3">INVESTOR</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">KYC STATUS</th>
                  <th className="py-2.5 px-3">SETTLED CASH</th>
                  <th className="py-2.5 px-3">INVESTED BASIS</th>
                  <th className="py-2.5 px-3 text-right">BALANCE MANAGEMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u, idx) => {
                  const acc = accounts.find(a => a.userId === u.id);
                  const cash = acc ? acc.availableCash : 0.0;
                  const invested = acc ? acc.investedCapital : 0.0;

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-red-950 text-red-400 border border-red-800/50 flex items-center justify-center font-bold text-xs">
                          {u.fullName?.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{u.fullName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{u.email}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          {u.kycStatus || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                        ${cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        ${invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setAdjustAmount('500');
                              setAdjustMode('DELTA');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                          >
                            Adjust Balance
                          </button>
                          <button
                            onClick={() => handleClearBalance(u.id, u.fullName)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition"
                            title="Clear balance to $0.00"
                          >
                            Clear to $0
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('chatrooms');
                              const c = conversations.find(conv => conv.userId === u.id);
                              if (c) setSelectedConvId(c.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700"
                            title="Open Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 72-HOUR WITHDRAWAL PROCESSING QUEUE (Requirement 3 & 5) */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>72-Hour Withdrawal Processing Desk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Submitted requests appear here for compliance review, sequential step progression, and final account clearance.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2.5 px-3">REF &amp; USER</th>
                  <th className="py-2.5 px-3">NET PAYOUT</th>
                  <th className="py-2.5 px-3">DESTINATION</th>
                  <th className="py-2.5 px-3">72H SEQUENCE STATUS</th>
                  <th className="py-2.5 px-3">REMAINING</th>
                  <th className="py-2.5 px-3 text-right">ADMIN PROCESSING ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withdrawals.map((w, idx) => {
                  const isCompleted = w.status === 'COMPLETED';
                  const stepNum = isCompleted ? 4 : (w.step || 1);

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{w.reference}</div>
                        <div className="text-[10px] text-slate-400">{w.userName} ({w.userEmail})</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                        ${parseFloat(w.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 max-w-xs truncate">
                        {w.destinationMasked}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isCompleted 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                            : 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
                        }`}>
                          {isCompleted ? 'SETTLED & CLEARED' : `STAGE ${stepNum}/4: ${w.stepName || 'Review'}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-blue-400">
                        {isCompleted ? '0h (Done)' : `${w.hoursRemaining || 72}h Remaining`}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {!isCompleted ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleAdvanceWithdrawal(w.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                              title="Advance to next 24-hour sequence stage"
                            >
                              Advance Stage (24h)
                            </button>
                            <button
                              onClick={() => handleCompleteWithdrawal(w.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                              title="Complete settlement immediately and clear user account"
                            >
                              Complete &amp; Clear
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Payout Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DEPOSIT ENQUIRIES DESK (Requirement 1) */}
      {activeTab === 'deposits' && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Custodial Deposit Enquiries Desk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Incoming wire and deposit notifications. Admin can verify funds and credit user accounts with one click.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2.5 px-3">REF &amp; USER</th>
                  <th className="py-2.5 px-3">ALLOCATION AMOUNT</th>
                  <th className="py-2.5 px-3">METHOD</th>
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">APPROVAL ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deposits.map((dep, idx) => {
                  const isApproved = dep.status === 'APPROVED';
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{dep.reference}</div>
                        <div className="text-[10px] text-slate-400">{dep.userName} ({dep.userEmail})</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                        ${parseFloat(dep.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{dep.method}</td>
                      <td className="py-3.5 px-3 text-slate-400">{dep.createdAt?.slice(0, 19).replace('T', ' ')}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-blue-950 text-blue-400 border-blue-800 animate-pulse'
                        }`}>
                          {isApproved ? 'CREDITED TO BALANCE' : 'AWAITING APPROVAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {!isApproved ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                            >
                              Approve &amp; Credit
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab('chatrooms');
                                const c = conversations.find(conv => conv.userId === dep.userId);
                                if (c) setSelectedConvId(c.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs"
                            >
                              Open Chat
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Reconciled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CENTRALIZED PRIVATE CHATROOMS DESK (Requirements 1 & 4) */}
      {activeTab === 'chatrooms' && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Centralized Investor Chatrooms Desk</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Admin can manage conversations, send wire deposit coordinates, and issue status updates directly to users.</p>
          </div>

          {/* Split Screen Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] rounded-2xl bg-slate-950 border border-slate-800/80 p-4 overflow-hidden">
            
            {/* Left Column: Investor Threads List (4 cols) */}
            <div className="lg:col-span-4 border-r border-slate-800 pr-3 space-y-2 overflow-y-auto">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block px-2 mb-2">
                User Threads ({conversations.length})
              </span>

              {conversations.map(c => {
                const isSelected = c.id === selectedConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition border ${
                      isSelected ? 'bg-slate-900 border-red-500/50 shadow-md' : 'bg-slate-950/60 border-slate-900 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{c.userFullName || c.userName}</span>
                      </div>
                      {c.unreadAdminCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-bold">
                          {c.unreadAdminCount} new
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-1">
                      {c.lastMessage?.content || c.subject}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                      <span>Cash: ${parseFloat(c.availableCash || 0).toLocaleString()}</span>
                      <span>{c.lastMessageAt?.slice(11, 16) || 'Today'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Conversation (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full pl-2">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{selectedConv.userFullName || selectedConv.userName}</span>
                        <span className="text-xs text-slate-400 font-mono">({selectedConv.userEmail})</span>
                      </h4>
                      <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        Current Cash: ${parseFloat(selectedConv.availableCash || 0).toLocaleString()} USD • Direct L3 Channel
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendAdminReply("OFFICIAL CUSTODIAL WIRE INSTRUCTIONS:\nBeneficiary: Tesla Capital Custody LLC\nBank: JPMorgan Chase Bank, N.A. (New York, NY)\nRouting Number: 021000021 (Fedwire)\nSWIFT/BIC: CHASUS33\nEscrow Account: ****7892\nMemo Code: REF-TSLA-98421-EVANS\n\nPlease reply with your bank wire reference number once dispatched.")}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-mono transition"
                      >
                        Send Wire Coordinates
                      </button>
                      <button
                        onClick={() => handleSendAdminReply("UPDATE: Your pending withdrawal request has passed KYC compliance and is currently queued for Federal Reserve Fedwire dispatch within the 72-hour guaranteed SLA window.")}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-[10px] font-bold font-mono transition"
                      >
                        Send 72h Update
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
                    {convMessages.map((m, idx) => {
                      const isUser = m.senderRole === 'USER';
                      return (
                        <div key={idx} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1 font-mono">
                            <span className="font-bold text-slate-300">{m.senderName}</span>
                            <span>•</span>
                            <span>{m.createdAt?.slice(11, 16) || 'Now'}</span>
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line shadow ${
                            isUser 
                              ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans' 
                              : 'bg-red-600 text-white rounded-tr-none'
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Reply Form */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendAdminReply();
                      }} 
                      className="flex gap-2"
                    >
                      <input 
                        type="text"
                        value={adminReplyText}
                        onChange={e => setAdminReplyText(e.target.value)}
                        placeholder="Reply to investor or send official wire coordinates..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                      <button 
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Reply</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center py-40 text-slate-500 text-xs font-mono">
                  Select a user conversation from the left to start communicating.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-3xl bg-[#0c101b] border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Master Double-Entry Financial Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cryptographic SHA-256 ledger records across all institutional investor accounts.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              100% RECONCILED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 pb-2">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">BALANCE AFTER</th>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">SHA-256 HASH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerEntries.map((e, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-slate-400">{e.createdAt?.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-900 text-slate-300 border-slate-700">
                        {e.type}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-bold ${e.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {e.amount >= 0 ? '+' : ''}${Math.abs(e.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">${e.balanceAfter?.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-sm truncate">{e.description}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{e.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// 9. DEDICATED ADMIN LOGIN VIEW (OBSIDIAN & CRIMSON SECURITY VAULT)
// =========================================================================
function AdminLoginView({ onAdminLoggedIn, onSwitchToInvestorLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('8942-AUTH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role !== 'ADMIN') {
          setError('Access Denied: This account lacks clearinghouse administrator privileges.');
          setLoading(false);
          return;
        }
        onAdminLoggedIn(data.user);
      } else {
        setError(data.detail || 'Authentication credentials rejected.');
      }
    } catch (err) {
      setError('Clearinghouse gateway unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 relative">
      <div className="p-8 sm:p-10 rounded-3xl bg-[#090b12] border-2 border-red-900/60 shadow-[0_20px_70px_-15px_rgba(232,33,39,0.3)] space-y-6">
        
        {/* Security Vault Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-[0_0_20px_rgba(232,33,39,0.4)]">
            <Lock className="w-7 h-7 text-red-500" />
          </div>
          <span className="px-3 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-bold tracking-widest uppercase">
            RESTRICTED ACCESS
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Tesla Operations Clearinghouse
          </h2>
          <p className="text-xs text-slate-400">
            Administrative terminal for double-entry ledger oversight and compliance.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700/60 text-red-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              ADMINISTRATIVE EMAIL
            </label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tesla-invest.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              SECURITY PASSCODE
            </label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              SECURITY KEY / MFA TOKEN
            </label>
            <input 
              type="text"
              value={securityPin}
              onChange={e => setSecurityPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              required
            />
          </div>

          {/* Institutional Admin Clearance Card */}
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Default Operations Clearance:</div>
            <div className="flex flex-col sm:flex-row justify-between text-slate-300 gap-1">
              <span>User: <strong className="text-white">admin@tesla-invest.com</strong></span>
              <span>Pass: <strong className="text-white">AdminPass123!</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/70 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'Authenticating Clearance...' : 'Verify Administrative Key'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Not an administrative operator?{' '}
          <button onClick={onSwitchToInvestorLogin} className="text-slate-300 font-bold hover:text-white underline">
            Investor Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. INVESTOR REGISTER & LOGIN VIEWS
// ==========================================
function RegisterView({ onRegistered, onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      onRegistered(data.user);
    } else {
      alert(data.detail || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="p-8 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">T</div>
          <h2 className="text-2xl font-extrabold text-white">Create Investor Account</h2>
          <p className="text-xs text-slate-400 mt-1">Double-entry ledger custody verification with immediate account activation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">LEGAL FULL NAME</label>
            <input 
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jason Evans"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PASSWORD</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Create Institutional Account
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <button onClick={onSwitchToLogin} className="text-red-400 font-bold hover:underline">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLoggedIn, onSwitchToRegister, onSwitchToAdmin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      onLoggedIn(data.user);
    } else {
      alert(data.detail || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="p-8 rounded-3xl bg-[#0c101b] border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">T</div>
          <h2 className="text-2xl font-extrabold text-white">Investor Login</h2>
          <p className="text-xs text-slate-400 mt-1">Access your double-entry portfolio workstation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="investor@tesla-invest.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PASSWORD</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          {/* Institutional Account Credential Note */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Investor Account:</div>
            <div className="flex flex-col sm:flex-row justify-between text-slate-300 gap-1">
              <span>Email: <strong className="text-white">investor@tesla-invest.com</strong></span>
              <span>Pass: <strong className="text-white">Password123!</strong></span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Sign In to Workstation
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center space-y-2 text-xs text-slate-400">
          <div>
            Need an account?{' '}
            <button onClick={onSwitchToRegister} className="text-red-400 font-bold hover:underline">
              Register here
            </button>
          </div>
          <div>
            Operations Operator?{' '}
            <button onClick={onSwitchToAdmin} className="text-slate-300 font-semibold hover:text-white underline">
              Admin Portal Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// MOUNT REACT APP
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
