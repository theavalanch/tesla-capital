'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Send,
  MessageSquare,
  Search,
  Shield,
  User,
  CheckCheck,
  Check,
  Clock,
  ArrowLeft,
  UserPlus,
  X,
  Mail,
  Sparkles,
  Phone,
  RefreshCw,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all registered platform users for direct selection
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

        // If no conv is selected on desktop and not in URL, default to the first one
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      // Find if conversation already exists
      const existingConv = conversations.find((c) => c.userId === targetUser.id);
      if (existingConv) {
        setSelectedConvId(existingConv.id);
        await fetchConversationMessages(existingConv.id);
      } else {
        // Open/create conversation by userId
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
          conversationId: selectedConvId || undefined,
          userId: activeUser?.id,
          content: textToSend,
        }),
      });

      if (res.ok) {
        setReply('');
        const data = await res.json();
        if (data.conversation) {
          setSelectedConvId(data.conversation.id);
        }
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
        fetchConversations();
        if (data.conversation?.id) {
          fetchConversationMessages(data.conversation.id);
        }
      }
    } catch (err) {
      console.error('Error sending administrative message:', err);
    } finally {
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.userName?.toLowerCase().includes(q) ||
      c.userEmail?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q)
    );
  });

  // Filter registered platform users not yet having active conversations or matching query
  const matchingRegisteredUsers = allUsers.filter((u) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    // Don't duplicate if already in active conversations list matching
    const inActiveConv = conversations.some((c) => c.userId === u.id);
    return matchesQuery && !inActiveConv;
  });

  // Filter picker users
  const pickerFilteredUsers = allUsers.filter((u) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const activeConv = conversations.find((c) => c.id === selectedConvId);
  const currentRecipient = activeUser || (activeConv ? {
    id: activeConv.userId,
    fullName: activeConv.userName,
    email: activeConv.userEmail,
  } : null);

  const totalUnreadAdmin = conversations.reduce(
    (sum, c) => sum + (c.unreadAdminCount || 0),
    0
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090C] text-[#F3F4F6] h-[100dvh] overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#08090C] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {mobileView === 'chat' && (
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 rounded-lg bg-white/5 text-gray-300 hover:text-white"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Support Desk & Direct Messaging
                </h1>
                {totalUnreadAdmin > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E82127] text-white text-[10px] font-bold shadow-md shadow-[#E82127]/40 animate-pulse">
                    {totalUnreadAdmin} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Choose any investor by name or email to exchange encrypted private communications.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPickerSearch('');
              setShowUserPicker(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs font-semibold shadow-md shadow-[#E82127]/25 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Choose User</span>
          </button>
        </div>

        {/* Master-Detail Split Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: Search & Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-white/5 bg-[#0A0C10] flex flex-col shrink-0 ${
              mobileView === 'chat' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Input Box */}
            <div className="p-3 border-b border-white/5 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-[#141822] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span>{filteredConversations.length} Active Conversations</span>
                <button
                  onClick={() => {
                    setPickerSearch('');
                    setShowUserPicker(true);
                  }}
                  className="text-[#E82127] hover:underline flex items-center space-x-1"
                >
                  <span>All Users ({allUsers.length})</span>
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {/* If search query entered and matches non-contacted registered users, show them */}
              {matchingRegisteredUsers.length > 0 && (
                <div className="bg-[#0E1117]/80 p-2 border-b border-white/5">
                  <div className="text-[10px] font-mono uppercase text-gray-400 px-2 py-1 flex items-center justify-between">
                    <span>Registered Users Matching Search</span>
                    <span className="text-emerald-400">Click to Message</span>
                  </div>
                  {matchingRegisteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-white group-hover:text-[#E82127] transition-colors truncate">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate font-mono">
                          {u.email}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] text-[10px] font-medium shrink-0">
                        + Message
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Conversations */}
              {filteredConversations.length === 0 && matchingRegisteredUsers.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-400">
                    {searchQuery
                      ? 'No conversations or users match this search.'
                      : 'No active conversations yet.'}
                  </div>
                  <button
                    onClick={() => {
                      setPickerSearch('');
                      setShowUserPicker(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#E82127]" />
                    <span>Select an Investor</span>
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedConvId === c.id;
                  const hasUnread = c.unreadAdminCount > 0;

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`w-full text-left p-3.5 transition-all flex items-start justify-between space-x-2.5 ${
                        isSelected
                          ? 'bg-[#141822] border-l-3 border-[#E82127]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold truncate ${
                            isSelected ? 'text-white font-bold' : hasUnread ? 'text-white' : 'text-gray-200'
                          }`}>
                            {c.userName}
                          </span>
                          {hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#E82127] animate-pulse shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">
                          {c.userEmail}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-1 flex items-center space-x-2">
                          <span>{c.subject || 'Tesla Support Desk'}</span>
                          <span>&bull;</span>
                          <span>
                            {new Date(c.lastMessageAt || c.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {hasUnread && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E82127] text-white text-[10px] font-bold shrink-0 shadow-md shadow-[#E82127]/40 animate-pulse">
                          {c.unreadAdminCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Conversation Thread & Message Box */}
          <div
            className={`flex-1 flex flex-col bg-[#08090C] overflow-hidden ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {currentRecipient ? (
              <>
                {/* Conversation Sub-header */}
                <div className="px-4 sm:px-6 py-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0E1117]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 -ml-1 rounded-lg bg-white/5 text-gray-300 hover:text-white shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1E2433] to-[#2E374D] border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                      {currentRecipient.fullName
                        ? currentRecipient.fullName
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'US'}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {currentRecipient.fullName}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono truncate">
                        {currentRecipient.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      Private Channel
                    </span>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {loadingConv ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-xs space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#E82127]" />
                      <span>Loading conversation history...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 px-4 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E82127]/10 text-[#E82127] flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        Start Conversation with {currentRecipient.fullName}
                      </h3>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        No previous messages in this private channel. Use the message box below to send an official administrative message directly to this investor.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isAdmin = m.senderRole === 'ADMIN';

                      return (
                        <div
                          key={m.id}
                          className={`flex items-start space-x-2.5 sm:space-x-3 ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isAdmin && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              {currentRecipient.fullName?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-md lg:max-w-lg p-3.5 sm:p-4 rounded-2xl text-xs space-y-1.5 shadow-md ${
                              isAdmin
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
                                {isAdmin && (
                                  m.isRead ? (
                                    <span title="Read by recipient"><CheckCheck className="w-3.5 h-3.5 text-white/90" /></span>
                                  ) : (
                                    <span title="Delivered"><Check className="w-3.5 h-3.5 text-white/70" /></span>
                                  )
                                )}
                              </div>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px] sm:text-xs">
                              {m.content}
                            </p>
                          </div>

                          {isAdmin && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E82127]/20 border border-[#E82127]/40 text-[#E82127] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Administrative Reply Snippets */}
                <div className="px-4 py-2 border-t border-white/5 bg-[#0A0C10] hidden sm:flex items-center space-x-2 overflow-x-auto text-[11px]">
                  <span className="text-gray-400 flex items-center space-x-1 shrink-0 font-mono text-[10px]">
                    <Sparkles className="w-3 h-3 text-[#E82127]" />
                    <span>Quick:</span>
                  </span>
                  <button
                    onClick={() => setReply('Your custodial deposit has been verified and settled to your cash balance.')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] whitespace-nowrap transition-colors"
                  >
                    Deposit Settled
                  </button>
                  <button
                    onClick={() => setReply('Your identity verification and KYC documents have been reviewed and approved.')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] whitespace-nowrap transition-colors"
                  >
                    KYC Approved
                  </button>
                  <button
                    onClick={() => setReply('Your withdrawal request has been authorized and queued for wire execution within the SLA window.')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] whitespace-nowrap transition-colors"
                  >
                    Withdrawal Authorized
                  </button>
                </div>

                {/* Message Box (Mobile Touch-Friendly) */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-white/5 bg-[#0E1117] flex items-center space-x-2 sm:space-x-3 shrink-0"
                >
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Type message to ${currentRecipient.fullName}...`}
                    className="flex-1 bg-[#141822] border border-white/10 rounded-xl px-4 py-3 text-[15px] sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="px-4 sm:px-5 py-3 rounded-xl bg-[#E82127] hover:bg-[#FF2E35] text-white text-xs sm:text-xs font-semibold shadow-md shadow-[#E82127]/25 disabled:opacity-40 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">No Conversation Selected</h3>
                  <p className="text-xs max-w-sm">
                    Select an active conversation on the left, or click "Choose User" to search any registered investor and open a private thread.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPickerSearch('');
                    setShowUserPicker(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E82127] text-white text-xs font-semibold hover:bg-[#FF2E35] transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Choose Any User</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHOOSE ANY USER MODAL */}
        {showUserPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#0E1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E82127]/15 text-[#E82127] flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Choose Investor to Message</h3>
                    <p className="text-[11px] text-gray-400">
                      Search any registered investor by name or email.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowUserPicker(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Search Box */}
              <div className="my-4 shrink-0 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search by investor name, email, or phone..."
                  className="w-full bg-[#141822] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E82127] transition-all"
                  autoFocus
                />
              </div>

              {/* User Directory List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
                {pickerFilteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">
                    No registered investors matching "{pickerSearch}".
                  </div>
                ) : (
                  pickerFilteredUsers.map((u) => {
                    const hasExistingConv = conversations.some((c) => c.userId === u.id);

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="pt-2 pb-2 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1E2433] to-[#2E374D] border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.fullName
                              ? u.fullName
                                  .split(' ')
                                  .map((p: string) => p[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()
                              : 'US'}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white group-hover:text-[#E82127] transition-colors truncate">
                              {u.fullName}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono truncate">
                              {u.email}
                            </div>
                            {u.phone && (
                              <div className="text-[10px] text-gray-500 truncate flex items-center space-x-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {hasExistingConv ? (
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-[10px] font-medium border border-white/10">
                              Active Chat &rarr;
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-[#E82127] text-white text-[10px] font-semibold shadow-sm shadow-[#E82127]/30">
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
      </main>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center text-xs">
          Loading Support Desk...
        </div>
      }
    >
      <AdminMessagesContent />
    </Suspense>
  );
}
