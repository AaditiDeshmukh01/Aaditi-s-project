'use client';

import React, { useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Calendar,
} from 'lucide-react';

export default function IncomeVsExpensesChart() {
  const { user } = useAuth();
  const {
    transactions,
    isLoadingTransactions,
    userProfile,
  } = useExpense();

  const currency = userProfile?.currency || '₹';

  // Current month formatting (e.g., "August 2026")
  const currentMonthDate = useMemo(() => new Date(), []);
  const currentMonthPrefix = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentMonthDate]);

  const currentMonthName = useMemo(() => {
    return currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // Authenticated user transactions strictly isolated and filtered to "This Month"
  const currentMonthTransactions = useMemo(() => {
    if (!user || !user.id || !Array.isArray(transactions)) return [];
    return transactions.filter((tx) => {
      const isUserMatch = !tx.user_id || tx.user_id === user.id;
      const isMonthMatch = tx.date && tx.date.startsWith(currentMonthPrefix);
      return isUserMatch && isMonthMatch;
    });
  }, [transactions, user, currentMonthPrefix]);

  // Calculations for Total Income, Total Expenses, and Net Balance (safely guarded against NaN)
  const { totalIncome, totalExpenses, incomeCount, expenseCount, netBalance, savingsRate } =
    useMemo(() => {
      let incSum = 0;
      let expSum = 0;
      let incCount = 0;
      let expCount = 0;

      for (const tx of currentMonthTransactions) {
        const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount)) || 0;
        if (isNaN(amount) || amount <= 0) continue;

        if (tx.type === 'income') {
          incSum += amount;
          incCount++;
        } else if (tx.type === 'expense') {
          expSum += amount;
          expCount++;
        }
      }

      const net = incSum - expSum;
      const rate = incSum > 0 ? Math.max(0, Math.round(((incSum - expSum) / incSum) * 100)) : 0;

      return {
        totalIncome: incSum,
        totalExpenses: expSum,
        incomeCount: incCount,
        expenseCount: expCount,
        netBalance: net,
        savingsRate: rate,
      };
    }, [currentMonthTransactions]);

  const hasFinancialActivity = totalIncome > 0 || totalExpenses > 0;
  const maxBarAmount = Math.max(totalIncome, totalExpenses, 1);
  const incomeBarHeight = Math.max(8, Math.round((totalIncome / maxBarAmount) * 100));
  const expenseBarHeight = Math.max(8, Math.round((totalExpenses / maxBarAmount) * 100));

  const totalVolume = totalIncome + totalExpenses;
  const incomeRatio = totalVolume > 0 ? Math.round((totalIncome / totalVolume) * 100) : 50;
  const expenseRatio = totalVolume > 0 ? 100 - incomeRatio : 50;

  // 1. Loading / Skeleton State
  if (isLoadingTransactions) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading analytics">
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="flex items-end justify-center gap-12 h-48">
            <div className="w-20 h-32 bg-slate-200 dark:bg-slate-800 rounded-t-2xl" />
            <div className="w-20 h-24 bg-slate-200 dark:bg-slate-800 rounded-t-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 3 Summary Stat Cards: Total Income, Total Expenses, Net Balance */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" aria-label="Monthly Metrics">
        {/* Card 1: Total Income */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Total Income</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currency}{totalIncome.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                <TrendingUp className="w-3 h-3" />
                This Month
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {incomeCount} {incomeCount === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Card 2: Total Expenses */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Total Expenses</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currency}{totalExpenses.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
                <TrendingDown className="w-3 h-3" />
                This Month
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {expenseCount} {expenseCount === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Card 3: Net Balance */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Net Balance</span>
            </div>
            <div
              className={`p-2.5 rounded-2xl border ${
                netBalance >= 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                netBalance > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : netBalance < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {netBalance >= 0 ? '+' : '-'}{currency}{Math.abs(netBalance).toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  netBalance >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800'
                }`}
              >
                {netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Income − Expenses
              </span>
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
              netBalance >= 0 ? 'from-indigo-600 to-indigo-700' : 'from-rose-600 to-amber-600'
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          />
        </div>
      </section>

      {/* Income vs Expenses Chart Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        {/* Section Header with Period Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Income vs Expenses
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                <Calendar className="w-3 h-3" />
                This Month
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Direct monthly comparison for <span className="font-semibold text-slate-700 dark:text-slate-200">{currentMonthName}</span>
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* Visual Chart or Empty State */}
        {!hasFinancialActivity ? (
          <div className="py-14 sm:py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <BarChart2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No financial activity yet.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Add your income and expense transactions for {currentMonthName} to generate your comparative analytics.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pt-2">
            {/* Comparative Columns Display */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8 items-end h-64 sm:h-72 px-4 sm:px-12 pb-4 border-b border-slate-100 dark:border-slate-800">
              {/* Income Column */}
              <div className="flex flex-col items-center h-full justify-end group">
                <div className="text-center mb-2 space-y-0.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {currency}{totalIncome.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">({incomeRatio}%)</p>
                </div>

                <div
                  className="w-full max-w-[80px] sm:max-w-[120px] bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-2xl transition-all duration-500 shadow-sm group-hover:brightness-110 relative"
                  style={{ height: `${incomeBarHeight}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    Income: {currency}{totalIncome.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
                  Total Income
                </span>
              </div>

              {/* Expense Column */}
              <div className="flex flex-col items-center h-full justify-end group">
                <div className="text-center mb-2 space-y-0.5">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {currency}{totalExpenses.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">({expenseRatio}%)</p>
                </div>

                <div
                  className="w-full max-w-[80px] sm:max-w-[120px] bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-2xl transition-all duration-500 shadow-sm group-hover:brightness-110 relative"
                  style={{ height: `${expenseBarHeight}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    Expenses: {currency}{totalExpenses.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
                  Total Expenses
                </span>
              </div>
            </div>

            {/* Ratio Breakdown Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Income Share: {incomeRatio}%</span>
                <span>Expense Share: {expenseRatio}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${incomeRatio}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{ width: `${expenseRatio}%` }}
                />
              </div>
            </div>

            {/* Summary Insights */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    netBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {netBalance >= 0 ? 'Monthly Savings:' : 'Monthly Deficit:'}
                </span>
                <span
                  className={`font-extrabold ${
                    netBalance >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {netBalance >= 0 ? '+' : '-'}{currency}{Math.abs(netBalance).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-slate-500 dark:text-slate-400">
                Savings Rate: <span className="font-bold text-slate-900 dark:text-white">{savingsRate}%</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
