'use client';

import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  Calendar,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Plane,
  Laptop,
  Car,
  GraduationCap,
  Home,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Award,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { SavingsGoal } from '@/types/expense';
import CreateGoalModal from '@/components/dashboard/CreateGoalModal';
import EditGoalModal from '@/components/dashboard/EditGoalModal';
import AddMoneyModal from '@/components/dashboard/AddMoneyModal';

export default function SavingsGoalsPage() {
  const {
    savingsGoals,
    isLoadingSavingsGoals,
    deleteSavingsGoalRecord,
    userProfile,
  } = useExpense();

  const { t } = useLanguage();
  const { currency } = userProfile;

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'achieved'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<SavingsGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Category Icon Resolver
  const getGoalIcon = (category?: string) => {
    switch (category) {
      case 'Emergency':
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Vacation':
      case 'Plane':
        return <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Gadgets':
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Vehicle':
        return <Car className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Education':
        return <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Home':
        return <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Investment':
        return <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      default:
        return <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No target date';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Process and Filter Goals
  const processedGoals = useMemo(() => {
    return savingsGoals.map((g) => {
      const target = Number(g.target_amount ?? g.targetAmount ?? 0);
      const saved = Number(g.saved_amount ?? g.currentAmount ?? 0);
      const rawProgress = target > 0 ? (saved / target) * 100 : 0;
      const displayPercentage = Math.min(100, Math.round(rawProgress));
      const remaining = Math.max(0, target - saved);
      const isAchieved = saved >= target && target > 0;

      return {
        ...g,
        target,
        saved,
        displayPercentage,
        remaining,
        isAchieved,
      };
    });
  }, [savingsGoals]);

  const filteredGoals = useMemo(() => {
    return processedGoals.filter((g) => {
      // 1. Status Filter
      if (statusFilter === 'in-progress' && g.isAchieved) return false;
      if (statusFilter === 'achieved' && !g.isAchieved) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (g.name || g.title || '').toLowerCase().includes(q);
        const catMatch = (g.category || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch) return false;
      }

      return true;
    });
  }, [processedGoals, statusFilter, searchQuery]);

  // Overall Summary Metrics
  const totalTargetAmount = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + Number(g.target_amount ?? g.targetAmount ?? 0), 0);
  }, [savingsGoals]);

  const totalSavedAmount = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + Number(g.saved_amount ?? g.currentAmount ?? 0), 0);
  }, [savingsGoals]);

  const overallProgress = totalTargetAmount > 0
    ? Math.min(100, Math.round((totalSavedAmount / totalTargetAmount) * 100))
    : 0;

  const completedCount = useMemo(() => {
    return processedGoals.filter((g) => g.isAchieved).length;
  }, [processedGoals]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    try {
      const { error } = await deleteSavingsGoalRecord(id);
      if (error) {
        setActionError(error.message || 'Failed to delete savings goal.');
      }
    } catch {
      setActionError('An unexpected error occurred while deleting savings goal.');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header with Title and Create Goal Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('savingsGoals')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Turn your plans into progress.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Goal</span>
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
      <section aria-label="Savings Goals Summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Target Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Target
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currency}{totalTargetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Across all savings targets</span>
          </div>
        </div>

        {/* Total Saved Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Saved
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {currency}{totalSavedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Accumulated savings in cloud</span>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {overallProgress}%
          </h3>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Goals Completed Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Goals Achieved
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {completedCount} <span className="text-sm font-semibold text-slate-400">/ {savingsGoals.length}</span>
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>{savingsGoals.length - completedCount} in progress</span>
          </div>
        </div>
      </section>

      {/* 3. Search and Status Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Box */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search goals by name or category..."
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

          {/* Status Filter Dropdown */}
          <div className="sm:col-span-4 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'in-progress' | 'achieved')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Goals ({savingsGoals.length})</option>
              <option value="in-progress">In Progress ({savingsGoals.length - completedCount})</option>
              <option value="achieved">Goal Achieved ({completedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Savings Goals Cards Grid / Empty / Loading State */}
      <div>
        {isLoadingSavingsGoals ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading savings goals from Supabase...
            </p>
          </div>
        ) : filteredGoals.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {savingsGoals.length === 0 ? 'No Savings Goals' : 'No Matching Goals'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {savingsGoals.length === 0
                ? 'Nothing saved yet. Start with a goal and watch your progress grow.'
                : 'Try adjusting your search keyword or status filter.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Goal</span>
            </button>
          </div>
        ) : (
          /* Goals Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredGoals.map((g) => {
              const isDeleting = deletingId === g.id;
              const isConfirming = deleteConfirmId === g.id;

              return (
                <div
                  key={g.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon, Goal Name, Target Date & Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs">
                          {getGoalIcon(g.category || g.icon)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {g.name || g.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {g.category && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                {g.category}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(g.target_date || g.targetDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {g.isAchieved ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Goal Achieved</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                          {g.displayPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Amount Metrics: Target & Saved */}
                    <div className="space-y-3 mt-4">
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Target Goal
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {currency}{g.target.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Saved Amount
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {currency}{g.saved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar & Remaining Amount */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">
                            {g.displayPercentage}% Progress
                          </span>
                          <span className={g.isAchieved ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400 font-bold'}>
                            {g.isAchieved
                              ? 'Target Reached! 🎉'
                              : `${currency}${g.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining`}
                          </span>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              g.isAchieved
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                            } rounded-full transition-all duration-500`}
                            style={{ width: `${g.displayPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Add Money, Edit & Delete */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Add Money Button */}
                    <button
                      onClick={() => setAddMoneyGoal(g)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Money</span>
                    </button>

                    {isConfirming ? (
                      <div className="flex items-center gap-2 animate-in fade-in">
                        <span className="text-xs text-rose-600 font-bold">Delete?</span>
                        <button
                          onClick={() => handleDelete(g.id)}
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
                          onClick={() => setEditingGoal(g)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Edit Goal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(g.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete Goal"
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

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={Boolean(editingGoal)}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={Boolean(addMoneyGoal)}
        onClose={() => setAddMoneyGoal(null)}
        goal={addMoneyGoal}
      />
    </div>
  );
}
