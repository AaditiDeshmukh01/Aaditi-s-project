'use client';

import React, { useState } from 'react';
import { X, Check, Loader2, AlertCircle, Calendar, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ExpenseCategory, TransactionType } from '@/types/expense';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

const INCOME_CATEGORIES: string[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

export default function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const { addTransactionRecord, userProfile } = useExpense();
  const { t, getCategoryName } = useLanguage();
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Food' : 'Salary');
    setValidationError(null);
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setValidationError(null);
    setServerError(null);
    setSavedSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // 1. Authentication check
    if (!user || !user.id) {
      setValidationError('You must be logged in to record a transaction.');
      return;
    }

    // 2. Client-side Validations
    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      setValidationError('Amount is required. Please enter an amount.');
      return;
    }

    const numAmount = parseFloat(trimmedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Amount must be a valid number greater than 0.');
      return;
    }

    if (!category || !category.trim()) {
      setValidationError('Category is required. Please select a category.');
      return;
    }

    if (!date || !date.trim()) {
      setValidationError('Date is required. Please pick a valid date.');
      return;
    }

    // 3. Save Transaction to Supabase
    setIsSubmitting(true);

    try {
      const { error } = await addTransactionRecord({
        type,
        amount: numAmount,
        category: category.trim(),
        description: description.trim() || undefined,
        date: date.trim(),
      });

      if (error) {
        setServerError(error.message || 'Failed to save transaction. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 4. Success State & Form Reset
      setSavedSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setServerError(errMessage);
      setIsSubmitting(false);
    }
  };

  const isExpense = type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors ${
                isExpense
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isExpense ? t('addExpense') : t('addIncome')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isExpense
                  ? 'Record an expense to track your spending'
                  : 'Record income to increase your balance'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          /* Success Screen Feedback */
          <div className="py-14 px-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {isExpense ? t('expenseAddedSuccess') : t('incomeAddedSuccess')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {t('expenseAddedDesc')}
            </p>
          </div>
        ) : (
          /* Transaction Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Type Selector (Tabs: Expense vs Income) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isExpense
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>{t('expense')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isExpense
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{t('income')}</span>
              </button>
            </div>

            {/* Validation & Server Error Messages */}
            {validationError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-amber-700 dark:text-amber-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {serverError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* 1. Amount Input (Required, > 0) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('amount')} ({userProfile.currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  {userProfile.currency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  required
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 2. Category Dropdown (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('category')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all cursor-pointer"
                >
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Description / Merchant (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('descriptionOptional')}</span>
              </label>
              <input
                type="text"
                placeholder={isExpense ? 'e.g. Grocery store, dinner, bills...' : 'e.g. Monthly salary, bonus, payout...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>

            {/* 4. Date Picker (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('date')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                  isExpense
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-rose-950 active:scale-[0.98]'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-950 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('saving')}</span>
                  </>
                ) : (
                  <span>{isExpense ? t('saveExpense') : t('saveIncome')}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


