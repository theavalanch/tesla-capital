'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickLogin = async (email: string) => {
    setIsLoggingIn(true);
    setShowDemoMenu(false);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: email.includes('admin') ? 'AdminPass123!' : 'Password123!',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (e) {
      console.error('Demo login error', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#060709]/85 backdrop-blur-2xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching the screenshot */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex items-center space-x-2 text-white">
            <svg viewBox="0 0 342 35" className="h-4.5 w-auto fill-white group-hover:fill-[#E82127] transition-colors">
              <path d="M0 .1a9.7 9.7 0 0 0 7 7h11v27h7v-27h11a9.7 9.7 0 0 0 7-7H0zm64 0l-7 34h7l2-11h14l2 11h7l-7-34H64zm7 17l4-11 4 11H71zm57-17l-1 5a10 10 0 0 0-8-1 10 10 0 0 0-9 10 10 10 0 0 0 9 10 10 10 0 0 0 8-1l1 5a15 15 0 0 1-9 2 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 10 2zm34 0v34h7V6h15V.1h-22zm44 0v34h25v-6h-18V.1h-7zm52 0l-7 34h7l2-11h14l2 11h7l-7-34h-18zm7 17l4-11 4 11h-8z"/>
            </svg>
          </div>
          <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
            INVEST
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/market" className="hover:text-white transition-colors">
            Invest
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/news" className="hover:text-white transition-colors">
            News
          </Link>
          <Link href="/faqs" className="hover:text-white transition-colors">
            FAQs
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Support
          </Link>
        </div>

        {/* Right Actions & Demo Login */}
        <div className="flex items-center space-x-3.5">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#10141E] hover:bg-[#161C2B] text-gray-200 border border-white/10 shadow-sm transition-all"
            >
              <span>Demo Roles</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2.5 w-68 rounded-2xl bg-[#0B0E14] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 px-3 py-1.5 border-b border-white/5">
                  Instant One-Click Demo Access
                </div>
                <button
                  onClick={() => handleQuickLogin('investor@tesla-invest.com')}
                  disabled={isLoggingIn}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    JE
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Jason Evans
                    </div>
                    <div className="text-[10px] text-gray-400">Investor ($12,482 AUM)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin('admin@tesla-invest.com')}
                  disabled={isLoggingIn}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold text-xs border border-[#E82127]/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E82127] transition-colors">
                      Tesla Admin
                    </div>
                    <div className="text-[10px] text-gray-400">Ledger Ops & Balances</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-3">
              <Link
                href={currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#10141E] hover:bg-[#161C2B] border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#E82127]" />
                <span>{currentUser.role === 'ADMIN' ? 'Admin Portal' : 'Dashboard'}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="tesla-btn-red px-5 py-2 text-xs font-bold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
