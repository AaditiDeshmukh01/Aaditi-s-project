'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle, Calendar, Tag, PieChart } from 'lucide-react';
import { Budget } from '@/types/expense';
import { useExpense } from '@/context/ExpenseContext';
import { useLanguage } from '@/context/LanguageContext';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

const BUDGET_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Housing',
  'Utilities',
  'Other',
];

export default function EditBudgetModal({
  isOpen,
  onClose,
  budget,
}: EditBudgetModalProps) {
  const { updateBudgetRecord, userProfile } = useExpense();
  const { t, getCategoryName } = useLanguage();

  const [category, setCategory] = useState<string>('Food');
  const [amount, setAmount] = useState<string>('');
  const [month, setMonth] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(String(budget.amount));
      // Standardize month to YYYY-MM for input[type="month"]
      const formattedMonth = budget.month.substring(0, 7);
      setMonth(formattedMonth);
      setValidationError(null);
      setServerError(null);
      setSavedSuccess(false);
      setIsSubmitting(false);
    }
  }, [budget, isOpen]);

  if (!isOpen || !budget) return null;

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

    if (!category || !category.trim()) {
      setValidationError('Category is required.');
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      setValidationError('Budget amount is required.');
      return;
    }

    const numAmount = parseFloat(trimmedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Budget amount must be a valid number greater than 0.');
      return;
    }

    if (!month || !month.trim()) {
      setValidationError('Month is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await updateBudgetRecord(budget.id, {
        category: category.trim(),
        amount: numAmount,
        month: month.trim(),
      });

      if (error) {
        setServerError(error.message || 'Failed to update budget. Please try again.');
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
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Budget
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update category spending limit in your cloud database
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
          <div className="py-12 px-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Budget Updated!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your budget changes have been saved to Supabase successfully.
            </p>
          </div>
        ) : (
          /* Budget Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Error Banners */}
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

            {/* 1. Category Dropdown (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('category')} <span className="text-rose-500">*</span></span>
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
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Budget Amount Input (Required, > 0) */}
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

            {/* 3. Month Picker (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Month <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
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
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
