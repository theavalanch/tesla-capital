'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Star,
  Newspaper,
  BookOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  MessageSquare,
  Settings,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  unreadMessages?: number;
  isAdmin?: boolean;
}

export default function Sidebar({ unreadMessages: initialUnread = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(initialUnread);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Poll for unread message counts automatically every 4 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadMessages || 0);
        }
      } catch (err) {
        // silent fail for polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio', href: '/portfolio', icon: PieChart },
    { label: 'Trade', href: '/trade', icon: ArrowLeftRight },
    { label: 'Watchlist', href: '/market', icon: Star },
    { label: 'Deposit', href: '/deposit', icon: ArrowDownCircle },
    { label: 'Withdrawal', href: '/withdrawal', icon: ArrowUpCircle },
    { label: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Research', href: '/how-it-works', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer (visible when mobileDrawerOpen on < md) */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-[#08090C] border-r border-white/10 h-full p-6 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-2"
                >
                  <svg viewBox="0 0 342 35" className="h-4 w-auto fill-white">
                    <path d="M0 .1a9.7 9.7 0 0 0 7 7h11v27h7v-27h11a9.7 9.7 0 0 0 7-7H0zm64 0l-7 34h7l2-11h14l2 11h7l-7-34H64zm7 17l4-11 4 11H71zm57-17l-1 5a10 10 0 0 0-8-1 10 10 0 0 0-9 10 10 10 0 0 0 9 10 10 10 0 0 0 8-1l1 5a15 15 0 0 1-9 2 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 10 2zm34 0v34h7V6h15V.1h-22zm44 0v34h25v-6h-18V.1h-7zm52 0l-7 34h7l2-11h14l2 11h7l-7-34h-18zm7 17l4-11 4 11h-8z" />
                  </svg>
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#E82127]/15 text-white border border-[#E82127]/30 shadow-[0_0_15px_rgba(232,33,39,0.15)]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#E82127]' : 'text-gray-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E82127] text-white shadow-sm shadow-[#E82127]/50 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/5">
              <Link
                href="/admin"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center justify-between text-xs text-gray-400 hover:text-white p-2.5 rounded-xl bg-[#0E1117] border border-white/5"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#E82127]" />
                  <span>Admin Controls</span>
                </div>
                <span className="text-[11px] text-[#E82127] font-semibold">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (< md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090C]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center space-y-1 p-1 text-[10px] font-medium transition-colors ${
            pathname === '/dashboard' ? 'text-[#E82127]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/portfolio"
          className={`flex flex-col items-center space-y-1 p-1 text-[10px] font-medium transition-colors ${
            pathname === '/portfolio' ? 'text-[#E82127]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Portfolio</span>
        </Link>

        <Link
          href="/trade"
          className={`flex flex-col items-center space-y-1 p-1 text-[10px] font-medium transition-colors ${
            pathname === '/trade' ? 'text-[#E82127]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Trade</span>
        </Link>

        <Link
          href="/messages"
          className={`relative flex flex-col items-center space-y-1 p-1 text-[10px] font-medium transition-colors ${
            pathname === '/messages' ? 'text-[#E82127]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-[#E82127] text-white text-[9px] font-bold shadow-sm shadow-[#E82127]/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Messages</span>
        </Link>

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center space-y-1 p-1 text-[10px] font-medium text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>

      {/* Desktop Sidebar (hidden on < md, flex on >= md) */}
      <aside className="hidden md:flex w-64 bg-[#08090C] border-r border-white/5 flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center space-x-2.5 mb-8 group">
            <svg
              viewBox="0 0 342 35"
              className="h-4.5 w-auto fill-white group-hover:fill-[#E82127] transition-colors"
            >
              <path d="M0 .1a9.7 9.7 0 0 0 7 7h11v27h7v-27h11a9.7 9.7 0 0 0 7-7H0zm64 0l-7 34h7l2-11h14l2 11h7l-7-34H64zm7 17l4-11 4 11H71zm57-17l-1 5a10 10 0 0 0-8-1 10 10 0 0 0-9 10 10 10 0 0 0 9 10 10 10 0 0 0 8-1l1 5a15 15 0 0 1-9 2 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 10 2zm34 0v34h7V6h15V.1h-22zm44 0v34h25v-6h-18V.1h-7zm52 0l-7 34h7l2-11h14l2 11h7l-7-34h-18zm7 17l4-11 4 11h-8z" />
            </svg>
          </Link>

          {/* Navigation list */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#E82127]/15 text-white border border-[#E82127]/30 shadow-[0_0_15px_rgba(232,33,39,0.15)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#E82127]' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E82127] text-white shadow-sm shadow-[#E82127]/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Portal Gateway */}
        <div className="p-4 m-4 rounded-2xl bg-[#0E1117] border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#E82127]" />
              <span className="text-xs font-medium text-gray-300">Admin Controls</span>
            </div>
            <Link
              href="/admin"
              className="text-[11px] font-semibold text-[#E82127] hover:underline"
            >
              Access &rarr;
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
