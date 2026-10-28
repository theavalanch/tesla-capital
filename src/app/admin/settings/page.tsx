'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Sliders, Save, CheckCircle2, AlertCircle, Shield, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    minDeposit: 100,
    minWithdrawal: 50,
    wireFee: 15,
    achFee: 0,
    cryptoFeePercent: 0.5,
    marketProvider: 'FINNHUB_STREAMING',
    finnhubApiKey: '',
    simulationMode: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minDeposit: parseFloat(settings.minDeposit),
          minWithdrawal: parseFloat(settings.minWithdrawal),
          wireFee: parseFloat(settings.wireFee),
          achFee: parseFloat(settings.achFee),
          cryptoFeePercent: parseFloat(settings.cryptoFeePercent),
          finnhubApiKey: settings.finnhubApiKey,
          simulationMode: settings.simulationMode,
          maintenanceMode: settings.maintenanceMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-4xl w-full mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Settings & Controls</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure transaction limits, transparent fee schedules, market provider API keys, and operational modes.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully and recorded in audit log.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Transaction Fees & Limits Card */}
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#E82127]" />
              <span>Disclosed Fee & Liquidity Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Minimum Deposit Amount ($)
                </label>
                <input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => setSettings({ ...settings, minDeposit: e.target.value })}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Minimum Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => setSettings({ ...settings, minWithdrawal: e.target.value })}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Bank Wire Processing Fee ($)
                </label>
                <input
                  type="number"
                  value={settings.wireFee}
                  onChange={(e) => setSettings({ ...settings, wireFee: e.target.value })}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  ACH Payout Fee ($)
                </label>
                <input
                  type="number"
                  value={settings.achFee}
                  onChange={(e) => setSettings({ ...settings, achFee: e.target.value })}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Market Data Provider Card */}
          <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>TSLA Market Data Provider</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Finnhub API Key (Optional for Live External Provider)
                </label>
                <input
                  type="text"
                  value={settings.finnhubApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, finnhubApiKey: e.target.value })}
                  placeholder="Enter Finnhub API Key (or leave blank to use NASDAQ Real-Time Simulation Engine)"
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-xs"
                />
                <div className="text-[11px] text-gray-500 mt-1">
                  If left empty, the platform automatically utilizes its high-fidelity NASDAQ real-time tick engine with clear disclosures.
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="simulationMode"
                  checked={settings.simulationMode}
                  onChange={(e) => setSettings({ ...settings, simulationMode: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E82127] bg-[#141822] border-white/10 focus:ring-0"
                />
                <label htmlFor="simulationMode" className="text-xs text-gray-300 cursor-pointer">
                  Operate in Clearly Labeled Simulation Mode (Compliant Sandbox Execution)
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-xs shadow-lg shadow-[#E82127]/30 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
