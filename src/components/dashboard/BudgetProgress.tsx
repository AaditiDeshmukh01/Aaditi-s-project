'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Target,
  Plus,
  ShieldCheck,
  Plane,
  Laptop,
  PieChart,
} from 'lucide-react';

export default function BudgetProgress() {
  const { budgets, transactions, savingsGoals, userProfile } = useExpense();
  const { t, getCategoryName } = useLanguage();
  const { currency } = userProfile;

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const budgetsWithSpent = useMemo(() => {
    return budgets.map((budget) => {
      const budgetMonthPrefix = budget.month ? budget.month.substring(0, 7) : currentMonthPrefix;
      const spent = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.category.toLowerCase() === budget.category.toLowerCase() &&
            tx.date.startsWith(budgetMonthPrefix)
        )
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const allocated = budget.amount ?? budget.allocated ?? 0;
      return {
        ...budget,
        allocated,
        spent,
      };
    });
  }, [budgets, transactions, currentMonthPrefix]);

  const getGoalIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldCheck':
      case 'Emergency':
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Plane':
      case 'Vacation':
        return <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Laptop':
      case 'Gadgets':
        return <Laptop className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Budgets Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('monthlyBudgets')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('budgetsSubtitle')}
            </p>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newBudget')}</span>
          </Link>
        </div>

        {budgetsWithSpent.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('noBudgets')}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{t('noBudgetsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetsWithSpent.map((budget) => {
              const allocated = budget.allocated ?? budget.amount ?? 0;
              const spent = budget.spent ?? 0;
              const percentage = allocated > 0
                ? Math.min(Math.round((spent / allocated) * 100), 100)
                : 0;
              const isNearLimit = percentage >= 85;
              const isOverBudget = percentage >= 100;

              let progressColor = 'bg-indigo-600 dark:bg-indigo-500';
              if (isOverBudget) progressColor = 'bg-rose-500';
              else if (isNearLimit) progressColor = 'bg-amber-500';

              return (
                <div key={budget.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getCategoryName(budget.category)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {currency}{spent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {currency}{allocated.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{percentage}% {t('used')}</span>
                    <span className={isNearLimit ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                      {currency}{Math.max(0, allocated - spent).toLocaleString('en-IN')} {t('left')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Goals Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('savingsGoalsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('goalsSubtitle')}
            </p>
          </div>
          <Link
            href="/savings-goals"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newGoal')}</span>
          </Link>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('noGoals')}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{t('noGoalsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savingsGoals.map((goal) => {
              const target = Number(goal.target_amount ?? goal.targetAmount ?? 0);
              const saved = Number(goal.saved_amount ?? goal.currentAmount ?? 0);
              const rawPct = target > 0 ? (saved / target) * 100 : 0;
              const percentage = Math.min(100, Math.round(rawPct));
              const goalName = goal.name || goal.title || 'Goal';
              const isAchieved = saved >= target && target > 0;

              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700">
                        {getGoalIcon(goal.category || goal.icon)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {goalName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t('target')}: {goal.target_date || goal.targetDate || 'Flexible'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      isAchieved
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                    }`}>
                      {isAchieved ? '100% 🎉' : `${percentage}%`}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-1.5">
                    <div
                      className={`h-full ${
                        isAchieved
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                      } rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {t('saved')}: {currency}{saved.toLocaleString('en-IN')}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t('goal')}: {currency}{target.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
