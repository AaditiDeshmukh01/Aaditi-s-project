'use client';

import React, { useMemo, useState } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  Activity,
  GraduationCap,
  Home,
  Tag,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CategoryMetric {
  name: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  hex: string;
}

const CATEGORY_STYLE_MAP: Record<string, { color: string; hex: string; icon: React.ComponentType<{ className?: string }> }> = {
  Food: { color: 'bg-pink-500', hex: '#EC4899', icon: Utensils },
  'Food & Dining': { color: 'bg-pink-500', hex: '#EC4899', icon: Utensils },
  Shopping: { color: 'bg-purple-500', hex: '#8B5CF6', icon: ShoppingBag },
  Transport: { color: 'bg-amber-500', hex: '#F59E0B', icon: Car },
  Transportation: { color: 'bg-amber-500', hex: '#F59E0B', icon: Car },
  Bills: { color: 'bg-yellow-500', hex: '#EAB308', icon: Zap },
  Utilities: { color: 'bg-yellow-500', hex: '#EAB308', icon: Zap },
  Entertainment: { color: 'bg-cyan-500', hex: '#06B6D4', icon: Film },
  Health: { color: 'bg-emerald-500', hex: '#10B981', icon: Activity },
  Healthcare: { color: 'bg-emerald-500', hex: '#10B981', icon: Activity },
  Education: { color: 'bg-blue-500', hex: '#3B82F6', icon: GraduationCap },
  Housing: { color: 'bg-indigo-500', hex: '#6366F1', icon: Home },
  Other: { color: 'bg-slate-500', hex: '#64748B', icon: Tag },
};

// Fallback palette for dynamic custom categories
const FALLBACK_PALETTE = [
  '#6366F1', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981',
  '#06B6D4', '#3B82F6', '#EAB308', '#F43F5E', '#14B8A6',
];

export default function SpendingByCategory() {
  const { user } = useAuth();
  const { transactions, isLoadingTransactions, userProfile } = useExpense();
  const { getCategoryName } = useLanguage();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const currency = userProfile?.currency || '₹';

  // Synchronized "This Month" analytics period
  const currentMonthDate = useMemo(() => new Date(), []);
  const currentMonthPrefix = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentMonthDate]);

  const currentMonthName = useMemo(() => {
    return currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // Filter authenticated user expense transactions for currently selected analytics period
  const userMonthExpenses = useMemo(() => {
    if (!user || !user.id || !Array.isArray(transactions)) return [];
    return transactions.filter((tx) => {
      const isUser = !tx.user_id || tx.user_id === user.id;
      const isMonth = tx.date && tx.date.startsWith(currentMonthPrefix);
      const isExpense = tx.type === 'expense';
      return isUser && isMonth && isExpense;
    });
  }, [transactions, user, currentMonthPrefix]);

  // Aggregate and calculate spending by category (sorted highest first)
  const { categoryMetrics, totalExpenses } = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    let total = 0;

    for (const tx of userMonthExpenses) {
      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount)) || 0;
      if (isNaN(amount) || amount <= 0) continue;

      const cat = tx.category?.trim() || 'Other';
      const existing = categoryMap.get(cat) || { amount: 0, count: 0 };
      existing.amount += amount;
      existing.count += 1;
      categoryMap.set(cat, existing);
      total += amount;
    }

    const metrics: CategoryMetric[] = Array.from(categoryMap.entries())
      .map(([name, data], idx) => {
        const percentage = total > 0 ? Math.round((data.amount / total) * 100) : 0;
        const style = CATEGORY_STYLE_MAP[name] || {
          color: 'bg-indigo-500',
          hex: FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length],
          icon: Tag,
        };

        return {
          name,
          amount: data.amount,
          percentage,
          count: data.count,
          color: style.color,
          hex: style.hex,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by highest spending first

    return { categoryMetrics: metrics, totalExpenses: total };
  }, [userMonthExpenses]);

  // SVG Donut Chart Geometry calculations
  const donutSegments = useMemo(() => {
    if (totalExpenses <= 0 || categoryMetrics.length === 0) return [];

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return categoryMetrics.map((cat) => {
      const fraction = cat.amount / totalExpenses;
      const strokeDasharray = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += fraction * circumference;

      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
        fraction,
      };
    });
  }, [categoryMetrics, totalExpenses]);

  // 1. Loading Skeleton State
  if (isLoadingTransactions) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6 animate-pulse" aria-label="Loading category analytics">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-60 w-60 mx-auto rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = categoryMetrics.length > 0 && totalExpenses > 0;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Spending by Category
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
              <Calendar className="w-3 h-3" />
              This Month
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Expense distribution for <span className="font-semibold text-slate-700 dark:text-slate-200">{currentMonthName}</span>
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Categories:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
              {categoryMetrics.length}
            </span>
          </div>
        )}
      </div>

      {/* Empty State when zero expense records */}
      {!hasData ? (
        <div className="py-14 sm:py-16 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No expenses recorded for this period.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              Add your expense transactions for {currentMonthName} to see your category distribution chart.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Donut Chart & Center Metric (5 Cols on large screen) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="20"
                  fill="none"
                />

                {/* Category Donut Segments */}
                {donutSegments.map((segment) => {
                  const isHovered = hoveredCategory === segment.name;
                  return (
                    <circle
                      key={segment.name}
                      cx="90"
                      cy="90"
                      r="70"
                      stroke={segment.hex}
                      strokeWidth={isHovered ? 24 : 20}
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(segment.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {hoveredCategory ? getCategoryName(hoveredCategory) : 'Total Spent'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {currency}
                  {hoveredCategory
                    ? (categoryMetrics.find((c) => c.name === hoveredCategory)?.amount || 0).toLocaleString('en-IN')
                    : totalExpenses.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {hoveredCategory
                    ? `${categoryMetrics.find((c) => c.name === hoveredCategory)?.percentage || 0}% of expenses`
                    : `${userMonthExpenses.length} transactions`}
                </span>
              </div>
            </div>

            {/* Visual Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 max-w-sm">
              {categoryMetrics.slice(0, 5).map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.hex }} />
                  <span className="truncate max-w-[90px]">{getCategoryName(cat.name)}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown List (7 Cols on large screen, sorted highest first) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-1">
              <span>Category & Activity</span>
              <span>Amount & Share</span>
            </div>

            <div className="space-y-2.5">
              {categoryMetrics.map((cat) => {
                const isHovered = hoveredCategory === cat.name;
                const IconComponent = CATEGORY_STYLE_MAP[cat.name]?.icon || Tag;

                return (
                  <div
                    key={cat.name}
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                      isHovered
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      {/* Left: Icon & Category Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{
                            backgroundColor: `${cat.hex}18`,
                            color: cat.hex,
                          }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {getCategoryName(cat.name)}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Percentage Badge */}
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          {currency}{cat.amount.toLocaleString('en-IN')}
                        </p>
                        <span className="inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(cat.percentage, 2)}%`,
                          backgroundColor: cat.hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
