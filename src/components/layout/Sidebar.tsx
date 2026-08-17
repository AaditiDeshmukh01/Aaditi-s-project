'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onOpenAddModal?: () => void;
  onOpenAuth?: () => void;
}

export default function Sidebar({
  onOpenAddModal,
  onOpenAuth,
}: SidebarProps) {
  const pathname = usePathname() || '/';
  const { t } = useLanguage();
  const { transactions, loadSampleData, clearAllData } = useExpense();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest User');
  const displayEmail = user?.email || 'authenticated@supabase.co';
  const userInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await signOut();
    onOpenAuth?.();
  };

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const mainNavItems = [
    { id: 'dashboard', href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { id: 'transactions', href: '/transactions', label: t('transactions'), icon: Receipt, badge: transactions.length > 0 ? String(transactions.length) : null },
    { id: 'budgets', href: '/budgets', label: t('budgets'), icon: PieChart, badge: null },
    { id: 'analytics', href: '/analytics', label: t('analytics'), icon: TrendingUp, badge: 'New' },
    { id: 'goals', href: '/savings-goals', label: t('savingsGoals'), icon: Target, badge: null },
    { id: 'cards', href: '/accounts', label: t('accountsAndCards'), icon: CreditCard, badge: null },
  ];

  const secondaryNavItems = [
    { id: 'settings', href: '/settings', label: t('settings'), icon: Settings },
    { id: 'help', href: '/help', label: t('helpAndSupport'), icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 min-h-screen sticky top-0 left-0 z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight tracking-tight flex items-center gap-1.5">
              {t('appName')}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                {t('proBadge')}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('appSubtitle')}</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {t('mainMenu')}
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : item.badge === 'New'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {t('preferences')}
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Data Persistence Tools & Demo Loader */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 border border-indigo-100/70 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('aiInsights')}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('aiInsightsDesc')}
          </p>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={loadSampleData}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] border border-indigo-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Populate realistic dummy data"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('loadDemo')}</span>
            </button>
            <button
              onClick={clearAllData}
              className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-[11px] border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Reset data"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t('clearAll')}</span>
            </button>
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>+ {t('quickEntry')}</span>
            </button>
          )}
        </div>
      </div>

      {/* User Profile Area with Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div
          onClick={onOpenAuth}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out from Supabase"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

