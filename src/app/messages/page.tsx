'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Send,
  Lock,
  MessageSquare,
  Shield,
  ArrowLeft,
  CheckCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const data = await meRes.json();
        if (data.authenticated) setUser(data.user);
      }

      const msgRes = await fetch('/api/messages');
      if (msgRes.ok) {
        const data = await msgRes.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Safe internal auto-scroll that NEVER causes the outer window or page to scroll down
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    const messageText = content.trim();
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        setContent('');
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 h-screen max-h-screen w-screen overflow-hidden flex bg-[#070c18] text-slate-100 font-sans select-text">
      {/* Sidebar for Navigation */}
      <Sidebar />

      {/* Main Chat Interface - Fixed full height viewport, no page scroll down */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0a101f]">
        {/* Chatroom Top Bar (Matching photo with Dashboard link and Gold-bordered Logout button) */}
        <header className="h-16 px-4 sm:px-6 bg-[#0c1424] border-b border-slate-800/80 flex items-center justify-between shrink-0 z-30 shadow-md">
          <div className="flex items-center space-x-3 min-w-0">
            <Link
              href="/dashboard"
              className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Official Support Desk Badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#E82127]/15 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c1424] animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate flex items-center space-x-2">
                <span>Tesla Operations Administrative Desk</span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                  Official
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Encrypted 1-on-1 Channel • Tier 2 Authorized</span>
              </div>
            </div>
          </div>

          {/* Right Header Navigation: Dashboard & Logout with gold border (as seen in photo) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 rounded-lg border border-amber-500/80 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-xs font-semibold hover:bg-amber-500/10 active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Chat Messages Feed - ONLY this internal container scrolls */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 bg-[#0a101f]"
        >
          {/* Security Notice Banner */}
          <div className="flex justify-center my-1">
            <div className="max-w-md bg-[#0e172a]/90 border border-slate-800 rounded-xl px-4 py-1.5 text-center shadow-sm">
              <p className="text-[11px] text-amber-400/90 flex items-center justify-center space-x-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Official End-to-End Encrypted Custodial Desk</span>
              </p>
            </div>
          </div>

          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-xs space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#E82127]" />
              <span>Connecting to Administrative Desk...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0e172a] border border-slate-800 text-[#E82127] flex items-center justify-center mx-auto shadow-lg">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="text-base font-bold text-white">
                Tesla Investor Communications Desk
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Send a message below to connect with executive administration regarding wire deposits, 72-hour withdrawal clearances, or portfolio allocations.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isAdmin = m.senderRole === 'ADMIN';
              const isMe = !isAdmin;

              return (
                <div
                  key={m.id}
                  className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Message Bubble:
                      - Admin message is the signature Red bubble with white text and timestamp in bottom right as shown in photo
                      - User message is a matching elegant dark slate card with timestamp in bottom right
                  */}
                  <div
                    className={`max-w-[90%] sm:max-w-xl lg:max-w-2xl px-5 py-4 rounded-2xl sm:rounded-3xl shadow-xl transition-all ${
                      isAdmin
                        ? 'bg-[#E82127] text-white'
                        : 'bg-[#151f33] border border-slate-700/80 text-slate-100'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between space-x-3 text-[11px] mb-1.5 opacity-90 font-medium">
                      <div className="flex items-center space-x-1.5">
                        {isAdmin ? (
                          <>
                            <Shield className="w-3.5 h-3.5 text-white" />
                            <span className="font-bold tracking-wide">
                              {m.senderName || 'Tesla Operations Desk'}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-slate-300">
                            {user?.fullName || 'You'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Body Content */}
                    <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {m.content}
                    </p>

                    {/* Timestamp in bottom-right corner inside the bubble (exactly as in the photo) */}
                    <div className="flex items-center justify-end space-x-1 text-[11px] font-mono mt-2 pt-1 opacity-80 text-right">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                      {isMe && (
                        m.isRead ? (
                          <span title="Read by administration">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        ) : (
                          <span title="Sent">
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Composer Bar (Bottom) - Fixed at bottom, with rectangular coral-red Send button */}
        <form
          onSubmit={handleSendMessage}
          className="h-20 px-4 sm:px-6 bg-[#0c1424] border-t border-slate-800/80 flex items-center space-x-3 shrink-0 z-30 shadow-2xl"
        >
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Message Tesla Operations Desk${user ? ` as ${user.fullName}` : ''}...`}
            className="flex-1 bg-[#151f33] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#E82127] transition-all"
          />

          {/* Rectangular / rounded-lg "Send" button as shown in user photo */}
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-6 py-3 rounded-xl bg-[#E82127] hover:bg-[#ff2e35] active:scale-95 text-white font-semibold text-sm shadow-lg shadow-[#E82127]/25 disabled:opacity-40 disabled:hover:bg-[#E82127] transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
