'use client';

import React, { useState } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { TransactionType } from '@/types/expense';
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Briefcase,
  ArrowRight,
  Trash2,
  Activity,
  GraduationCap,
  Tag,
} from 'lucide-react';

export default function RecentTransactions({
  onOpenAddModal,
}: {
  onOpenAddModal?: () => void;
}) {
  const { transactions, deleteTransaction, userProfile } = useExpense();
  const { t, getCategoryName } = useLanguage();
  const { currency } = userProfile;

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const titleOrDesc = tx.description || tx.title || '';
    const payment = tx.paymentMethod || '';
    const matchesSearch =
      titleOrDesc.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      payment.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

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
      case 'Housing':
        return <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Salary':
      case 'Freelance':
      case 'Investments':
        return <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getCategoryBg = (category: string, type: TransactionType) => {
    switch (category) {
      case 'Food':
      case 'Food & Dining':
        return 'bg-pink-50 dark:bg-pink-950/60 border-pink-100 dark:border-pink-800/60';
      case 'Shopping':
        return 'bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-800/60';
      case 'Transport':
      case 'Transportation':
        return 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800/60';
      case 'Bills':
      case 'Utilities':
        return 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-100 dark:border-yellow-800/60';
      case 'Entertainment':
        return 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-100 dark:border-cyan-800/60';
      case 'Health':
      case 'Healthcare':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60';
      case 'Education':
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800/60';
      case 'Housing':
        return 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-800/60';
      case 'Salary':
      case 'Freelance':
      case 'Investments':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t('recentTransactions')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('transactionsSubtitle')}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('expenses')}
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('income')}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar for transactions */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('filterPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all"
        />
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('noTransactions')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t('noTransactionsDesc')}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-xl transition-colors group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryBg(
                      tx.category,
                      tx.type
                    )}`}
                  >
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tx.description || tx.title || getCategoryName(tx.category)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{getCategoryName(tx.category)}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      {tx.paymentMethod && tx.paymentMethod !== 'Cloud Sync' && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline text-slate-400 dark:text-slate-500">
                            {tx.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Status & Delete Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-all cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / View All */}
      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('showing')} {filteredTransactions.length} {t('of')} {transactions.length} {t('transactions').toLowerCase()}
        </span>
        <button
          onClick={onOpenAddModal}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group cursor-pointer"
        >
          <span>{t('addNewRecord')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
