'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTimeout(() => {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#060709] text-[#F3F4F6] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows */}
      <div className="ambient-glow-red top-[15%] left-[25%] opacity-35" />
      <div className="ambient-glow-blue bottom-[10%] right-[20%] opacity-25" />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md rounded-3xl bg-[#0B0E14]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-8 sm:p-9 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#E82127]/15 border border-[#E82127]/30 text-[#E82127] flex items-center justify-center font-bold text-base mx-auto mb-3 shadow-[0_0_20px_rgba(232,33,39,0.3)]">
              T
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Investor Login</h1>
            <p className="text-xs text-gray-400">Access your Tesla portfolio and trading desk</p>
          </div>

          {/* Quick One-Click Demo Access Bar */}
          <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/5 space-y-2.5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-gray-400 text-center font-bold">
              Instant One-Click Investor Access
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleQuickLogin('investor@tesla-invest.com', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left text-xs transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Jason Evans (Investor Account)</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">$12,482 AUM • Verified Double-Entry Custody</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
              </button>
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] focus:ring-1 focus:ring-[#E82127]/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
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

            <button
              type="submit"
              disabled={loading}
              className="tesla-btn-red w-full py-3.5 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#E82127]/35"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
            Don&apos;t have an investment account yet?{' '}
            <Link href="/register" className="text-[#E82127] font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
