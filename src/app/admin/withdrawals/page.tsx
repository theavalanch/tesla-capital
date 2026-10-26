'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  QrCode,
  DollarSign,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchWithdrawals = () => {
    setLoading(true);
    fetch('/api/admin/withdrawals')
      .then((res) => res.json())
      .then((data) => setWithdrawals(data.withdrawals || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (
    withdrawalId: string,
    status: 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED',
    extra?: { payoutReference?: string; rejectionReason?: string }
  ) => {
    setActionError(null);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          status,
          payoutReference: extra?.payoutReference,
          rejectionReason: extra?.rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      setCompletingId(null);
      setRejectingId(null);
      setPayoutRef('');
      setRejectReason('');
      fetchWithdrawals();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setActionError(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdrawal Processing Queue</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Review and execute approved payout requests within the mandatory 72-hour processing window target.
          </p>
        </div>

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Withdrawal Table */}
        <div className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                  <th className="py-4 px-6">Date / 72h SLA</th>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Investor</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Amount & Net</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {loading ? 'Loading queue...' : 'No withdrawal requests pending.'}
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono text-gray-400 text-[11px]">
                          {new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Deadline: {new Date(w.deadlineAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-white">
                        {w.reference}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{w.userName}</div>
                        <div className="text-[10px] text-gray-400">{w.userEmail}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300 font-medium">{w.destinationMasked}</div>
                        <div className="text-[10px] text-gray-500">{w.method}</div>
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <div className="text-white font-bold">${w.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Net: ${w.netPayout.toFixed(2)} (Fee: ${w.fee.toFixed(2)})
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            w.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : w.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400'
                              : w.status === 'PROCESSING'
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {w.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {w.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(w.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {w.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'PROCESSING')}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
                            >
                              Send to Bank
                            </button>
                            <button
                              onClick={() => setCompletingId(w.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-semibold"
                            >
                              Complete Payout
                            </button>
                          </>
                        )}

                        {w.status === 'PROCESSING' && (
                          <button
                            onClick={() => setCompletingId(w.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}

                        {w.status === 'COMPLETED' && (
                          <div className="text-[11px] text-gray-500 font-mono">
                            Ref: {w.payoutReference || 'SETTLED'}
                          </div>
                        )}

                        {w.status === 'REJECTED' && (
                          <span className="text-[11px] text-red-400">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Payout Modal */}
        {completingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md rounded-3xl bg-[#0E1117] border border-white/10 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Record Completed Payout</h3>
              <p className="text-xs text-gray-400">
                Confirm wire settlement or blockchain transaction ID from payment provider.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStatus(completingId, 'COMPLETED', { payoutReference: payoutRef });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Bank / Custodian Wire Reference ID
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    placeholder="e.g. FED-WIRE-20261026-99214"
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setCompletingId(null)}
                    className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Confirm Settlement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Payout Modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md rounded-3xl bg-[#0E1117] border border-white/10 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Reject Withdrawal Request</h3>
              <p className="text-xs text-gray-400">
                A rejection will automatically refund the held funds back into the user&apos;s available cash balance and generate an audit log.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStatus(rejectingId, 'REJECTED', { rejectionReason: rejectReason });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mandatory Rejection Reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Bank account name mismatch or invalid routing number"
                    rows={3}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E82127]"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold"
                  >
                    Confirm Rejection & Refund
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
