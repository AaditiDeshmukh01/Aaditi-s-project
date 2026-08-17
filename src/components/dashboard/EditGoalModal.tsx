'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Target,
  ShieldCheck,
  Plane,
  Laptop,
  Car,
  GraduationCap,
  Home,
  TrendingUp,
} from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { SavingsGoal } from '@/types/expense';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

const GOAL_CATEGORIES = [
  { id: 'General', label: 'General Goal', icon: Target },
  { id: 'Emergency', label: 'Emergency Fund', icon: ShieldCheck },
  { id: 'Vacation', label: 'Vacation & Travel', icon: Plane },
  { id: 'Gadgets', label: 'Tech & Gadgets', icon: Laptop },
  { id: 'Vehicle', label: 'Car / Vehicle', icon: Car },
  { id: 'Education', label: 'Education', icon: GraduationCap },
  { id: 'Home', label: 'Home & Real Estate', icon: Home },
  { id: 'Investment', label: 'Investments', icon: TrendingUp },
];

export default function EditGoalModal({ isOpen, onClose, goal }: EditGoalModalProps) {
  const { updateSavingsGoalRecord, userProfile } = useExpense();
  const { currency } = userProfile;

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name || goal.title || '');
      setTargetAmount(String(goal.target_amount ?? goal.targetAmount ?? ''));
      setSavedAmount(String(goal.saved_amount ?? goal.currentAmount ?? '0'));
      setTargetDate(goal.target_date || goal.targetDate || '');
      setCategory(goal.category || 'General');
      setValidationError(null);
      setServerError(null);
      setSavedSuccess(false);
      setIsSubmitting(false);
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    if (!name.trim()) {
      setValidationError('Please enter a goal name.');
      return;
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      setValidationError('Target amount must be greater than 0.');
      return;
    }

    const numSaved = parseFloat(savedAmount || '0');
    if (isNaN(numSaved) || numSaved < 0) {
      setValidationError('Saved amount cannot be negative.');
      return;
    }

    if (numSaved > numTarget) {
      setValidationError('Saved amount cannot be greater than target amount.');
      return;
    }

    if (targetDate) {
      const parsedDate = new Date(targetDate);
      if (isNaN(parsedDate.getTime())) {
        setValidationError('Please enter a valid target date.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { error } = await updateSavingsGoalRecord(goal.id, {
        name: name.trim(),
        target_amount: numTarget,
        saved_amount: numSaved,
        target_date: targetDate ? targetDate : null,
        category,
      });

      if (error) {
        setServerError(error.message || 'Failed to update goal in Supabase.');
        setIsSubmitting(false);
        return;
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setServerError('An unexpected error occurred while updating goal.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-goal-modal-title"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-goal-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Savings Goal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your goal targets, progress, or date in Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Error Banner */}
          {(validationError || serverError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          {/* Goal Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Goal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Dream Vacation"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError(null);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Target Amount & Saved Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Amount ({currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Saved ({currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={savedAmount}
                  onChange={(e) => {
                    setSavedAmount(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Goal Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Goal Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate w-full text-center text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Date <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || savedSuccess}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Updated!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
