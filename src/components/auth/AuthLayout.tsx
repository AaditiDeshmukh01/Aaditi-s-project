'use client';

import React from 'react';
import { AuthScreen } from '@/types/auth';
import { Wallet, Sparkles, LayoutDashboard } from 'lucide-react';

interface AuthLayoutProps {
  currentScreen: AuthScreen;
  onNavigate: (screen: AuthScreen) => void;
  children: React.ReactNode;
}

export default function AuthLayout({
  currentScreen,
  onNavigate,
  children,
}: AuthLayoutProps) {
  const screens: { id: AuthScreen; label: string }[] = [
    { id: 'welcome', label: '1. Welcome' },
    { id: 'login', label: '2. Login' },
    { id: 'signup', label: '3. Sign Up' },
    { id: 'otp', label: '4. OTP Verify' },
    { id: 'forgot', label: '5. Forgot Pwd' },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between relative overflow-hidden selection:bg-purple-600 selection:text-white font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[450px] h-[450px] bg-purple-800/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/5">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Wallet className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
              ExpenseFlow
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AUTH
            </span>
          </div>
        </div>

        {/* Quick Screen Switcher (For rapid testing & review) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-white/10 overflow-x-auto max-w-full">
          {screens.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentScreen === s.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}

          {/* Jump to Dashboard button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
            title="Open Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Centered Content Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto w-full max-w-md mx-auto">
        <div className="w-full animate-in fade-in zoom-in-95 duration-300">
          {children}
        </div>
      </main>

      {/* Footer / Trust Badges */}
      <footer className="relative z-20 py-4 px-4 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Bank-Grade 256-bit Encryption
        </span>
        <span className="hidden sm:inline">•</span>
        <span>Zero Hidden Fees</span>
        <span className="hidden sm:inline">•</span>
        <span>© 2026 ExpenseFlow. All rights reserved.</span>
      </footer>
    </div>
  );
}
