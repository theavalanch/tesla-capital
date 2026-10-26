'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E82127]">
            Direct Communications
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Contact & Support Desk</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Reach out to our institutional operations team, investor relations, or compliance desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details (5 cols) */}
          <div className="md:col-span-5 rounded-3xl bg-[#0E1117] border border-white/5 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Operational Desk</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-[#E82127] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400">Investor Relations</div>
                    <div className="font-semibold text-white">investor-relations@tesla-invest.com</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-[#E82127] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400">Institutional Hotline</div>
                    <div className="font-semibold text-white">+1 (800) 613-8840</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#E82127] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400">Operations Hub</div>
                    <div className="font-semibold text-white">1 Tesla Road, Austin, TX 78725</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141822] border border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Internal Messaging System</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Registered investors receive priority response times via the dashboard private chat channel.
              </p>
              <Link
                href="/messages"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#E82127] hover:underline pt-1"
              >
                <span>Go to Support Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="md:col-span-7 rounded-3xl bg-[#0E1117] border border-white/5 p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Inquiry Dispatched</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Thank you for reaching out. A compliance officer has been assigned to your ticket and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Jason Evans"
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Institutional Allocation or Wire Inquiry"
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Message Content</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details regarding your inquiry..."
                    rows={4}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E82127]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#E82127] hover:bg-[#FF2E35] text-white font-semibold text-xs shadow-lg shadow-[#E82127]/30 transition-all"
                >
                  Submit Inquiry to Compliance
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
