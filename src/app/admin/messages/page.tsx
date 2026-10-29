'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Send,
  Search,
  CheckCheck,
  Check,
  ArrowLeft,
  UserPlus,
  X,
  Lock,
  MessageSquare,
  Shield,
  Phone,
  RefreshCw,
  Users,
  DollarSign,
  FileText,
} from 'lucide-react';

function AdminMessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialUserId = searchParams.get('userId');
  const initialConvId = searchParams.get('convId') || searchParams.get('conversationId');

  // State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId || null);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);

  // Search & User Picker
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Mobile navigation: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all registered platform users for directory
  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch platform users:', err);
    }
  };

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations || [];
        setConversations(convs);

        if (!selectedConvId && !initialUserId && convs.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedConvId(convs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  // Fetch messages for a specific conversation or user
  const fetchConversationMessages = async (convId?: string, userId?: string) => {
    if (!convId && !userId) return;
    try {
      const url = convId
        ? `/api/messages?conversationId=${encodeURIComponent(convId)}`
        : `/api/messages?userId=${encodeURIComponent(userId!)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setSelectedConvId(data.conversation.id);
          setActiveUser({
            id: data.conversation.userId,
            fullName: data.conversation.userName,
            email: data.conversation.userEmail,
          });

          // Optimistically clear unread count in conversations state
          setConversations((prev) =>
            prev.map((c) =>
              c.id === data.conversation.id ? { ...c, unreadAdminCount: 0 } : c
            )
          );
        }
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchAllUsers();

    if (initialUserId) {
      setLoadingConv(true);
      fetchConversationMessages(undefined, initialUserId).then(() => {
        setLoadingConv(false);
        setMobileView('chat');
      });
    } else if (initialConvId) {
      setSelectedConvId(initialConvId);
      setMobileView('chat');
    }
  }, [initialUserId, initialConvId]);

  // Periodic polling for conversations list every 4 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  // Periodic polling for current conversation messages every 3 seconds
  useEffect(() => {
    if (selectedConvId) {
      fetchConversationMessages(selectedConvId);
      const interval = setInterval(() => {
        fetchConversationMessages(selectedConvId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId]);

  // Internal scroll that NEVER scrolls the outer window or page
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

  // Select a conversation from list
  const handleSelectConversation = (conv: any) => {
    setSelectedConvId(conv.id);
    setActiveUser({
      id: conv.userId,
      fullName: conv.userName,
      email: conv.userEmail,
    });
    setMobileView('chat');
    // Clear unread immediately on click
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadAdminCount: 0 } : c))
    );
    fetchConversationMessages(conv.id);
  };

  // Choose ANY user by name or email
  const handleSelectUser = async (targetUser: any) => {
    setShowUserPicker(false);
    setSearchQuery('');
    setLoadingConv(true);
    setActiveUser(targetUser);
    setMobileView('chat');

    try {
      const existingConv = conversations.find((c) => c.userId === targetUser.id);
      if (existingConv) {
        setSelectedConvId(existingConv.id);
        await fetchConversationMessages(existingConv.id);
      } else {
        await fetchConversationMessages(undefined, targetUser.id);
        fetchConversations();
      }
    } finally {
      setLoadingConv(false);
    }
  };

  // Send message directly to user
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reply.trim() || sending) return;

    if (!selectedConvId && !activeUser) return;

    setSending(true);
    const textToSend = reply.trim();

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSend,
          conversationId: selectedConvId,
          userId: activeUser?.id,
        }),
      });

      if (res.ok) {
        setReply('');
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
        if (data.conversation && !selectedConvId) {
          setSelectedConvId(data.conversation.id);
        }
        if (selectedConvId) {
          fetchConversationMessages(selectedConvId);
        } else if (activeUser) {
          fetchConversationMessages(undefined, activeUser.id);
        }
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending administrative message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Quick insertion templates
  const handleInsertTemplate = (templateText: string) => {
    setReply(templateText);
    inputRef.current?.focus();
  };

  // Resolve active conversation object
  const currentConv = conversations.find((c) => c.id === selectedConvId);
  const currentRecipient = activeUser || (currentConv ? {
    id: currentConv.userId,
    fullName: currentConv.userName,
    email: currentConv.userEmail,
  } : null);

  // Filter conversations for left list
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.userName && c.userName.toLowerCase().includes(q)) ||
      (c.userEmail && c.userEmail.toLowerCase().includes(q))
    );
  });

  // Filter all users for picker modal
  const pickerFilteredUsers = allUsers.filter((u) => {
    if (u.role === 'ADMIN') return false;
    const q = pickerSearch.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 h-screen max-h-screen w-screen overflow-hidden flex bg-[#070c18] text-slate-100 font-sans select-text">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Container - Full height, no outer page scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0a101f]">
        {/* Top Header Bar (Matching photo with Dashboard link and Gold-bordered Logout button) */}
        <header className="h-16 px-4 sm:px-6 bg-[#0c1424] border-b border-slate-800/80 flex items-center justify-between shrink-0 z-30 shadow-md">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#E82127]/15 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c1424] animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate flex items-center space-x-2">
                <span>Tesla Institutional Operations Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] font-mono">
                  Admin Console
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  {currentRecipient
                    ? `Chatting with ${currentRecipient.fullName} (${currentRecipient.email})`
                    : 'Select any investor from the directory to start 1-on-1 chat'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Navigation: Dashboard & Logout with gold border (as in photo) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <Link
              href="/admin"
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

        {/* 2-Column Chat Workspace */}
        <div className="flex-1 flex min-w-0 h-full overflow-hidden">
          {/* LEFT COLUMN: Registered Investors & Active Conversations */}
          <div
            className={`w-full md:w-80 lg:w-96 bg-[#0c1424] border-r border-slate-800/80 flex flex-col shrink-0 ${
              mobileView === 'chat' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Bar & Choose Any User Button */}
            <div className="p-3.5 border-b border-slate-800/80 space-y-2.5 shrink-0 bg-[#0c1424]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
                  <Users className="w-4 h-4 text-[#E82127]" />
                  <span>Investor Directory</span>
                </div>
                <button
                  onClick={() => {
                    setPickerSearch('');
                    setShowUserPicker(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#E82127]/15 hover:bg-[#E82127]/25 text-[#E82127] border border-[#E82127]/30 text-[11px] font-bold flex items-center space-x-1 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Choose User</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search active chats..."
                  className="w-full bg-[#151f33] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#E82127] transition-all"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <p className="text-xs text-slate-400 font-mono">No active conversations found.</p>
                  <button
                    onClick={() => {
                      setPickerSearch('');
                      setShowUserPicker(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E82127] hover:bg-[#ff2e35] text-white text-xs font-semibold shadow-md transition-all inline-flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Chat with Any Investor</span>
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedConvId === c.id;
                  const initials = c.userName
                    ? c.userName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U';

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between m-1 ${
                        isSelected
                          ? 'bg-[#151f33] border border-[#E82127]/50 shadow-md'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E2433] to-[#2E374D] border border-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                            <span>{c.userName}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {c.userEmail}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {c.subject || 'Direct Channel'}
                          </div>
                        </div>
                      </div>

                      {c.unreadAdminCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E82127] text-white text-[10px] font-bold shrink-0 animate-pulse">
                          {c.unreadAdminCount} new
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Chat Messages & Composer */}
          <div
            className={`flex-1 flex flex-col h-full overflow-hidden bg-[#0a101f] ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {currentRecipient ? (
              <>
                {/* Active Chat Header */}
                <div className="h-14 px-4 bg-[#0c1424] border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {(currentRecipient.fullName || 'U').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                        <span>{currentRecipient.fullName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                          Verified Investor
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {currentRecipient.email}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Badges */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertTemplate(
                          `Hello ${currentRecipient.fullName}, We have received your request to withdraw funds. However, before we are able to approve and process this withdrawal, a one-time upgrade fee of $320 is required due to the new system maintenance for everyone involved. This is a one-time payment. Once this payment has been completed, your withdrawal will be processed successfully without further delay. To arrange the necessary payment, you can use: Bitcoin Paysafe Dogecoin`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-[10px] font-bold font-mono transition"
                    >
                      + Upgrade Fee Notice
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertTemplate(
                          `OFFICIAL WIRE DEPOSIT INSTRUCTIONS:\nBeneficiary: Tesla Capital Custody LLC\nBank: JPMorgan Chase Bank, N.A. (New York, NY)\nRouting (Fedwire): 021000021\nAccount: ****7892\nReference Code: REF-TSLA-${Date.now().toString().slice(-5)}\n\nPlease reply with your wire tracking number upon transmission.`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-mono transition"
                    >
                      + Wire Coordinates
                    </button>
                  </div>
                </div>

                {/* Messages Stream - ONLY this internal container scrolls */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 bg-[#0a101f]"
                >
                  {loadingConv ? (
                    <div className="flex items-center justify-center py-20 text-slate-500 text-xs space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#E82127]" />
                      <span>Loading conversation history...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 px-4 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#0e172a] border border-slate-800 text-[#E82127] flex items-center justify-center mx-auto shadow-lg">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-bold text-white">
                        Direct 1-on-1 Channel with {currentRecipient.fullName}
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        No previous message history found. Type your administrative message below to initiate direct institutional communication.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isAdmin = m.senderRole === 'ADMIN';

                      return (
                        <div
                          key={m.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
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
                            {/* Header Info */}
                            <div className="flex items-center justify-between space-x-3 text-[11px] mb-1.5 opacity-90 font-medium">
                              <div className="flex items-center space-x-1.5">
                                {isAdmin ? (
                                  <>
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                    <span className="font-bold tracking-wide">
                                      Tesla Operations Desk (Admin)
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-slate-300">
                                    {m.senderName || currentRecipient.fullName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Message Body Content */}
                            <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
                              {m.content}
                            </p>

                            {/* Timestamp in bottom-right corner inside the bubble (as in photo) */}
                            <div className="flex items-center justify-end space-x-1 text-[11px] font-mono mt-2 pt-1 opacity-80 text-right">
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                              {isAdmin && (
                                m.isRead ? (
                                  <span title="Read by user">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  </span>
                                ) : (
                                  <span title="Delivered">
                                    <Check className="w-3.5 h-3.5 text-white/70" />
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

                {/* Composer Bar (Bottom) - Fixed at bottom, with rectangular coral-red Send button */}
                <form
                  onSubmit={handleSendMessage}
                  className="h-20 px-4 sm:px-6 bg-[#0c1424] border-t border-slate-800/80 flex items-center space-x-3 shrink-0 z-30 shadow-2xl"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply directly to ${currentRecipient.fullName}...`}
                    className="flex-1 bg-[#151f33] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#E82127] transition-all"
                  />

                  {/* Rectangular / rounded-lg "Send" button as shown in user photo */}
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="px-6 py-3 rounded-xl bg-[#E82127] hover:bg-[#ff2e35] active:scale-95 text-white font-semibold text-sm shadow-lg shadow-[#E82127]/25 disabled:opacity-40 disabled:hover:bg-[#E82127] transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-[#0e172a] border border-slate-800 flex items-center justify-center text-[#E82127] shadow-lg">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Select Any Registered Investor</h3>
                  <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
                    Choose an investor from the directory or search by name to send official wire coordinates, fee notices, or account updates.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPickerSearch('');
                    setShowUserPicker(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#E82127] hover:bg-[#ff2e35] text-white text-xs font-bold shadow-lg shadow-[#E82127]/30 transition-all flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Choose Any Investor to Message</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHOOSE ANY USER MODAL */}
        {showUserPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#0c1424] border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E82127]/20 text-[#E82127] flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Choose Investor to Message</h3>
                    <p className="text-[11px] text-slate-400">
                      Search any registered investor by name or email
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowUserPicker(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Search Box */}
              <div className="my-3 shrink-0 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search by investor name, email, or phone..."
                  className="w-full bg-[#151f33] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#E82127] transition-all"
                  autoFocus
                />
              </div>

              {/* User Directory List */}
              <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-slate-800/80 pr-1">
                {pickerFilteredUsers.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No investors matching &ldquo;{pickerSearch}&rdquo;.
                  </div>
                ) : (
                  pickerFilteredUsers.map((u) => {
                    const hasExistingConv = conversations.some((c) => c.userId === u.id);

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="p-3 rounded-xl hover:bg-[#151f33] transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E2433] to-[#2E374D] border border-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            {u.fullName
                              ? u.fullName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()
                              : 'U'}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white group-hover:text-[#E82127] transition-colors truncate">
                              {u.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              {u.email}
                            </div>
                            {u.phone && (
                              <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {hasExistingConv ? (
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-[10px] font-medium border border-slate-700">
                              Open Chat &rarr;
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-[#E82127] text-white text-[10px] font-bold shadow-sm shadow-[#E82127]/30">
                              + Start Chat
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070c18] text-white flex items-center justify-center text-xs">
          Loading Operations Support Desk...
        </div>
      }
    >
      <AdminMessagesContent />
    </Suspense>
  );
}
