'use client';

import React, { useState } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart2 } from 'lucide-react';

export default function CashflowChart() {
  const [activeRange, setActiveRange] = useState('6M');
  const { cashflow, userProfile } = useExpense();
  const { t } = useLanguage();
  const { currency } = userProfile;

  const maxAmount = Math.max(
    50000,
    ...cashflow.map((c) => Math.max(c.income, c.expense))
  );

  const hasData = cashflow.length > 0 && cashflow.some((item) => item.income > 0 || item.expense > 0);
  const latestMonth = cashflow.length > 0 ? cashflow[cashflow.length - 1] : null;
  const netSurplus = latestMonth ? latestMonth.income - latestMonth.expense : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('cashflowAnalytics')}
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {t('monthly')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('cashflowDesc')}
          </p>
        </div>

        {/* Range Selector & Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
              <span>{t('income')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
              <span>{t('expenses')}</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            {['3M', '6M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeRange === range
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Chart Bars or Empty State */}
      {!hasData ? (
        <div className="py-16 text-center flex flex-col items-center justify-center space-y-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('noCashflow')}</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
            {t('noCashflowDesc')}
          </p>
        </div>
      ) : (
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-6 items-end h-52 sm:h-60 border-b border-slate-100 dark:border-slate-800 pb-3">
            {cashflow.map((item, idx) => {
              const incomeHeight = maxAmount > 0 ? Math.round((item.income / maxAmount) * 100) : 0;
              const expenseHeight = maxAmount > 0 ? Math.round((item.expense / maxAmount) * 100) : 0;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 max-w-[22px] bg-indigo-600 dark:bg-indigo-500 rounded-t-md transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-semibold py-1 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                        {currency}{(item.income / 1000).toFixed(1)}k
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[22px] bg-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-110 relative"
                      style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-semibold py-1 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                        {currency}{(item.expense / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 group-hover:text-slate-900 dark:group-hover:text-white">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('netSurplus')}:</span>
          <span className={`font-bold ${netSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netSurplus >= 0 ? '+' : ''}{currency}{netSurplus.toLocaleString('en-IN')}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Updated live from localStorage
        </span>
      </div>
    </div>
  );
}
