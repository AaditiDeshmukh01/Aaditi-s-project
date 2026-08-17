'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { SavingsGoal } from '@/types/expense';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AddMoneyModal({ isOpen, onClose, goal }: AddMoneyModalProps) {
  const { addMoneyToSavingsGoal, userProfile } = useExpense();
  const { currency } = userProfile;

  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !goal) return null;

  const currentSaved = Number(goal.saved_amount ?? goal.currentAmount ?? 0);
  const targetAmount = Number(goal.target_amount ?? goal.targetAmount ?? 0);
  const parsedDeposit = parseFloat(depositAmount) || 0;
  const newSaved = currentSaved + Math.max(0, parsedDeposit);
  const newPercentage = targetAmount > 0 ? Math.min(100, Math.round((newSaved / targetAmount) * 100)) : 0;
  const isTargetReached = newSaved >= targetAmount;

  const handleClose = () => {
    setDepositAmount('');
    setValidationError(null);
    setServerError(null);
    setSavedSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleQuickAdd = (amt: number) => {
    const currentVal = parseFloat(depositAmount) || 0;
    setDepositAmount(String(currentVal + amt));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    const numAmount = parseFloat(depositAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter an amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addMoneyToSavingsGoal(goal.id, numAmount);

      if (error) {
        setServerError(error.message || 'Failed to deposit money in Supabase.');
        setIsSubmitting(false);
        return;
      }

      setSavedSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 600);
    } catch {
      setServerError('An unexpected error occurred while adding money.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-money-modal-title"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-money-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Add Money to Goal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {goal.name || goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Error Banner */}
          {(validationError || serverError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          {/* Goal Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Current Saved:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currency}{currentSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Target Goal:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currency}{targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Live Progress Preview */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  New Total: {currency}{newSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={isTargetReached ? 'text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1' : 'text-indigo-600 dark:text-indigo-400 font-extrabold'}>
                  {isTargetReached && <Sparkles className="w-3.5 h-3.5" />}
                  {newPercentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${newPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Deposit Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Amount to Deposit <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  setValidationError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-3 text-base font-extrabold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-colors"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Add
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  +{currency}{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || savedSuccess}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-950 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Depositing...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Deposited!</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Deposit Money</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
