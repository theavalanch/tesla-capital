'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, country, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-[#F3F4F6] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows */}
      <div className="ambient-glow-red top-[10%] right-[15%] opacity-30" />
      <div className="ambient-glow-blue bottom-[10%] left-[10%] opacity-25" />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-lg rounded-3xl bg-[#0B0E14]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#E82127]/15 border border-[#E82127]/30 text-[#E82127] flex items-center justify-center font-bold text-base mx-auto mb-3 shadow-[0_0_20px_rgba(232,33,39,0.3)]">
              T
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Investor Account
            </h1>
            <p className="text-xs text-gray-400">
              Join the institutional platform for high-performance Tesla equity investing
            </p>
          </div>

          {/* Institutional Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-[#10141E] border border-white/5 text-center text-[10px] text-gray-300">
            <div className="flex flex-col items-center p-1 space-y-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Double-Entry</span>
            </div>
            <div className="flex flex-col items-center p-1 space-y-1 border-x border-white/5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E82127]" />
              <span className="font-semibold">NASDAQ Feed</span>
            </div>
            <div className="flex flex-col items-center p-1 space-y-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">72hr SLA</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Legal Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jason Evans"
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@example.com"
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Country of Residence
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Secure Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-400 leading-relaxed bg-[#10141E]/50 p-3 rounded-xl border border-white/5">
              By creating an account, you agree to our Terms of Custody and acknowledge that all transactions adhere to double-entry ledger verification and automated audit standards.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tesla-btn-red w-full py-3.5 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#E82127]/35 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Open Investment Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
            Already registered?{' '}
            <Link href="/login" className="text-[#E82127] font-semibold hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
