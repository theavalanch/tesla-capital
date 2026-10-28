'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  MessageSquare,
  FileText,
  Sliders,
  ArrowLeft,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Poll for unread message counts automatically every 4 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread');
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.unreadMessages || 0);
        }
      } catch (err) {
        console.error('Failed to fetch unread admin message count:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users & Balances', href: '/admin/users', icon: Users },
    { label: 'Deposit Requests', href: '/admin/deposits', icon: ArrowDownCircle },
    { label: 'Withdrawal SLA Queue', href: '/admin/withdrawals', icon: ArrowUpCircle },
    {
      label: 'Support Desk',
      href: '/admin/messages',
      icon: MessageSquare,
      badge: unreadMessages,
    },
    { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: FileText },
    { label: 'Platform Settings', href: '/admin/settings', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar (< md) */}
      <div className="md:hidden w-full bg-[#08090C] border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center space-x-2 text-[#E82127]">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
            TESLA ADMIN
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/messages"
            className="relative p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#E82127] text-white text-[10px] font-bold shadow-md shadow-[#E82127]/50 animate-pulse">
                {unreadMessages}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-[#08090C] border-r border-white/10 h-full p-6 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center space-x-2 text-[#E82127]">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-bold text-xs tracking-wider uppercase text-white font-mono">
                    TESLA ADMIN
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {links.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#E82127] text-white shadow-lg shadow-[#E82127]/25'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E82127] text-white text-[10px] font-bold shadow-sm shadow-[#E82127]/50">
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
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 text-[#E82127]" />
                <span>Return to User App</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on < md, visible on >= md) */}
      <aside className="hidden md:flex w-64 bg-[#08090C] border-r border-white/5 flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-6">
          {/* Brand Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[#E82127]">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-extrabold text-sm tracking-wider uppercase text-white font-mono">
                TESLA ADMIN
              </span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">
              Institutional Operations Portal
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1.5">
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E82127] text-white shadow-lg shadow-[#E82127]/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E82127] text-white text-[10px] font-bold shadow-sm shadow-[#E82127]/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-[#0E1117] border border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4 text-[#E82127]" />
              <span>Return to User App</span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
