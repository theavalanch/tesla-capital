'use client';

import React from 'react';
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
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users & Balances', href: '/admin/users', icon: Users },
    { label: 'Deposit Requests', href: '/admin/deposits', icon: ArrowDownCircle },
    { label: 'Withdrawal SLA Queue', href: '/admin/withdrawals', icon: ArrowUpCircle },
    { label: 'Support Desk', href: '/admin/messages', icon: MessageSquare },
    { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: FileText },
    { label: 'Platform Settings', href: '/admin/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#08090C] border-r border-white/5 flex flex-col justify-between shrink-0 min-h-screen">
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
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E82127] text-white shadow-lg shadow-[#E82127]/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
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
  );
}
