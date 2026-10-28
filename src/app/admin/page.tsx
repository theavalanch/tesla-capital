'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Users,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) {
          setMetrics(data.metrics);
          setRecentLogs(data.recentAuditLogs || []);
        }
      })
      .catch((err) => console.error('Error fetching admin metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Platform AUM',
      value: metrics ? `$${metrics.totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
      sub: metrics ? `Cash: $${metrics.totalCash.toFixed(2)} | Stock: $${metrics.totalStockValue.toFixed(2)}` : '',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Registered Investors',
      value: metrics ? metrics.totalUsers : 0,
      sub: 'Active brokerage accounts',
      icon: Users,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      label: 'Pending Deposits',
      value: metrics ? metrics.pendingDeposits : 0,
      sub: 'Action required for credit',
      icon: ArrowDownCircle,
      color: 'text-amber-400 bg-amber-500/10',
      alert: metrics?.pendingDeposits > 0,
      link: '/admin/deposits',
    },
    {
      label: 'Pending Withdrawals (72h SLA)',
      value: metrics ? metrics.pendingWithdrawals : 0,
      sub: 'Within compliance window',
      icon: ArrowUpCircle,
      color: 'text-[#E82127] bg-[#E82127]/10',
      alert: metrics?.pendingWithdrawals > 0,
      link: '/admin/withdrawals',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#E82127] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#E82127] animate-pulse" />
            <span>Operational Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Institutional Oversight & Liquidity
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Authoritative platform ledger, withdrawal queuing, and balance controls.
          </p>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {s.alert && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E82127] animate-ping" />
                  )}
                </div>

                <div>
                  <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">{s.value}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{s.sub}</div>
                </div>

                {s.link && (
                  <Link
                    href={s.link}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-[#E82127] hover:underline pt-1"
                  >
                    <span>Manage Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Middle Quick Actions & Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Shortcuts (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-[#0E1117] border border-white/5 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Administrator Actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Link
                href="/admin/users"
                className="p-4 rounded-2xl bg-[#141822] border border-white/5 hover:border-white/20 transition-all space-y-1 group"
              >
                <div className="font-semibold text-white group-hover:text-[#E82127] flex items-center justify-between">
                  <span>Balance Adjustment</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#E82127]" />
                </div>
                <div className="text-gray-400 text-[11px]">
                  Apply audited corrections or credits with mandatory justification.
                </div>
              </Link>

              <Link
                href="/admin/deposits"
                className="p-4 rounded-2xl bg-[#141822] border border-white/5 hover:border-white/20 transition-all space-y-1 group"
              >
                <div className="font-semibold text-white group-hover:text-emerald-400 flex items-center justify-between">
                  <span>Verify Deposits</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
                </div>
                <div className="text-gray-400 text-[11px]">
                  Match inbound bank wire references and credit balances atomically.
                </div>
              </Link>

              <Link
                href="/admin/withdrawals"
                className="p-4 rounded-2xl bg-[#141822] border border-white/5 hover:border-white/20 transition-all space-y-1 group"
              >
                <div className="font-semibold text-white group-hover:text-cyan-400 flex items-center justify-between">
                  <span>Process Withdrawals</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </div>
                <div className="text-gray-400 text-[11px]">
                  Execute approved payout batches under 72h SLA targets.
                </div>
              </Link>

              <Link
                href="/admin/messages"
                className="p-4 rounded-2xl bg-[#141822] border border-white/5 hover:border-white/20 transition-all space-y-1 group"
              >
                <div className="font-semibold text-white group-hover:text-amber-400 flex items-center justify-between">
                  <span>Investor Support Inbox</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400" />
                </div>
                <div className="text-gray-400 text-[11px]">
                  Reply to user inquiries with two-way encrypted channels.
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Audit Logs (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-[#0E1117] border border-white/5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Immutable Audit Trail Feed</h2>
                <Link href="/admin/audit-logs" className="text-xs text-[#E82127] hover:underline font-semibold">
                  View Full Logs
                </Link>
              </div>

              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500">
                    No audit records logged yet.
                  </div>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-[#141822] border border-white/5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white font-mono text-[11px]">
                          {log.action}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Target: {log.targetUserEmail || 'System'} • By: {log.adminEmail}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] text-gray-400">
              Every sensitive action is cryptographically signed and stored in immutable database audit logs.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
