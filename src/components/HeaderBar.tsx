'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Check, X, Shield, LogOut } from 'lucide-react';

interface HeaderBarProps {
  user: any;
  notifications?: any[];
  onNotificationRead?: (id?: string) => void;
}

export default function HeaderBar({ user, notifications = [], onNotificationRead }: HeaderBarProps) {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="h-18 px-8 border-b border-white/5 flex items-center justify-between bg-[#08090C]/80 backdrop-blur-md sticky top-0 z-40">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks, news, or symbols..."
          className="w-full bg-[#0E1117] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#E82127]/50 focus:ring-1 focus:ring-[#E82127]/30 transition-all"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-5">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E82127] ring-2 ring-[#08090C]" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0E1117] border border-white/10 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => onNotificationRead?.()}
                    className="text-xs text-[#E82127] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        n.isRead
                          ? 'bg-transparent border-transparent text-gray-400'
                          : 'bg-white/5 border-white/10 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{n.message}</p>
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
            className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-white/5 transition-colors"
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
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Profile & Settings</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
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
