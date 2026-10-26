'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import {
  ArrowUpCircle,
  Building,
  CreditCard,
  QrCode,
  ShieldAlert,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function WithdrawalPage() {
  const [user, setUser] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [availableCash, setAvailableCash] = useState(0);
  const [amount, setAmount] = useState('800');
  const [method, setMethod] = useState<'WIRE' | 'ACH' | 'CRYPTO_USDT'>('WIRE');
  const [bankName, setBankName] = useState('JPMorgan Chase Bank');
  const [accountNumber, setAccountNumber] = useState('****4821');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successWithdrawal, setSuccessWithdrawal] = useState<any | null>(null);

  const fetchWithdrawalData = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setAvailableCash(data.account?.availableCash || 0);
        }
      });

    fetch('/api/withdrawals')
      .then((res) => res.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
        if (data.availableCash !== undefined) setAvailableCash(data.availableCash);
      });
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const wireFee = method === 'WIRE' ? 15.0 : 0.0;
  const netPayout = Math.max(0, Math.round((numAmount - wireFee) * 100) / 100);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const destinationMasked =
      method === 'CRYPTO_USDT'
        ? `USDT: ${cryptoAddress.substring(0, 6)}...${cryptoAddress.substring(cryptoAddress.length - 4)}`
        : `${bankName} (${accountNumber})`;

    const destinationDetails =
      method === 'CRYPTO_USDT'
        ? `USDT TRC-20 Address: ${cryptoAddress}`
        : `${bankName}, Routing: ${routingNumber}, Account: ${accountNumber}`;

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          method,
          destinationMasked,
          destinationDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit withdrawal request');

      setSuccessWithdrawal(data.withdrawal);
      fetchWithdrawalData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdraw Capital</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Initiate a payout from your settled available cash balance.
              </p>
            </div>

            {/* 72-Hour Processing Target SLA Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <Clock className="w-4 h-4 text-[#E82127]" />
              <div>
                <div className="font-semibold text-white">72-Hour Processing Target</div>
                <div className="text-[10px] text-gray-400">Standard compliance review window</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Withdrawal Form (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0E1117] border border-white/5 p-6 sm:p-8">
              {successWithdrawal ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Withdrawal Request Queued</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Your request <span className="text-white font-mono font-bold">{successWithdrawal.reference}</span> has been logged under standard compliance protocols with a 72-hour review target.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between text-gray-400">
                      <span>Requested:</span>
                      <span className="font-mono text-white font-semibold">${successWithdrawal.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Disclosed Fee:</span>
                      <span className="font-mono text-gray-300">${successWithdrawal.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-t border-white/5 pt-2">
                      <span>Net Payout:</span>
                      <span className="font-mono font-bold text-emerald-400">${successWithdrawal.netPayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Destination:</span>
                      <span className="text-white">{successWithdrawal.destinationMasked}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSuccessWithdrawal(null)}
                    className="px-6 py-2.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Available Balance Reminder */}
                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-gray-400">Available Cash for Withdrawal</div>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        ${availableCash.toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmount(availableCash.toString())}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-gray-300 transition-colors"
                    >
                      Withdraw Max
                    </button>
                  </div>

                  {/* Method Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Payout Destination Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'WIRE', label: 'Domestic Wire', fee: '$15 Fee', icon: Building },
                        { id: 'ACH', label: 'ACH Direct', fee: 'Free ($0)', icon: CreditCard },
                        { id: 'CRYPTO_USDT', label: 'USDT (Tether)', fee: 'Free ($0)', icon: QrCode },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMethod(m.id as any)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#E82127]/10 border-[#E82127] text-white shadow-[0_0_15px_rgba(232,33,39,0.15)]'
                                : 'bg-[#141822] border-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#E82127]' : 'text-gray-400'}`} />
                            <div className="text-xs font-bold leading-tight">{m.label}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{m.fee}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Destination Details Inputs */}
                  {method === 'CRYPTO_USDT' ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Recipient USDT (TRC-20 / ERC-20) Wallet Address
                      </label>
                      <input
                        type="text"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="e.g. 0x... or T..."
                        className="w-full bg-[#141822] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-[#E82127] transition-colors"
                        required
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#E82127]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#E82127]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Withdrawal Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                      <input
                        type="number"
                        min="50"
                        max={availableCash}
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#141822] border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-white font-mono text-base focus:outline-none focus:border-[#E82127] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Transparent Fee Summary Box */}
                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Requested Gross Amount:</span>
                      <span className="font-mono text-white">${numAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Disclosed Processing Fee:</span>
                      <span className="font-mono text-gray-300">${wireFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-200 border-t border-white/5 pt-2">
                      <span className="font-semibold">Expected Net Settlement:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ${netPayout.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || numAmount <= 0 || numAmount > availableCash || netPayout <= 0}
                    className="w-full py-3.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-sm shadow-[0_0_20px_rgba(232,33,39,0.35)] disabled:opacity-50 transition-all"
                  >
                    {loading
                      ? 'Validating & Processing...'
                      : `Submit Withdrawal for $${netPayout.toFixed(2)}`}
                  </button>
                </form>
              )}
            </div>

            {/* Past Withdrawals & SLA Disclosure (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl bg-[#0E1117] border border-white/5 p-6">
                <h3 className="text-base font-bold text-white mb-4">Withdrawal History</h3>

                <div className="space-y-3">
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No withdrawal records found.
                    </div>
                  ) : (
                    withdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{w.reference}</span>
                          <span className="font-mono font-bold text-white">
                            ${w.amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{w.destinationMasked}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              w.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : w.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {w.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 pt-1 border-t border-white/5 flex justify-between">
                          <span>SLA Target: 72 Hours</span>
                          <span>{new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Compliance & Anti-Fraud Disclosure */}
              <div className="p-5 rounded-3xl bg-[#0E1117] border border-white/5 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Fair Fee & Transparency Commitment</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  All applicable fees are disclosed upfront and deducted from the payout. We never require separate external payments or surprise tax unlock charges after a withdrawal is submitted.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
