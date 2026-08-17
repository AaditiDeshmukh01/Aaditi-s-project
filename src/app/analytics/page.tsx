'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import IncomeVsExpensesChart from '@/components/analytics/IncomeVsExpensesChart';
import SpendingByCategory from '@/components/analytics/SpendingByCategory';

export default function AnalyticsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('analytics')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Overview of your monthly income, expenses, and category spending distribution
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Step 1: Income vs Expenses Section */}
      <IncomeVsExpensesChart />

      {/* Analytics Step 2: Spending by Category Section */}
      <SpendingByCategory />
    </div>
  );
}
