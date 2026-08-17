'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  Search,
  Calendar,
  Tag,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Layers,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  Activity,
  GraduationCap,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { Budget } from '@/types/expense';
import CreateBudgetModal from '@/components/dashboard/CreateBudgetModal';
import EditBudgetModal from '@/components/dashboard/EditBudgetModal';

export default function BudgetsPage() {
  const {
    budgets,
    transactions,
    isLoadingBudgets,
    isLoadingTransactions,
    deleteBudgetRecord,
    userProfile,
  } = useExpense();

  const { t, getCategoryName } = useLanguage();
  const { currency } = userProfile;

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food':
      case 'Food & Dining':
        return <Utensils className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'Shopping':
        return <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Transport':
      case 'Transportation':
        return <Car className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Bills':
      case 'Utilities':
        return <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'Entertainment':
        return <Film className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Health':
      case 'Healthcare':
        return <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Education':
        return <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Housing':
        return <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Tag className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  // Distinct Month List for Filter
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    budgets.forEach((b) => {
      const ym = b.month.substring(0, 7);
      set.add(ym);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [budgets]);

  // Format month string (e.g., '2026-08' or '2026-08-01' -> 'August 2026')
  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.substring(0, 7).split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  // Calculate spent amount for each budget based on user transactions
  const budgetsWithSpent = useMemo(() => {
    return budgets.map((b) => {
      const budgetMonthPrefix = b.month.substring(0, 7);
      const spent = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.category.toLowerCase() === b.category.toLowerCase() &&
            tx.date.startsWith(budgetMonthPrefix)
        )
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const percentage = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
      const remaining = Math.max(0, b.amount - spent);
      const isOverBudget = spent > b.amount;

      return {
        ...b,
        spent,
        percentage,
        remaining,
        isOverBudget,
      };
    });
  }, [budgets, transactions]);

  // Filtered Budgets List
  const filteredBudgets = useMemo(() => {
    return budgetsWithSpent.filter((b) => {
      // 1. Month filter
      if (selectedMonth !== 'all') {
        if (!b.month.startsWith(selectedMonth)) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = b.category.toLowerCase();
        if (!cat.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [budgetsWithSpent, selectedMonth, searchQuery]);

  // Summary Metrics Calculations
  const totalBudgetedAmount = useMemo(() => {
    return filteredBudgets.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  }, [filteredBudgets]);

  const totalSpentInBudgetedCategories = useMemo(() => {
    return filteredBudgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0);
  }, [filteredBudgets]);

  const totalRemainingBudget = Math.max(0, totalBudgetedAmount - totalSpentInBudgetedCategories);

  // Handle Delete with Supabase error catch
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    try {
      const { error } = await deleteBudgetRecord(id);
      if (error) {
        setActionError(error.message || 'Failed to delete budget.');
      }
    } catch (e) {
      setActionError('An unexpected error occurred while deleting budget.');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header with Title and Create Budget Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-xs">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('budgets')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Set monthly spending limits, track category budgets, and control expenses
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="font-bold underline text-xs cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Summary Metric Cards */}
      <section aria-label="Budget Overview Metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Budgeted Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Budgeted
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currency}{totalBudgetedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Target spending allocation</span>
          </div>
        </div>

        {/* Total Spent in Budgets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currency}{totalSpentInBudgetedCategories.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Across budgeted categories</span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Remaining Cap
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {currency}{totalRemainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Available to spend</span>
          </div>
        </div>

        {/* Number of Category Budgets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Budgets
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {budgets.length}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>{filteredBudgets.length} matching current filter</span>
          </div>
        </div>
      </section>

      {/* 3. Search and Month Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Box */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search budgets by category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Selector Dropdown */}
          <div className="sm:col-span-4 relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Months ({budgets.length})</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Budgets Cards Grid / Empty / Loading State */}
      <div>
        {(isLoadingBudgets || isLoadingTransactions) ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading budgets and spending data from Supabase...
            </p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <PieChart className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {budgets.length === 0 ? 'No Budgets Created Yet' : 'No Matching Budgets'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {budgets.length === 0
                ? 'Set your first monthly budget to track and limit your category spending.'
                : 'Try adjusting your search keyword or selected month filter.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Budget</span>
            </button>
          </div>
        ) : (
          /* Budgets Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredBudgets.map((b) => {
              const isDeleting = deletingId === b.id;
              const isConfirming = deleteConfirmId === b.id;
              const isOverBudget = b.spent > b.amount;
              const rawPercentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
              const displayPercentage = Math.round(rawPercentage);
              const isNearLimit = displayPercentage >= 80 && !isOverBudget;
              const isUnderBudget = !isOverBudget && !isNearLimit;

              let statusText = 'Under Budget';
              let statusBadgeStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800';
              let progressBarColor = 'bg-emerald-500 dark:bg-emerald-400';

              if (isOverBudget) {
                statusText = 'Over Budget';
                statusBadgeStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800';
                progressBarColor = 'bg-rose-500';
              } else if (isNearLimit) {
                statusText = 'Almost at Limit';
                statusBadgeStyle = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800';
                progressBarColor = 'bg-amber-500';
              }

              const progressWidth = Math.min(Math.max(displayPercentage, 0), 100);

              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category Icon, Name, Month & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs">
                          {getCategoryIcon(b.category)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {getCategoryName(b.category)}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{formatMonthLabel(b.month)}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap ${statusBadgeStyle}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Amount Details: Limit, Spent, Remaining */}
                    <div className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Budget Limit
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {currency}{b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Amount Spent
                          </span>
                          <span className={`text-sm sm:text-base font-extrabold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {currency}{b.spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">
                            {displayPercentage}% Used
                          </span>
                          <span className={isOverBudget ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                            {isOverBudget
                              ? `Over by ${currency}${(b.spent - b.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                              : `${currency}${b.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining`}
                          </span>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${progressBarColor} rounded-full transition-all duration-500`}
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Edit & Delete */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Cloud Synced
                    </span>

                    {isConfirming ? (
                      <div className="flex items-center gap-2 animate-in fade-in">
                        <span className="text-xs text-rose-600 font-bold">Delete?</span>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingBudget(b)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Edit Budget"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={Boolean(editingBudget)}
        onClose={() => setEditingBudget(null)}
        budget={editingBudget}
      />
    </div>
  );
}
