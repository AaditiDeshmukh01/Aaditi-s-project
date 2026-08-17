'use client';

import React from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { PieChart, Sparkles } from 'lucide-react';

export default function CategoryBreakdown() {
  const { categoryBreakdown, userProfile } = useExpense();
  const { t, getCategoryName } = useLanguage();
  const { currency } = userProfile;

  const totalSpent = categoryBreakdown.reduce((acc, curr) => acc + curr.amount, 0);
  const hasData = categoryBreakdown.length > 0 && totalSpent > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('spendingBreakdown')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('topCategories')}</p>
          </div>
          <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <PieChart className="w-4 h-4" />
          </span>
        </div>

        {!hasData ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('noCategories')}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
              {t('noCategoriesDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Multi-segment Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden gap-0.5 my-4">
              {categoryBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.color} h-full transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${getCategoryName(item.name)}: ${item.percentage}%`}
                />
              ))}
            </div>

            {/* Category List */}
            <div className="space-y-3 mt-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.hex }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {getCategoryName(cat.name)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {currency}{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Total */}
      <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('totalTracked')}</span>
        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
          {currency}{totalSpent.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
