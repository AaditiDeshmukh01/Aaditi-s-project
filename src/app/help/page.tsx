'use client';

import React from 'react';
import { HelpCircle, MessageSquare, BookOpen, Mail, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('helpAndSupport')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Knowledge base, frequently asked questions, and support documentation
            </p>
          </div>
        </div>
      </div>

      {/* Ready for Implementation Notice */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Help & Support Center
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This section is ready for implementation. Comprehensive user documentation, interactive guides, FAQs, and ticket submission workflows will be available here.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Support System Integration Ready</span>
        </div>
      </div>

      {/* Quick FAQ Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Getting Started Guide</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Learn how to record expenses, set monthly category budgets, and monitor cashflow analytics.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Security & Privacy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All financial transactions are protected with strict user-level row security (RLS) in Supabase.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 w-fit">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Contact Us</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Need help or have feature suggestions? Our team is available 24/7.
          </p>
        </div>
      </div>
    </div>
  );
}
