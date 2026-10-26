'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import { Send, Shield, User as UserIcon, Clock, CheckCheck, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages || []);
      })
      .catch((err) => console.error('Error fetching messages:', err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <Sidebar unreadMessages={0} isAdmin={user?.role === 'ADMIN'} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 flex flex-col p-6 sm:p-8 max-w-5xl w-full mx-auto overflow-hidden">
          {/* Header */}
          <div className="pb-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tesla Investor Support</h1>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Executive Operations Desk Online</span>
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-400">
              End-to-End Encrypted Channel
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs">
                No messages yet. Send an inquiry below to speak directly with the administration desk.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                const isAdmin = m.senderRole === 'ADMIN';

                return (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs space-y-1.5 shadow-md ${
                        isMe
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

                    {isMe && (
                      <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        EE
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 rounded-2xl bg-[#0E1117] border border-white/10 flex items-center space-x-3"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message to administration..."
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="p-2.5 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-white shadow-md shadow-[#E82127]/30 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
