'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import { Download, Filter, ArrowDownLeft, ArrowUpRight, DollarSign, RefreshCw } from 'lucide-react';

export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    const url = filterType === 'ALL' ? '/api/transactions' : `/api/transactions?type=${filterType}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setAccount(data.account);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const handleDownloadCsv = () => {
    window.location.href = `/api/transactions?export=csv${filterType !== 'ALL' ? `&type=${filterType}` : ''}`;
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Transaction History</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Audited ledger records for deposits, withdrawals, and TSLA trade executions.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1A202E] border border-white/10 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Statement (CSV)</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'DEPOSIT', label: 'Deposits' },
              { id: 'WITHDRAWAL', label: 'Withdrawals' },
              { id: 'BUY_STOCK', label: 'Stock Buys' },
              { id: 'SELL_STOCK', label: 'Stock Sales' },
              { id: 'ADMIN_ADJUSTMENT', label: 'Adjustments' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filterType === f.id
                    ? 'bg-[#E82127] text-white shadow-md shadow-[#E82127]/25 font-semibold'
                    : 'bg-[#0E1117] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ledger Table */}
          <div className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Reference</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        {loading ? 'Loading ledger records...' : 'No transactions matching this filter.'}
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const isPositive = entry.amount > 0;
                      return (
                        <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                            {new Date(entry.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-4 px-6 font-mono font-semibold text-white">
                            {entry.reference}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                entry.type === 'DEPOSIT' || entry.type === 'SELL_STOCK'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : entry.type === 'WITHDRAWAL' || entry.type === 'BUY_STOCK'
                                  ? 'bg-red-500/15 text-red-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {entry.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-300 max-w-xs truncate">
                            {entry.description}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold whitespace-nowrap">
                            <span className={isPositive ? 'text-emerald-400' : 'text-gray-200'}>
                              {isPositive ? '+' : ''}${entry.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-gray-400 whitespace-nowrap">
                            ${entry.balanceAfter.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
