/**
 * AdminTopBar Component — Top bar untuk admin panel
 * 
 * Menampilkan judul halaman, search bar, notification bell, dan profil admin.
 * Bell notification sekarang berfungsi dengan data real-time dari API.
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, User, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTopBar({ title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationAPI.getAll();
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unread_count || 0);
      } catch {
        // Silently fail — notifications are non-critical
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-cream-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page title */}
        <h1 className="text-xl font-semibold text-charcoal-800">{title}</h1>

        {/* Right side: search + notification + profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-cream-300 bg-cream-50 text-sm
                         text-charcoal-700 placeholder-charcoal-300
                         focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent
                         transition-colors"
            />
          </div>

          {/* Notification bell — NOW FUNCTIONAL */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 rounded-lg text-charcoal-500 hover:bg-cream-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-terracotta-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-cream-200 shadow-lg overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
                    <h3 className="text-sm font-semibold text-charcoal-800">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-cream-400 mx-auto mb-2" />
                        <p className="text-sm text-charcoal-400">Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                          className={`px-4 py-3 border-b border-cream-100 cursor-pointer transition-colors
                            ${notif.is_read ? 'bg-white' : 'bg-terracotta-50/30'} hover:bg-cream-50`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-cream-300' : 'bg-terracotta-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal-700 truncate">{notif.title}</p>
                              {notif.message && <p className="text-xs text-charcoal-400 mt-0.5 line-clamp-2">{notif.message}</p>}
                              <p className="text-xs text-charcoal-300 mt-1">{formatTime(notif.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-cream-300" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
              <User className="w-4 h-4 text-terracotta-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-charcoal-700 leading-none">{user?.name}</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
