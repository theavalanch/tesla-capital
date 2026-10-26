'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Search,
  Check,
  X,
} from 'lucide-react';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDeposits = () => {
    setLoading(true);
    fetch('/api/admin/deposits')
      .then((res) => res.json())
      .then((data) => setDeposits(data.deposits || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (depositId: string) => {
    setActionError(null);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      fetchDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      setActionError(msg);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectReason.trim()) return;

    setActionError(null);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: rejectingId, action: 'REJECT', reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');
      setRejectingId(null);
      setRejectReason('');
      fetchDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      setActionError(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Deposit Inbound Queue</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Review inbound client funding requests, verify banking transactions, and credit balances.
          </p>
        </div>

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Deposit List */}
        <div className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Investor</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {loading ? 'Loading deposits...' : 'No deposit requests in queue.'}
                    </td>
                  </tr>
                ) : (
                  deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] text-gray-400">
                        {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-white">
                        {d.reference}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{d.userName}</div>
                        <div className="text-[10px] text-gray-400">{d.userEmail}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-medium">
                        {d.method}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-sm">
                        ${d.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : d.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {d.status === 'PENDING_REVIEW' ? (
                          <>
                            <button
                              onClick={() => handleApprove(d.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                            >
                              Approve & Credit
                            </button>
                            <button
                              onClick={() => setRejectingId(d.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-gray-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md rounded-3xl bg-[#0E1117] border border-white/10 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Decline Deposit Request</h3>
              <p className="text-xs text-gray-400">
                Provide a recorded reason for declining this deposit request.
              </p>

              <form onSubmit={handleReject} className="space-y-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete wire routing reference or sender mismatch"
                  rows={3}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E82127]"
                  required
                />

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
