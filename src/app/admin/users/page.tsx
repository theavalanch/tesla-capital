'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Search,
  DollarSign,
  UserCheck,
  UserX,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sliders,
  X,
  MessageSquare,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('500');
  const [adjustCategory, setAdjustCategory] = useState<string>('CORRECTION');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<any | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, status: nextStatus }),
    });
    fetchUsers();
  };

  const handleOpenAdjustment = (user: any) => {
    setSelectedUser(user);
    setAdjustAmount('500');
    setAdjustCategory('CORRECTION');
    setAdjustReason('');
    setInternalNote('');
    setAdjustError(null);
    setAdjustSuccess(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAdjustLoading(true);
    setAdjustError(null);

    const numAmount = parseFloat(adjustAmount);
    if (isNaN(numAmount) || numAmount === 0) {
      setAdjustError('Please enter a valid non-zero adjustment amount');
      setAdjustLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          amount: numAmount,
          category: adjustCategory,
          reason: adjustReason,
          internalNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Adjustment failed');

      setAdjustSuccess(data);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Adjustment failed';
      setAdjustError(msg);
    } finally {
      setAdjustLoading(false);
    }
  };

  const numAmt = parseFloat(adjustAmount) || 0;
  const currentCash = selectedUser?.availableCash || 0;
  const resultingCash = Math.round((currentCash + numAmt) * 100) / 100;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Investor Accounts</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage registered investors, verify KYC statuses, and execute controlled balance adjustments.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by investor name or email..."
            className="w-full bg-[#0E1117] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
          />
        </div>

        {/* Users Table */}
        <div className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                  <th className="py-4 px-6">Investor</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6">Available Cash</th>
                  <th className="py-4 px-6">Invested (TSLA)</th>
                  <th className="py-4 px-6">Total AUM</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {loading ? 'Loading users...' : 'No investors found.'}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          {u.kycStatus || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        ${u.availableCash.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-300">
                        ${u.investedCapital.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                        ${u.totalPortfolioValue.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/messages?userId=${u.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#E82127]" />
                          <span>Message</span>
                        </Link>
                        <button
                          onClick={() => handleOpenAdjustment(u)}
                          className="px-3 py-1.5 rounded-xl bg-[#E82127]/15 hover:bg-[#E82127]/25 text-[#E82127] border border-[#E82127]/30 text-xs font-semibold transition-colors"
                        >
                          Adjust Balance
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONTROLLED ACCOUNT BALANCE ADJUSTMENT MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#0E1117] border border-white/10 shadow-2xl p-6 sm:p-8">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {adjustSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Balance Adjusted & Audited</h3>
                  <p className="text-xs text-gray-400">
                    Audit Reference:{' '}
                    <span className="font-mono font-bold text-white">
                      {adjustSuccess.ledgerEntry?.reference}
                    </span>
                  </p>

                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 text-left text-xs space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Investor:</span>
                      <span className="font-bold text-white">{selectedUser.fullName}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Adjustment Amount:</span>
                      <span className="font-mono font-bold text-white">
                        {numAmt >= 0 ? '+' : ''}${numAmt.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-t border-white/5 pt-2">
                      <span>New Available Balance:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${adjustSuccess.account?.availableCash.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-full py-3 rounded-full bg-[#E82127] text-white font-semibold text-xs hover:bg-[#FF2E35] transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 text-[#E82127] mb-2 font-mono text-xs uppercase font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Controlled Ledger Adjustment</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Adjust Account Balance</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Modifying cash balance for{' '}
                    <span className="text-white font-semibold">{selectedUser.fullName}</span> ({selectedUser.email}).
                  </p>

                  {adjustError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adjustError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdjustSubmit} className="mt-6 space-y-4">
                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Adjustment Amount (USD) - Use negative sign for deduction
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="e.g. 500 or -250"
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#E82127]"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Adjustment Category
                      </label>
                      <select
                        value={adjustCategory}
                        onChange={(e) => setAdjustCategory(e.target.value)}
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#E82127]"
                      >
                        <option value="CORRECTION">Correction (Ledger Discrepancy)</option>
                        <option value="BONUS">Promotional Credit / Deposit Match</option>
                        <option value="RECONCILIATION">Custodial Bank Wire Reconciliation</option>
                        <option value="FEE_REBATE">Fee Rebate</option>
                        <option value="OTHER">Other Compliance Adjustment</option>
                      </select>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Mandatory Audit Reason (Visible in Ledger)
                      </label>
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="e.g. Cleared offshore wire batch verification"
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#E82127]"
                        required
                      />
                    </div>

                    {/* Internal Note */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Internal Administrative Note (Optional)
                      </label>
                      <textarea
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Internal compliance reference tickets or audit IDs..."
                        rows={2}
                        className="w-full bg-[#141822] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#E82127]"
                      />
                    </div>

                    {/* Impact Preview Box */}
                    <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Current Available Cash:</span>
                        <span className="font-mono text-white">${currentCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Proposed Adjustment:</span>
                        <span className={`font-mono font-bold ${numAmt >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {numAmt >= 0 ? '+' : ''}${numAmt.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-200 border-t border-white/5 pt-2">
                        <span className="font-semibold">Resulting Balance:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ${resultingCash.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={adjustLoading || numAmt === 0 || !adjustReason.trim() || resultingCash < 0}
                      className="w-full py-3.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-xs shadow-lg shadow-[#E82127]/30 disabled:opacity-50 transition-all"
                    >
                      {adjustLoading ? 'Executing Adjustment...' : 'Confirm Audited Balance Adjustment'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
