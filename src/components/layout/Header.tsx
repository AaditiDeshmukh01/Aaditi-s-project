'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  Calendar,
  X,
  Sun,
  Moon,
  Globe,
  Check,
  CheckCheck,
  LogOut,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Info,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, languages } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useExpense } from '@/context/ExpenseContext';
import { InAppNotification } from '@/types/expense';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onOpenAuth?: () => void;
}

function formatNotificationTime(timestamp?: string) {
  if (!timestamp) return 'Just now';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export default function Header({
  onOpenMobileMenu,
  onOpenAddModal,
  onOpenAuth,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const {
    notifications,
    unreadNotificationsCount,
    isLoadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationRecord,
  } = useExpense();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
  const displayEmail = user?.email || '';
  const userInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
    onOpenAuth?.();
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      setNotificationError(null);
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (n: InAppNotification) => {
    if (!n.read) {
      setActionLoadingId(n.id);
      setNotificationError(null);
      const { error } = await markNotificationAsRead(n.id);
      if (error) {
        setNotificationError(error.message || 'Failed to update notification.');
      }
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setNotificationError(null);
    const { error } = await markAllNotificationsAsRead();
    if (error) {
      setNotificationError(error.message || 'Failed to mark all notifications as read.');
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    setNotificationError(null);
    const { error } = await deleteNotificationRecord(id);
    if (error) {
      setNotificationError(error.message || 'Failed to delete notification.');
    }
    setActionLoadingId(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'budget_exceeded':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'savings_goal_achieved':
        return <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'savings_goal_reminder':
        return <Target className="w-4 h-4 text-indigo-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Mobile Menu + Page Header */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open Mobile Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {t('pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {t('overviewSubtitle')} <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span>
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Section: Actions, Language Switcher, Theme Switcher, Notifications, Add Button */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Date Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>August 2026</span>
          </div>

          {/* 1. Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.code.toUpperCase()}</span>
              <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('language')}
                </p>
                <div className="space-y-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        language === l.code
                          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* 3. Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-in zoom-in-50">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t('notifications')}
                    </h3>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {notificationError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs">
                    <span>{notificationError}</span>
                    <button
                      onClick={() => setNotificationError(null)}
                      className="font-bold underline cursor-pointer ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Notification List / States */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 sm:max-h-96 overflow-y-auto mt-2 -mx-1 px-1">
                  {isLoadingNotifications && notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <p className="text-xs font-medium text-slate-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center space-y-2 text-center text-slate-400 dark:text-slate-500">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Bell className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        You&apos;re all caught up!
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px]">
                        No new notifications.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isActionLoading = actionLoadingId === n.id;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`py-3 px-2.5 rounded-2xl transition-all flex items-start gap-3 cursor-pointer group my-1 ${
                            n.read
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
                              : 'bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 shadow-2xs'
                          }`}
                        >
                          {/* Icon */}
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/60 dark:border-slate-700/60 shrink-0 mt-0.5">
                            {getNotificationIcon(n.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {formatNotificationTime(n.created_at)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleDeleteNotification(e, n.id)}
                                  disabled={isActionLoading}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Delete notification"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('addTransaction')}</span>
            <span className="sm:hidden">{t('add')}</span>
          </button>

          {/* 5. User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={displayName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs ring-2 ring-indigo-50 dark:ring-indigo-950 cursor-pointer hover:ring-purple-400 transition-all"
            >
              {userInitials}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
