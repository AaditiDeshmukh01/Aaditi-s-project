'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  CreditCard,
  Building,
  Wallet,
  PiggyBank,
  TrendingUp,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { AccountCard, AccountType } from '@/types/expense';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountCard | null;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: any }[] = [
  { type: 'bank', label: 'Bank Account', icon: Building },
  { type: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { type: 'savings', label: 'Savings Account', icon: PiggyBank },
  { type: 'cash', label: 'Cash / Wallet', icon: Wallet },
  { type: 'investment', label: 'Investment', icon: TrendingUp },
  { type: 'loan', label: 'Loan Account', icon: Landmark },
  { type: 'other', label: 'Other Method', icon: ShieldCheck },
];

const CARD_COLORS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-600', ring: 'ring-amber-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-600', ring: 'ring-blue-400' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-600', ring: 'ring-cyan-400' },
  { id: 'slate', label: 'Slate', bg: 'bg-slate-700', ring: 'ring-slate-400' },
];

export default function EditAccountModal({ isOpen, onClose, account }: EditAccountModalProps) {
  const { updateAccountCardRecord, userProfile } = useExpense();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [last4, setLast4] = useState('');
  const [color, setColor] = useState('indigo');
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setType(account.type || 'bank');
      setBalance(account.balance !== undefined ? String(account.balance) : '0');
      setLast4(account.account_number_last4 || '');
      setColor(account.color || 'indigo');
      setIsDefault(Boolean(account.is_default));
      setValidationError(null);
      setServerError(null);
      setSavedSuccess(false);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleClose = () => {
    setValidationError(null);
    setServerError(null);
    setSavedSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // 1. Auth check
    if (!user || !user.id) {
      setValidationError('You must be logged in to update an account.');
      return;
    }

    // 2. Client-side validations
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Account or card name is required.');
      return;
    }

    let numBalance = 0;
    if (balance.trim()) {
      numBalance = parseFloat(balance.trim());
      if (isNaN(numBalance)) {
        setValidationError('Balance must be a valid number.');
        return;
      }
    }

    let cleanLast4: string | null = null;
    if (last4.trim()) {
      const sanitized = last4.trim().replace(/\D/g, '');
      if (sanitized.length > 4) {
        setValidationError('Last 4 digits should not exceed 4 numbers.');
        return;
      }
      cleanLast4 = sanitized.slice(-4);
    }

    setIsSubmitting(true);

    try {
      const { error } = await updateAccountCardRecord(account.id, {
        name: trimmedName,
        type,
        balance: numBalance,
        currency: userProfile.currency === '₹' ? 'INR' : userProfile.currency || 'INR',
        account_number_last4: cleanLast4,
        color,
        icon: type,
        is_default: isDefault,
      });

      if (error) {
        setServerError(error.message || 'Failed to update account/card.');
        setIsSubmitting(false);
        return;
      }

      setSavedSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setServerError(errMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Edit Account or Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update details for {account.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Validation & Server Error Alerts */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{serverError}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Account updated successfully!</span>
            </div>
          )}

          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Account / Card Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Salary Account, ICICI Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Account Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((tItem) => {
                const IconComponent = tItem.icon;
                const isSelected = type === tItem.type;
                return (
                  <button
                    key={tItem.type}
                    type="button"
                    onClick={() => setType(tItem.type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance & Last 4 Digits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Current Balance ({userProfile.currency || '₹'})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Last 4 Digits (Optional)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 4892"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Card Color Accent
            </label>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                    color === c.id ? `ring-3 ${c.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110` : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Default Account Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <input
              type="checkbox"
              id="editIsDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="editIsDefault" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Set as primary / default payment method
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
