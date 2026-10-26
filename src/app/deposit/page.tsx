'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import {
  ArrowDownCircle,
  Copy,
  Check,
  Building,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function DepositPage() {
  const [user, setUser] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState<'WIRE' | 'ACH' | 'CRYPTO_USDT' | 'CRYPTO_BTC'>('WIRE');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successDeposit, setSuccessDeposit] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    fetch('/api/deposits')
      .then((res) => res.json())
      .then((data) => setDeposits(data.deposits || []));
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method,
          paymentDetails: {
            methodName: method,
            initiatedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit deposit');

      setSuccessDeposit(data.deposit);
      fetchDeposits();
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Deposit Funds</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Add capital to your cash balance to purchase Tesla, Inc. shares.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Deposit Request Form (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0E1117] border border-white/5 p-6 sm:p-8">
              {successDeposit ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Deposit Request Created</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Your deposit reference is <span className="text-white font-mono font-bold">{successDeposit.reference}</span>.
                    Please include this reference in your transfer memo for rapid automated reconciliation.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between text-gray-400">
                      <span>Amount:</span>
                      <span className="font-bold text-white font-mono">${successDeposit.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Status:</span>
                      <span className="font-semibold text-amber-400">Pending Review</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Funding Method:</span>
                      <span className="text-white">{successDeposit.method}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSuccessDeposit(null)}
                    className="px-6 py-2.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold transition-colors"
                  >
                    Submit Another Deposit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDepositSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Method Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Select Funding Method
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'WIRE', label: 'Bank Wire', icon: Building, time: 'Same Day' },
                        { id: 'ACH', label: 'ACH Direct', icon: CreditCard, time: '1-2 Days' },
                        { id: 'CRYPTO_USDT', label: 'USDT (Tether)', icon: QrCode, time: 'Instant' },
                        { id: 'CRYPTO_BTC', label: 'Bitcoin (BTC)', icon: QrCode, time: '10 Mins' },
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
                            <div className="text-[10px] text-gray-500 mt-0.5">{m.time}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Deposit Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                      <input
                        type="number"
                        min="100"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#141822] border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-white font-mono text-base focus:outline-none focus:border-[#E82127] transition-colors"
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {['500', '1000', '5000', '10000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-mono transition-colors"
                        >
                          +${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wire / Payment Details Display */}
                  <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center space-x-2 text-gray-300 font-semibold border-b border-white/5 pb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Beneficiary Bank & Escrow Instructions</span>
                    </div>

                    {method === 'WIRE' || method === 'ACH' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Bank Name:</span>
                          <span className="text-white font-mono font-medium">JPMorgan Chase N.A.</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Beneficiary:</span>
                          <span className="text-white font-medium">Tesla Investment Custody LLC</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Routing / ABA:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('021000021', 'routing')}
                            className="text-white font-mono font-medium hover:text-[#E82127] flex items-center space-x-1"
                          >
                            <span>021000021</span>
                            {copiedField === 'routing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Account Number:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('98421098231', 'account')}
                            className="text-white font-mono font-medium hover:text-[#E82127] flex items-center space-x-1"
                          >
                            <span>98421098231</span>
                            {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-gray-400">Deposit Address (USDT TRC-20 / ERC-20):</div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-emerald-400 break-all flex items-center justify-between">
                          <span>0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 'crypto')}
                            className="p-1 hover:text-white"
                          >
                            {copiedField === 'crypto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="w-full py-3.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-sm shadow-[0_0_20px_rgba(232,33,39,0.35)] disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Submitting Request...' : `Confirm Deposit Request for $${amount || '0'}`}
                  </button>
                </form>
              )}
            </div>

            {/* Deposit History & FAQ (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl bg-[#0E1117] border border-white/5 p-6">
                <h3 className="text-base font-bold text-white mb-4">Deposit History</h3>

                <div className="space-y-3">
                  {deposits.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No deposit records found.
                    </div>
                  ) : (
                    deposits.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{d.reference}</div>
                          <div className="text-[10px] text-gray-400">
                            {d.method} • {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-white">${d.amount.toFixed(2)}</div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-0.5 ${
                              d.status === 'APPROVED' || d.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : d.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {d.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Advisory */}
              <div className="p-5 rounded-3xl bg-[#0E1117] border border-white/5 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#E82127]" />
                  <span>Institutional Segregation of Funds</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  All client deposits are held in bankruptcy-remote FDIC-insured custodial bank partner accounts. Funds are never co-mingled with corporate operating expenditures.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
