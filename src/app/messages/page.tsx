'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import { Send, Shield, User as UserIcon, Clock, CheckCheck, Check, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    }
  };

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'JE';

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6] h-[100dvh] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto overflow-hidden pb-20 md:pb-6">
          {/* Support Channel Header */}
          <div className="pb-3 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Tesla Investor Support
                </h1>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Executive Operations Desk Online</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-gray-400 hidden sm:block">
              End-to-End Encrypted Channel
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4 pr-1">
            {messages.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Direct Executive Support</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  No messages yet. Send an inquiry below to speak directly with the custodial and administrative desk regarding deposits, withdrawals, or account questions.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id || m.senderRole === 'USER';
                const isAdmin = m.senderRole === 'ADMIN';

                return (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-2.5 sm:space-x-3 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-md lg:max-w-lg p-3.5 sm:p-4 rounded-2xl text-xs space-y-1.5 shadow-md ${
                        isMe
                          ? 'bg-[#E82127] text-white rounded-tr-none'
                          : 'bg-[#141822] text-gray-200 border border-white/10 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between space-x-4 text-[10px] opacity-80">
                        <span className="font-semibold">{m.senderName}</span>
                        <div className="flex items-center space-x-1">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            m.isRead ? (
                              <span title="Read by administration"><CheckCheck className="w-3.5 h-3.5 text-white/90" /></span>
                            ) : (
                              <span title="Sent"><Check className="w-3.5 h-3.5 text-white/70" /></span>
                            )
                          )}
                        </div>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px] sm:text-xs">
                        {m.content}
                      </p>
                    </div>

                    {isMe && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {userInitials}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Box (Mobile Touch-Friendly) */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-3 rounded-2xl bg-[#0E1117] border border-white/10 flex items-center space-x-2 sm:space-x-3 shrink-0 shadow-lg"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message to administration..."
              className="flex-1 bg-transparent px-3 py-2.5 text-[15px] sm:text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold shadow-md shadow-[#E82127]/30 disabled:opacity-40 transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
