'use client';

import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function StatCards() {
  const {
    totalBalance,
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    transactions,
    userProfile,
  } = useExpense();
  const { t } = useLanguage();
  const { currency } = userProfile;

  const currentMonthName = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  const formattedBalance = `${totalBalance < 0 ? '-' : ''}${currency}${Math.abs(totalBalance).toLocaleString('en-IN')}`;

  const stats = [
    {
      title: t('totalBalance'),
      amount: formattedBalance,
      change: totalBalance >= 0 ? 'Surplus' : 'Deficit',
      isPositive: totalBalance >= 0,
      subtext: `${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'}`,
      icon: Wallet,
      gradient: totalBalance >= 0 ? 'from-indigo-600 to-indigo-700' : 'from-rose-600 to-rose-700',
      iconColor: totalBalance >= 0 ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    },
    {
      title: t('monthlyIncome'),
      amount: `${currency}${monthlyIncome.toLocaleString('en-IN')}`,
      change: `All-time: ${currency}${totalIncome.toLocaleString('en-IN')}`,
      isPositive: true,
      subtext: currentMonthName,
      icon: ArrowUpRight,
      gradient: 'from-emerald-600 to-emerald-700',
      iconColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('monthlyExpenses'),
      amount: `${currency}${monthlyExpenses.toLocaleString('en-IN')}`,
      change: `All-time: ${currency}${totalExpenses.toLocaleString('en-IN')}`,
      isPositive: false,
      subtext: currentMonthName,
      icon: ArrowDownRight,
      gradient: 'from-rose-600 to-rose-700',
      iconColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    },
    {
      title: t('savingsRate'),
      amount: `${savingsRate}%`,
      change: savingsRate >= 50 ? 'On Target' : 'Tracked',
      isPositive: savingsRate >= 20,
      subtext: `${t('target')}: 50%`,
      icon: PiggyBank,
      gradient: 'from-amber-600 to-amber-700',
      iconColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.iconColor}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stat.amount}
              </h3>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    stat.isPositive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800'
                  }`}
                >
                  {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                  {stat.subtext}
                </span>
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </div>
        );
      })}
    </div>
  );
}

