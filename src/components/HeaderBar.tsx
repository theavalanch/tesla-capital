'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Shield, LogOut, Check } from 'lucide-react';

interface HeaderBarProps {
  user: any;
  notifications?: any[];
  onNotificationRead?: (id?: string) => void;
}

export default function HeaderBar({
  user,
  notifications: initialNotifications = [],
  onNotificationRead,
}: HeaderBarProps) {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState<any[]>(initialNotifications);

  // Sync prop changes
  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifs(initialNotifications);
    }
  }, [initialNotifications]);

  // Poll for notifications automatically every 4 seconds
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setNotifs(data.notifications);
          }
        }
      } catch (err) {
        // silent fail for polling
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 4000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onNotificationRead?.();
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: n.id }),
        });
        setNotifs((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    if (n.link) {
      setShowNotifs(false);
      router.push(n.link);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-white/5 flex items-center justify-between bg-[#08090C]/80 backdrop-blur-md sticky top-0 z-40">
      {/* Brand icon on mobile */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="md:hidden flex items-center">
          <svg viewBox="0 0 342 35" className="h-3.5 w-auto fill-white">
            <path d="M0 .1a9.7 9.7 0 0 0 7 7h11v27h7v-27h11a9.7 9.7 0 0 0 7-7H0zm64 0l-7 34h7l2-11h14l2 11h7l-7-34H64zm7 17l4-11 4 11H71zm57-17l-1 5a10 10 0 0 0-8-1 10 10 0 0 0-9 10 10 10 0 0 0 9 10 10 10 0 0 0 8-1l1 5a15 15 0 0 1-9 2 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 10 2zm34 0v34h7V6h15V.1h-22zm44 0v34h25v-6h-18V.1h-7zm52 0l-7 34h7l2-11h14l2 11h7l-7-34h-18zm7 17l4-11 4 11h-8z" />
          </svg>
        </Link>

        {/* Search Input (responsive) */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks, news, or symbols..."
            className="w-full bg-[#0E1117] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#E82127]/50 focus:ring-1 focus:ring-[#E82127]/30 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E82127] ring-2 ring-[#08090C] animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-72 sm:w-88 rounded-2xl bg-[#0E1117] border border-white/10 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#E82127] text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#E82127] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-transparent border-transparent text-gray-400 hover:bg-white/[0.02]'
                          : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white flex items-center space-x-1.5">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" />
                          )}
                          <span>{n.title}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(n.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E2433] to-[#2E374D] border border-white/10 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {user?.fullName
                ? user.fullName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'JE'}
            </div>
            <div className="hidden sm:block text-left pr-2">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.fullName || 'Jason Evans'}
              </div>
              <div className="text-[10px] text-gray-400 leading-tight">
                {user?.role === 'ADMIN' ? 'Platform Admin' : 'Investor'}
              </div>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0E1117] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-white/5">
                <div className="text-xs font-semibold text-white">{user?.fullName || 'Jason Evans'}</div>
                <div className="text-[10px] text-gray-400">{user?.email || 'investor@tesla-invest.com'}</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Profile & Settings</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setShowProfile(false)}
                  className="w-full text-left px-3 py-2 text-xs text-[#E82127] hover:bg-white/5 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
