'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'BUY' | 'SELL';
  currentPrice: number;
  availableCash: number;
  ownedShares: number;
  onTradeSuccess: () => void;
}

export default function TradeModal({
  isOpen,
  onClose,
  defaultType = 'BUY',
  currentPrice,
  availableCash,
  ownedShares,
  onTradeSuccess,
}: TradeModalProps) {
  const [type, setType] = useState<'BUY' | 'SELL'>(defaultType);
  const [shares, setShares] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const numShares = parseFloat(shares) || 0;
  const estimatedTotal = Math.round(numShares * currentPrice * 100) / 100;
  const remainingCash = type === 'BUY' ? availableCash - estimatedTotal : availableCash + estimatedTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'TSLA',
          type,
          shares: numShares,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute order');
      }

      setReceipt(data.ledgerEntry);
      onTradeSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0E1117] border border-white/10 shadow-2xl p-6 sm:p-8">
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          <div className="text-center py-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Order Filled Successfully</h3>
            <p className="text-xs text-gray-400 mb-6 font-mono">
              Reference: {receipt.reference}
            </p>

            <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 text-left space-y-2 mb-6 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Action</span>
                <span className="font-semibold text-white">
                  {type === 'BUY' ? 'Bought TSLA' : 'Sold TSLA'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shares</span>
                <span className="font-semibold text-white">{numShares} shares</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Execution Price</span>
                <span className="font-semibold text-white">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-white/5 pt-2">
                <span>Total Amount</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-full bg-[#E82127] text-white font-semibold text-sm hover:bg-[#FF2E35] transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold text-xs">
                T
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Trade TSLA</h3>
                <div className="text-xs text-gray-400 font-mono">
                  Market Price: ${currentPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#141822] border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => setType('BUY')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'BUY'
                    ? 'bg-[#E82127] text-white shadow-lg shadow-[#E82127]/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy TSLA
              </button>
              <button
                type="button"
                onClick={() => setType('SELL')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'SELL'
                    ? 'bg-white/15 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell TSLA
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Number of Shares
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#E82127] transition-colors"
                    placeholder="1.0"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400">
                    TSLA
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex space-x-2">
                {[1, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setShares(amt.toString())}
                    className="flex-1 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-mono transition-colors"
                  >
                    {amt}
                  </button>
                ))}
                {type === 'SELL' && ownedShares > 0 && (
                  <button
                    type="button"
                    onClick={() => setShares(ownedShares.toString())}
                    className="px-2 py-1 text-xs rounded-lg bg-[#E82127]/20 text-[#E82127] font-mono hover:bg-[#E82127]/30 transition-colors"
                  >
                    Max
                  </button>
                )}
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Available Balance</span>
                  <span className="font-mono text-white">${availableCash.toFixed(2)}</span>
                </div>
                {type === 'SELL' && (
                  <div className="flex justify-between text-gray-400">
                    <span>Holdings Available</span>
                    <span className="font-mono text-white">{ownedShares} shares</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Commission / Brokerage Fee</span>
                  <span className="text-emerald-400 font-semibold">$0.00 Free</span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-white/5 pt-2">
                  <span>Total Order Value</span>
                  <span className="font-bold text-white font-mono text-sm">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Remaining Cash</span>
                  <span
                    className={`font-mono font-semibold ${
                      remainingCash < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}
                  >
                    ${remainingCash.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || numShares <= 0 || (type === 'BUY' && remainingCash < 0)}
                className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                  type === 'BUY'
                    ? 'bg-[#E82127] hover:bg-[#FF2E35] text-white shadow-lg shadow-[#E82127]/30 disabled:opacity-50'
                    : 'bg-white/20 hover:bg-white/30 text-white disabled:opacity-50'
                }`}
              >
                <span>
                  {loading
                    ? 'Executing Order...'
                    : type === 'BUY'
                    ? `Buy ${numShares || 0} TSLA Shares`
                    : `Sell ${numShares || 0} TSLA Shares`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
