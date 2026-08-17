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
  X,
  Wallet,
  LogOut,
  Plus,
  TrendingUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
}

export default function MobileNav({
  isOpen,
  onClose,
  onOpenAddModal,
}: MobileNavProps) {
  const pathname = usePathname() || '/';
  const { t } = useLanguage();
  const { loadSampleData, clearAllData } = useExpense();
  const { user, signOut } = useAuth();

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
    onClose();
  };

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const drawerNavItems = [
    { id: 'dashboard', href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'transactions', href: '/transactions', label: t('transactions'), icon: Receipt },
    { id: 'budgets', href: '/budgets', label: t('budgets'), icon: PieChart },
    { id: 'analytics', href: '/analytics', label: t('analytics'), icon: TrendingUp },
    { id: 'goals', href: '/savings-goals', label: t('savingsGoals'), icon: Target },
    { id: 'cards', href: '/accounts', label: t('accountsAndCards'), icon: CreditCard },
    { id: 'settings', href: '/settings', label: t('settings'), icon: Settings },
    { id: 'help', href: '/help', label: t('helpAndSupport'), icon: HelpCircle },
  ];

  const bottomNavItems = [
    { id: 'dashboard', href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'transactions', href: '/transactions', label: t('transactions'), icon: Receipt },
    { id: 'budgets', href: '/budgets', label: t('budgets'), icon: PieChart },
    { id: 'analytics', href: '/analytics', label: t('analytics'), icon: TrendingUp },
  ];

  return (
    <>
      {/* 1. Backdrop Overlay for Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 2. Slide-out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-white dark:bg-slate-900 z-50 lg:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base">{t('appName')}</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('appSubtitle')}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {drawerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                loadSampleData();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('loadDemo')}</span>
            </button>
            <button
              onClick={() => {
                clearAllData();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearAll')}</span>
            </button>
          </div>
        </div>

        {/* Drawer Profile Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Fixed Bottom Bar on Mobile Devices */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 z-30 flex items-center justify-around">
        {bottomNavItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Center Floating Plus Action */}
        <button
          onClick={onOpenAddModal}
          className="-mt-5 w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-indigo-950 active:scale-95 transition-transform cursor-pointer"
          aria-label={t('addTransaction')}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {bottomNavItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

