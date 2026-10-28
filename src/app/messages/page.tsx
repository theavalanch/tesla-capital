'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import {
  Send,
  CheckCheck,
  Check,
  Lock,
  Smile,
  Paperclip,
  MoreVertical,
  Search,
  MessageSquare,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🚀', '📈', '✅', '🙏', '🔥', '👏', '💯', '🤝', '💼', '⚡', '💎'];

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        setShowEmojiPicker(false);
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

  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen bg-[#111b21] text-[#e9edef] h-[100dvh] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <HeaderBar user={user || { fullName: 'Jason Evans', role: 'USER' }} />

        <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto overflow-hidden pb-16 md:pb-0 bg-[#0b141a] border-x border-[#222d34]/60">
          {/* WhatsApp Chat Header */}
          <div className="h-15 px-4 bg-[#202c33] border-b border-[#222d34] flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                href="/dashboard"
                className="md:hidden p-1.5 -ml-1 rounded-full text-[#aebac1] hover:text-white hover:bg-white/10"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              {/* Tesla Support Avatar with Online Status */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center font-bold text-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25d366] border border-[#202c33]" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#e9edef] truncate flex items-center space-x-1.5">
                  <span>Tesla Executive Support Desk</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00a884]/20 text-[#00a884] font-mono">
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-[#25d366] font-medium flex items-center space-x-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
                  <span>online • official institutional support</span>
                </div>
              </div>
            </div>

            {/* Header Right Actions (Strictly text-focused: NO call or voice buttons) */}
            <div className="flex items-center space-x-1 text-[#aebac1]">
              <button
                className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                title="Search in chat"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Stream with Wallpaper Texture */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 whatsapp-chat-bg">
            {/* End-to-end encryption notice pill */}
            <div className="flex justify-center my-2">
              <div className="max-w-md bg-[#182229]/90 border border-white/5 rounded-lg px-3.5 py-1.5 text-center shadow-sm">
                <p className="text-[11px] text-[#ffd279] flex items-center justify-center space-x-1.5 font-medium">
                  <Lock className="w-3 h-3 text-[#ffd279] shrink-0" />
                  <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
                </p>
              </div>
            </div>

            {/* Date separator pill */}
            <div className="flex justify-center my-3">
              <span className="px-3 py-1 rounded-lg bg-[#182229] border border-white/5 text-[#8696a0] text-[10px] font-bold tracking-wider uppercase shadow-sm">
                TODAY
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#202c33] text-[#00a884] flex items-center justify-center mx-auto shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#e9edef]">
                  Welcome to Tesla Investor Support
                </div>
                <p className="text-xs text-[#8696a0] max-w-md mx-auto">
                  Send a text message below to contact executive administration directly regarding your deposits, withdrawals, or portfolio allocation.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id || m.senderRole === 'USER';
                const isAdmin = m.senderRole === 'ADMIN';

                return (
                  <div
                    key={m.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md lg:max-w-lg px-3.5 py-2.5 rounded-lg text-sm shadow-sm transition-all ${
                        isMe
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none whatsapp-bubble-tail-out'
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none whatsapp-bubble-tail-in'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-[11px] font-bold text-[#00a884] mb-0.5 flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>{m.senderName || 'Tesla Operations Admin'}</span>
                        </div>
                      )}

                      <div className="leading-relaxed whitespace-pre-wrap break-words pr-2">
                        {m.content}
                      </div>

                      {/* Time and Blue Double Checkmarks */}
                      <div className="flex items-center justify-end space-x-1 text-[10px] text-[#ffffff99] mt-1 float-right pl-4">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          m.isRead ? (
                            <span title="Read by administration"><CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" /></span>
                          ) : (
                            <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-[#ffffff99]" /></span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emojis Drawer */}
          {showEmojiPicker && (
            <div className="bg-[#202c33] border-t border-[#222d34] px-4 py-2 flex items-center space-x-2 overflow-x-auto shrink-0 animate-in fade-in slide-in-from-bottom-2 z-20">
              <span className="text-xs text-[#8696a0] font-mono mr-1">React:</span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddEmoji(emoji)}
                  className="text-lg p-1 rounded-lg hover:bg-white/10 active:scale-125 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp Message Input Bar (Bottom) */}
          <form
            onSubmit={handleSendMessage}
            className="px-3 sm:px-4 py-2.5 bg-[#202c33] border-t border-[#222d34] flex items-center space-x-2 shrink-0 z-20"
          >
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-full transition-colors ${
                showEmojiPicker ? 'text-[#00a884] bg-white/10' : 'text-[#8696a0] hover:text-[#e9edef]'
              }`}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Attachment Button for Quick Query */}
            <button
              type="button"
              onClick={() => setContent('Hello Support, could you please provide a status update on my account settlement?')}
              className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors"
              title="Settlement inquiry template"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-[#2a3942] border border-transparent rounded-lg px-4 py-2.5 text-[15px] sm:text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
            />

            {/* Circular Send Button (WhatsApp Emerald Green) */}
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#06cf9c] active:scale-95 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:hover:bg-[#00a884] transition-all shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
