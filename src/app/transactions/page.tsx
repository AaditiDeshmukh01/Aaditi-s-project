'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  Activity,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction, TransactionType } from '@/types/expense';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import EditTransactionModal from '@/components/dashboard/EditTransactionModal';

const CATEGORY_OPTIONS = [
  'All',
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

export default function TransactionsPage() {
  const {
    transactions,
    totalIncome,
    totalExpenses,
    totalBalance,
    transactionCount,
    deleteTransaction,
    isLoadingTransactions,
    userProfile,
  } = useExpense();

  const { t, getCategoryName } = useLanguage();
  const { currency } = userProfile;

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modals & Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Category Icon Resolver
  const getCategoryIcon = (category: string, type: TransactionType) => {
    switch (category) {
      case 'Food':
      case 'Food & Dining':
        return <Utensils className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Transport':
      case 'Transportation':
        return <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Bills':
      case 'Utilities':
        return <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'Entertainment':
        return <Film className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'Health':
      case 'Healthcare':
        return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Salary':
      case 'Freelance':
      case 'Investments':
        return <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return type === 'income' ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        );
    }
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // 1. Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // 2. Category filter
        if (selectedCategory !== 'All') {
          if (tx.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // 3. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const desc = (tx.description || tx.title || '').toLowerCase();
          const cat = tx.category.toLowerCase();
          if (!desc.includes(q) && !cat.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'highest') {
          return b.amount - a.amount;
        }
        if (sortBy === 'lowest') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, searchQuery, sortBy]);

  // Handle Delete with optimistic UI and Supabase error catch
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    try {
      const { error } = await deleteTransaction(id);
      if (error) {
        setActionError(error.message || 'Failed to delete transaction.');
      }
    } catch (e) {
      setActionError('An unexpected error occurred while deleting.');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const formattedBalance = `${totalBalance < 0 ? '-' : ''}${currency}${Math.abs(totalBalance).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('transactions')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track and manage your income and expenses
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Transaction</span>
        </button>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Live Dynamic Summary Cards */}
      <section aria-label="Transaction Financial Summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Income Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{currency}{totalIncome.toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Money coming in</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            -{currency}{totalExpenses.toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Money going out</span>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formattedBalance}
          </h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                totalBalance >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800'
              }`}
            >
              {totalBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
            <span className="text-slate-400 dark:text-slate-500">Total Income - Expenses</span>
          </div>
        </div>

        {/* Number of Transactions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Number of Transactions
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {transactionCount}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>{filteredTransactions.length} matching current view</span>
          </div>
        </div>
      </section>

      {/* 3. Search, Filters & Sorting Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Buttons (4 cols) */}
          <div className="md:col-span-4 flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                selectedType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                selectedType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Filter & Sorting Dropdowns (3 cols) */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transactions List / Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Loading State */}
        {isLoadingTransactions ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading transactions from Supabase...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {transactions.length === 0 ? 'No Transactions Recorded Yet' : 'No Matching Transactions'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {transactions.length === 0
                ? 'Start tracking your personal finances by adding your first expense or income record.'
                : 'Try adjusting your search keywords or filter criteria to see your transactions.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isDeleting = deletingId === tx.id;
                    const isConfirming = deleteConfirmId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* 1. Date */}
                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          {tx.date}
                        </td>

                        {/* 2. Description */}
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {getCategoryIcon(tx.category, tx.type)}
                            </div>
                            <div>
                              <p className="leading-snug">{tx.description || tx.title || tx.category}</p>
                              {tx.description && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                                  {tx.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Category */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {getCategoryName(tx.category)}
                          </span>
                        </td>

                        {/* 4. Type (Visually distinct income vs expense) */}
                        <td className="py-4 px-6">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Income (In)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>Expense (Out)</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Amount */}
                        <td className="py-4 px-6 text-right font-extrabold text-base whitespace-nowrap">
                          <span
                            className={
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-4 px-6 text-right">
                          {isConfirming ? (
                            <div className="flex items-center justify-end gap-2 animate-in fade-in">
                              <span className="text-xs text-rose-600 font-bold">Delete?</span>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                disabled={isDeleting}
                                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                              >
                                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingTransaction(tx)}
                                title="Edit Transaction"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(tx.id)}
                                title="Delete Transaction"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View (Visible only on small devices) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isDeleting = deletingId === tx.id;
                const isConfirming = deleteConfirmId === tx.id;

                return (
                  <div key={tx.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {getCategoryIcon(tx.category, tx.type)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {tx.description || tx.title || tx.category}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{tx.category}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-base font-extrabold whitespace-nowrap ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      {isIncome ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Income</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
                          <ArrowDownRight className="w-3 h-3" />
                          <span>Expense</span>
                        </span>
                      )}

                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-600 font-bold">Delete?</span>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 bg-rose-600 text-white rounded-lg font-bold"
                          >
                            {isDeleting ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"
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
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  );
}
