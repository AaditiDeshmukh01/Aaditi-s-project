'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import StatCards from '@/components/dashboard/StatCards';
import CashflowChart from '@/components/dashboard/CashflowChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import { Sparkles } from 'lucide-react';

interface DashboardContentProps {
  onOpenAddModal?: () => void;
}

export default function DashboardContent({ onOpenAddModal }: DashboardContentProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { savingsRate, transactions } = useExpense();

  const hasData = transactions.length > 0;
  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Motivation Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10 dark:shadow-black/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-800/40 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {hasData ? t('bannerTagActive') : t('bannerTag')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {hasData ? t('welcomeBack') : t('welcomeUser')}, {displayName.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {hasData
              ? t('bannerTextActive', { SAVINGS: savingsRate })
              : t('bannerTextZero')}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/transactions"
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {t('transactions')}
          </Link>
          <Link
            href="/budgets"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer"
          >
            {t('viewBudgets')}
          </Link>
        </div>
      </div>

      {/* Metric Overview Stat Cards */}
      <section aria-label="Key Financial Metrics">
        <StatCards />
      </section>

      {/* Analytics & Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdown />
        </div>
      </section>

      {/* Transactions & Budgets Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <RecentTransactions onOpenAddModal={onOpenAddModal} />
        </div>
        <div className="lg:col-span-1">
          <BudgetProgress />
        </div>
      </section>
    </div>
  );
}
