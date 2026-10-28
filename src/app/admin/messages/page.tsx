'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Send,
  Search,
  CheckCheck,
  Check,
  ArrowLeft,
  UserPlus,
  X,
  Smile,
  Paperclip,
  MoreVertical,
  Lock,
  MessageSquare,
  Sparkles,
  Phone,
  RefreshCw,
} from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🚀', '📈', '✅', '🙏', '🔥', '👏', '💯', '🤝', '💼', '⚡', '💎'];

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

  // WhatsApp UI toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Search & User Picker
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Mobile navigation: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    setShowEmojiPicker(false);
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
    setShowEmojiPicker(false);

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
          conversationId: selectedConvId || undefined,
          userId: activeUser?.id,
          content: textToSend,
        }),
      });

      if (res.ok) {
        setReply('');
        setShowEmojiPicker(false);
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
      inputRef.current?.focus();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setReply((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterUnreadOnly && (c.unreadAdminCount || 0) === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.userName?.toLowerCase().includes(q) ||
      c.userEmail?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q)
    );
  });

  // Filter registered platform users matching query
  const matchingRegisteredUsers = allUsers.filter((u) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#111b21] text-[#e9edef] h-[100dvh] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex h-full min-w-0 overflow-hidden relative">
        {/* LEFT PANEL: WhatsApp Chats List */}
        <div
          className={`w-full md:w-[380px] lg:w-[420px] border-r border-[#222d34] bg-[#111b21] flex flex-col shrink-0 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* WhatsApp List Header */}
          <div className="h-15 px-4 bg-[#202c33] border-b border-[#222d34] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center font-bold text-sm">
                TS
              </div>
              <div>
                <h1 className="text-base font-bold text-[#e9edef] leading-tight">Chats</h1>
                <div className="text-[11px] text-[#8696a0]">Support Desk • WhatsApp Style</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setPickerSearch('');
                  setShowUserPicker(true);
                }}
                className="p-2 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors"
                title="New chat with any user"
              >
                <UserPlus className="w-5 h-5 text-[#00a884]" />
              </button>
            </div>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="p-2.5 bg-[#111b21] border-b border-[#222d34] space-y-2">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-[#8696a0] flex items-center pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full bg-[#202c33] text-[#d1d7db] placeholder-[#8696a0] text-xs rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#8696a0] hover:text-[#e9edef]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs: All, Unread */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setFilterUnreadOnly(false)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !filterUnreadOnly
                    ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 font-semibold'
                    : 'bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnreadOnly(true)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                  filterUnreadOnly
                    ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 font-semibold'
                    : 'bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db]'
                }`}
              >
                <span>Unread</span>
                {totalUnreadAdmin > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#25d366] text-[#111b21] text-[10px] font-bold flex items-center justify-center">
                    {totalUnreadAdmin}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setPickerSearch('');
                  setShowUserPicker(true);
                }}
                className="ml-auto text-xs text-[#00a884] hover:underline"
              >
                + Choose User
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]">
            {/* Registered users not yet in active conversation matching search */}
            {matchingRegisteredUsers.length > 0 && (
              <div className="bg-[#182229] p-2 border-b border-[#222d34]">
                <div className="text-[10px] uppercase font-bold text-[#8696a0] px-2 py-1 flex items-center justify-between">
                  <span>Registered Platform Investors</span>
                  <span className="text-[#00a884]">Tap to Chat</span>
                </div>
                {matchingRegisteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="p-2.5 rounded-xl hover:bg-[#202c33] transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] font-bold text-xs flex items-center justify-center shrink-0">
                        {u.fullName?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#e9edef] group-hover:text-[#00a884] transition-colors truncate">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-[#8696a0] font-mono truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#00a884] text-[#111b21] text-[10px] font-bold shrink-0">
                      Chat
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredConversations.length === 0 && matchingRegisteredUsers.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="text-xs text-[#8696a0]">
                  {filterUnreadOnly
                    ? 'No unread conversations.'
                    : searchQuery
                    ? 'No chats or users matching your search.'
                    : 'No chats yet.'}
                </div>
                <button
                  onClick={() => {
                    setPickerSearch('');
                    setShowUserPicker(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] text-xs font-medium transition-colors border border-[#222d34]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Start New Chat</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConvId === c.id;
                const hasUnread = (c.unreadAdminCount || 0) > 0;

                const initials = c.userName
                  ? c.userName
                      .split(' ')
                      .map((p: string) => p[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'US';

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    className={`px-3.5 py-3 transition-colors flex items-center space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#2a3942]'
                        : 'hover:bg-[#202c33]'
                    }`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#202c33] to-[#2a3942] border border-white/10 text-[#e9edef] flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#111b21]" />
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm truncate ${hasUnread ? 'font-bold text-[#e9edef]' : 'font-medium text-[#e9edef]'}`}>
                          {c.userName}
                        </span>
                        <span className={`text-[11px] font-mono shrink-0 ml-2 ${hasUnread ? 'text-[#25d366] font-bold' : 'text-[#8696a0]'}`}>
                          {new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1 min-w-0 text-xs text-[#8696a0] truncate">
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                          <span className="truncate">{c.subject || 'Tesla Private Support'}</span>
                        </div>

                        {hasUnread && (
                          <span className="ml-2 w-5 h-5 rounded-full bg-[#25d366] text-[#111b21] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {c.unreadAdminCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: WhatsApp Active Chatroom */}
        <div
          className={`flex-1 flex flex-col bg-[#0b141a] overflow-hidden ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {currentRecipient ? (
            <>
              {/* WhatsApp Chat Header */}
              <div className="h-15 px-4 bg-[#202c33] border-b border-[#222d34] flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 -ml-1 rounded-full text-[#aebac1] hover:text-white hover:bg-white/10"
                    aria-label="Back to chat list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#111b21] to-[#2a3942] border border-white/10 text-[#e9edef] flex items-center justify-center font-bold text-xs">
                      {currentRecipient.fullName
                        ? currentRecipient.fullName
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'US'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25d366] border border-[#202c33]" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#e9edef] truncate">
                      {currentRecipient.fullName}
                    </div>
                    <div className="text-[11px] text-[#25d366] font-medium flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
                      <span>online</span>
                      <span className="text-[#8696a0]">&bull;</span>
                      <span className="text-[#8696a0] font-mono">{currentRecipient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Icons (Strictly text-focused: NO call or voice buttons) */}
                <div className="flex items-center space-x-1 text-[#aebac1]">
                  <button
                    onClick={() => {
                      setPickerSearch('');
                      setShowUserPicker(true);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                    title="Switch user"
                  >
                    <UserPlus className="w-4 h-4 text-[#00a884]" />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                    title="Search within chat"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                    title="Menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* WhatsApp Messages Stream with Wallpaper Texture */}
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

                {loadingConv ? (
                  <div className="flex items-center justify-center py-12 text-[#8696a0] text-xs space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#00a884]" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#202c33] text-[#00a884] flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-[#e9edef]">
                      Direct Private Chat with {currentRecipient.fullName}
                    </div>
                    <p className="text-[11px] text-[#8696a0] max-w-sm mx-auto">
                      No message history yet. Type a message below to begin an authentic private chat.
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
                        <div
                          className={`max-w-[85%] sm:max-w-md lg:max-w-lg px-3 py-2 rounded-lg text-sm shadow-sm transition-all ${
                            isAdmin
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none whatsapp-bubble-tail-out'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none whatsapp-bubble-tail-in'
                          }`}
                        >
                          {!isAdmin && (
                            <div className="text-[11px] font-bold text-[#00a884] mb-0.5">
                              {m.senderName}
                            </div>
                          )}

                          <div className="leading-relaxed whitespace-pre-wrap break-words pr-2">
                            {m.content}
                          </div>

                          {/* Time and Blue Checkmarks (WhatsApp style) */}
                          <div className="flex items-center justify-end space-x-1 text-[10px] text-[#ffffff99] mt-1 float-right pl-4">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isAdmin && (
                              m.isRead ? (
                                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" /></span>
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
                <div className="bg-[#202c33] border-t border-[#222d34] px-4 py-2 flex items-center space-x-2 overflow-x-auto shrink-0 animate-in fade-in slide-in-from-bottom-2">
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

                {/* Predefined Snippets Attachment Icon */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setReply('Your transaction has been approved and settled to your cash balance.')}
                    className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors"
                    title="Insert Settlement Template"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>

                {/* Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-[#2a3942] border border-transparent rounded-lg px-4 py-2.5 text-[15px] sm:text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
                />

                {/* Round Circular Send Button (WhatsApp Emerald Green) */}
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#06cf9c] active:scale-95 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:hover:bg-[#00a884] transition-all shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 text-[#8696a0] whatsapp-chat-bg">
              <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center text-[#00a884] shadow-md">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#e9edef]">WhatsApp Support Desk</h3>
                <p className="text-xs max-w-sm text-[#8696a0]">
                  Select a chat on the left to review messages, or click "Choose User" to start a direct private conversation with any registered investor.
                </p>
              </div>
              <button
                onClick={() => {
                  setPickerSearch('');
                  setShowUserPicker(true);
                }}
                className="px-4 py-2 rounded-full bg-[#00a884] text-[#111b21] font-bold text-xs hover:bg-[#06cf9c] transition-all flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Choose Any User</span>
              </button>
            </div>
          )}
        </div>

        {/* CHOOSE ANY USER MODAL */}
        {showUserPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#202c33] border border-[#222d34] rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#222d34] shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#e9edef]">New Chat</h3>
                    <p className="text-[11px] text-[#8696a0]">
                      Search any registered investor by name or email
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowUserPicker(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#8696a0] hover:text-[#e9edef]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Search Box */}
              <div className="my-3 shrink-0 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full bg-[#111b21] border border-transparent rounded-lg pl-10 pr-4 py-2 text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  autoFocus
                />
              </div>

              {/* User Directory List */}
              <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-[#222d34] pr-1">
                {pickerFilteredUsers.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#8696a0]">
                    No contacts matching "{pickerSearch}".
                  </div>
                ) : (
                  pickerFilteredUsers.map((u) => {
                    const hasExistingConv = conversations.some((c) => c.userId === u.id);

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="p-3 rounded-xl hover:bg-[#111b21] transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#111b21] to-[#2a3942] border border-white/10 text-[#e9edef] flex items-center justify-center font-bold text-xs shrink-0">
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
                            <div className="text-xs font-semibold text-[#e9edef] group-hover:text-[#00a884] transition-colors truncate">
                              {u.fullName}
                            </div>
                            <div className="text-[11px] text-[#8696a0] font-mono truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {hasExistingConv ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#111b21] text-[#8696a0] text-[10px] font-medium border border-[#222d34]">
                              Open Chat &rarr;
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#00a884] text-[#111b21] text-[10px] font-bold">
                              + Message
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
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] flex items-center justify-center text-xs">
          Loading WhatsApp Support Desk...
        </div>
      }
    >
      <AdminMessagesContent />
    </Suspense>
  );
}
