'use client';

import React from 'react';
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
} from 'lucide-react';

interface SidebarProps {
  unreadMessages?: number;
  isAdmin?: boolean;
}

export default function Sidebar({ unreadMessages = 0, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio', href: '/portfolio', icon: PieChart },
    { label: 'Trade', href: '/trade', icon: ArrowLeftRight },
    { label: 'Watchlist', href: '/market', icon: Star },
    { label: 'Deposit', href: '/deposit', icon: ArrowDownCircle },
    { label: 'Withdrawal', href: '/withdrawal', icon: ArrowUpCircle },
    { label: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadMessages },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Research', href: '/how-it-works', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#08090C] border-r border-white/5 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-2.5 mb-8 group">
          <svg viewBox="0 0 342 35" className="h-4.5 w-auto fill-white group-hover:fill-[#E82127] transition-colors">
            <path d="M0 .1a9.7 9.7 0 0 0 7 7h11v27h7v-27h11a9.7 9.7 0 0 0 7-7H0zm64 0l-7 34h7l2-11h14l2 11h7l-7-34H64zm7 17l4-11 4 11H71zm57-17l-1 5a10 10 0 0 0-8-1 10 10 0 0 0-9 10 10 10 0 0 0 9 10 10 10 0 0 0 8-1l1 5a15 15 0 0 1-9 2 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 10 2zm34 0v34h7V6h15V.1h-22zm44 0v34h25v-6h-18V.1h-7zm52 0l-7 34h7l2-11h14l2 11h7l-7-34h-18zm7 17l4-11 4 11h-8z"/>
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
                    className={`w-4 h-4 ${isActive ? 'text-[#E82127]' : 'text-gray-400 group-hover:text-white'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E82127] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Portal Gateway (always accessible for testing) */}
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
  );
}
