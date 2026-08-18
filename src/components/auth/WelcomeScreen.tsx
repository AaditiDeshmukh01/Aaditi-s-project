'use client';

import React from 'react';
import { AuthScreen } from '@/types/auth';
import AuthIllustration from './AuthIllustration';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onNavigate: (screen: AuthScreen, email?: string) => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="w-full flex flex-col items-center text-center space-y-6 sm:space-y-8">
      {/* 1. Finance Illustration */}
      <AuthIllustration />

      {/* 2. Headline & Subtitle */}
      <div className="space-y-3 max-w-sm mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">ExpenseFlow</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Track your money, understand your spending, and stay in control of your finances.
        </p>
      </div>

      {/* 3. Progress Step Indicator (3 Steps) */}
      <div className="flex items-center justify-center gap-2">
        <span className="w-7 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-500/50" />
        <span className="w-2 h-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors" />
        <span className="w-2 h-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors" />
      </div>

      {/* 4. Action Buttons */}
      <div className="w-full space-y-3 pt-2">
        <button
          onClick={() => onNavigate('login')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('login')}
          className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Skip to Login
        </button>
      </div>

      {/* 5. Feature Highlights Pills */}
      <div className="grid grid-cols-2 gap-2.5 w-full pt-2 border-t border-white/5 text-[11px] text-zinc-400">
        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Real-time Analytics</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private & Secure</span>
        </div>
      </div>
    </div>
  );
}
