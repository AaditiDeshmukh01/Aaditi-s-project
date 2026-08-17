'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Building,
  Wallet,
  PiggyBank,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Star,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { AccountCard, AccountType } from '@/types/expense';
import CreateAccountModal from '@/components/dashboard/CreateAccountModal';
import EditAccountModal from '@/components/dashboard/EditAccountModal';

const CARD_THEMES: Record<string, { bg: string; text: string; chip: string; border: string }> = {
  indigo: {
    bg: 'from-indigo-600 via-indigo-700 to-slate-900',
    text: 'text-indigo-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-indigo-500/30',
  },
  purple: {
    bg: 'from-purple-600 via-purple-700 to-slate-900',
    text: 'text-purple-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-purple-500/30',
  },
  emerald: {
    bg: 'from-emerald-600 via-emerald-700 to-slate-900',
    text: 'text-emerald-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-emerald-500/30',
  },
  amber: {
    bg: 'from-amber-600 via-amber-700 to-slate-900',
    text: 'text-amber-100',
    chip: 'bg-white/20 border-white/30 text-white',
    border: 'border-amber-500/30',
  },
  rose: {
    bg: 'from-rose-600 via-rose-700 to-slate-900',
    text: 'text-rose-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-rose-500/30',
  },
  blue: {
    bg: 'from-blue-600 via-blue-700 to-slate-900',
    text: 'text-blue-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-blue-500/30',
  },
  cyan: {
    bg: 'from-cyan-600 via-cyan-700 to-slate-900',
    text: 'text-cyan-100',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-cyan-500/30',
  },
  slate: {
    bg: 'from-slate-700 via-slate-800 to-slate-950',
    text: 'text-slate-200',
    chip: 'bg-amber-300/30 border-amber-300/40 text-amber-200',
    border: 'border-slate-600/30',
  },
};

export default function AccountsPage() {
  const {
    accountsCards,
    isLoadingAccountsCards,
    deleteAccountCardRecord,
    userProfile,
  } = useExpense();

  const { t } = useLanguage();
  const { currency } = userProfile;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Type Icon Resolver
  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4" />;
      case 'loan':
        return <Landmark className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'Bank Account';
      case 'credit_card':
        return 'Credit Card';
      case 'savings':
        return 'Savings Account';
      case 'cash':
        return 'Cash Wallet';
      case 'investment':
        return 'Investment';
      case 'loan':
        return 'Loan Account';
      default:
        return 'Other';
    }
  };

  // Metrics
  const totalBalance = useMemo(() => {
    return accountsCards.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  }, [accountsCards]);

  const bankAndSavingsCount = useMemo(() => {
    return accountsCards.filter((a) => a.type === 'bank' || a.type === 'savings').length;
  }, [accountsCards]);

  const creditCardsCount = useMemo(() => {
    return accountsCards.filter((a) => a.type === 'credit_card').length;
  }, [accountsCards]);

  // Delete Action
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    try {
      const { error } = await deleteAccountCardRecord(id);
      if (error) {
        setActionError(error.message || 'Failed to delete account/card.');
      }
    } catch {
      setActionError('An unexpected error occurred while deleting account/card.');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-xs">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('accountsAndCards')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your connected bank accounts, debit/credit cards, and payment methods
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account / Card</span>
        </button>
      </div>

      {/* 2. Error Banner */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-500 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Accounts Balance
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {currency}{Math.round(totalBalance).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bank & Savings
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {bankAndSavingsCount} <span className="text-xs font-medium text-slate-400">active</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Credit Cards & Wallets
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {creditCardsCount} <span className="text-xs font-medium text-slate-400">active</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Accounts & Cards Content / Grid */}
      {isLoadingAccountsCards ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loading your accounts and payment cards...
          </p>
        </div>
      ) : accountsCards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No accounts or cards added yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Add your primary bank accounts, credit cards, or digital wallets to track your total net worth and organize transaction sources.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountsCards.map((account) => {
            const theme = CARD_THEMES[account.color || 'indigo'] || CARD_THEMES.indigo;
            const isDeleting = deletingId === account.id;
            const isConfirming = deleteConfirmId === account.id;

            return (
              <div
                key={account.id}
                className="group relative flex flex-col justify-between rounded-3xl p-6 shadow-lg bg-gradient-to-br transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }}
              >
                {/* Visual Glassmorphic Accent Layers */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-95`} />
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none" />

                {/* Card Content Top Section */}
                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Type Badge, Default Badge & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                        {getTypeIcon(account.type)}
                        <span>{getTypeLabel(account.type)}</span>
                      </span>

                      {account.is_default && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setEditingAccount(account)}
                        title="Edit Account"
                        className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(account.id)}
                        title="Delete Account"
                        className="p-1.5 text-rose-300 hover:text-rose-100 rounded-lg hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* EMV Chip & Contactless Visual Mock */}
                  <div className="flex items-center justify-between pt-2">
                    <div className={`w-10 h-7 rounded-lg ${theme.chip} border flex items-center justify-center shadow-inner`}>
                      <div className="w-6 h-4 border border-white/30 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                        <div className="border-r border-white/30" />
                        <div />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-white/60">
                      {account.currency || 'INR'}
                    </span>
                  </div>

                  {/* Account Name & Masked Number */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-wide truncate">
                      {account.name}
                    </h3>
                    <p className="text-xs font-mono tracking-widest text-white/70 mt-1">
                      {account.account_number_last4
                        ? `•••• •••• •••• ${account.account_number_last4}`
                        : '•••• •••• •••• ••••'}
                    </p>
                  </div>
                </div>

                {/* Card Content Bottom Section: Balance */}
                <div className="relative z-10 pt-6 mt-4 border-t border-white/15 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                      Available Balance
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      {currency}{Number(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-white/60">
                    Active
                  </span>
                </div>

                {/* Inline Delete Confirmation Overlay */}
                {isConfirming && (
                  <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-150">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Delete Account?</h4>
                      <p className="text-xs text-slate-300 max-w-xs">
                        Are you sure you want to remove <strong className="text-white">{account.name}</strong>?
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={isDeleting}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <span>Confirm Delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create & Edit Modals */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditAccountModal
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        account={editingAccount}
      />
    </div>
  );
}
