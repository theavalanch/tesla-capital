'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Send, MessageSquare, Search, Shield, User, CheckCheck, Clock } from 'lucide-react';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (!selectedConvId && convs.length > 0) {
          setSelectedConvId(convs[0].id);
        }
      });
  };

  const fetchConversationMessages = (convId: string) => {
    fetch(`/api/messages?conversationId=${convId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      });
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchConversationMessages(selectedConvId);
      const interval = setInterval(() => fetchConversationMessages(selectedConvId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConvId || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          content: reply.trim(),
        }),
      });

      if (res.ok) {
        setReply('');
        fetchConversationMessages(selectedConvId);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <div className="px-8 py-5 border-b border-white/5 bg-[#08090C] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">Institutional Support Desk</h1>
            <p className="text-xs text-gray-400">Two-way encrypted communications with investors.</p>
          </div>
          <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Support Desk Active</span>
          </div>
        </div>

        {/* Content split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List (Sidebar) */}
          <div className="w-80 border-r border-white/5 bg-[#0A0C10] flex flex-col shrink-0">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter conversations..."
                  className="w-full bg-[#141822] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  No investor conversations.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start justify-between space-x-2 ${
                      selectedConvId === c.id ? 'bg-[#141822] border-l-2 border-[#E82127]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-xs truncate">{c.userName}</div>
                      <div className="text-[11px] text-gray-400 truncate">{c.userEmail}</div>
                      <div className="text-[10px] text-gray-500 mt-1 truncate">{c.subject}</div>
                    </div>
                    {c.unreadAdminCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#E82127] text-white text-[9px] font-bold shrink-0">
                        {c.unreadAdminCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Conversation Thread */}
          <div className="flex-1 flex flex-col bg-[#08090C] overflow-hidden">
            {activeConv ? (
              <>
                <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0E1117]">
                  <div>
                    <div className="text-xs font-bold text-white">{activeConv.userName}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{activeConv.userEmail}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                    Open Ticket
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((m) => {
                    const isAdmin = m.senderRole === 'ADMIN';
                    return (
                      <div
                        key={m.id}
                        className={`flex items-start space-x-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {activeConv.userName.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div
                          className={`max-w-lg p-4 rounded-2xl text-xs space-y-1 shadow-md ${
                            isAdmin
                              ? 'bg-[#E82127] text-white rounded-tr-none'
                              : 'bg-[#141822] text-gray-200 border border-white/10 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between space-x-4 text-[10px] opacity-75">
                            <span className="font-semibold">{m.senderName}</span>
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>

                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-4 border-t border-white/5 bg-[#0E1117] flex items-center space-x-3 shrink-0"
                >
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type official administrative reply to investor..."
                    className="flex-1 bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold shadow-md shadow-[#E82127]/25 disabled:opacity-40 transition-all flex items-center space-x-2"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
                Select a conversation on the left to review messages.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
