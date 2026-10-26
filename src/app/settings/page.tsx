'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import { User, ShieldCheck, Mail, Phone, Globe, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Settings</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Manage your personal identity, contact details, and security credentials.
            </p>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Identity & KYC Status */}
            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#E82127]" />
                  <span>Identity & Verification Status</span>
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>KYC Verified Tier 2</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.fullName || 'Jason Evans'}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 font-medium cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'investor@tesla-invest.com'}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 font-medium cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    defaultValue={user?.phone || '+1 (555) 234-8901'}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Country of Residence</label>
                  <input
                    type="text"
                    defaultValue={user?.country || 'United States'}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Security & Password */}
            <div className="p-6 rounded-3xl bg-[#0E1117] border border-white/5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#E82127]" />
                <span>Security & Password Protection</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-xs transition-colors"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
