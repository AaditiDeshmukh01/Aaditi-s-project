'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export default function AuthIllustration() {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square flex items-center justify-center p-4 select-none">
      {/* Background Ambient Glows */}
      <div className="absolute w-64 h-64 bg-purple-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-48 h-48 bg-indigo-500/25 rounded-full blur-2xl -top-4 -right-4 pointer-events-none" />
      <div className="absolute w-40 h-40 bg-pink-500/20 rounded-full blur-2xl -bottom-4 -left-4 pointer-events-none" />

      {/* Decorative Outer Rings */}
      <div className="absolute inset-4 rounded-full border border-purple-500/15 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />
      <div className="absolute inset-12 rounded-full border border-indigo-500/10 pointer-events-none" />

      {/* Main Glassmorphic 3D Card */}
      <div className="relative z-10 w-full max-w-[290px] sm:max-w-[330px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-900/60 via-zinc-900/80 to-black/90 backdrop-blur-xl border border-purple-400/30 shadow-2xl shadow-purple-950/80 transform -rotate-2 hover:rotate-0 transition-transform duration-500 group overflow-hidden">
        {/* Hologram Card Shine Effect */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000" />

        {/* Card Header: App Name & Tagline */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200 shadow-inner">
                <Zap className="w-4 h-4 text-purple-300" />
              </div>
              <span className="text-xs font-bold tracking-wider text-purple-200 uppercase">
                EXPENSEFLOW
              </span>
            </div>
            <p className="text-[10px] text-purple-300/80 mt-1 font-medium">
              A smarter way to track spending
            </p>
          </div>
          <CreditCard className="w-5 h-5 text-purple-300/70 shrink-0" />
        </div>

        {/* Chip & Small Badge */}
        <div className="mt-4 flex items-center justify-between">
          <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200/90 via-amber-400/70 to-amber-600/90 border border-amber-300/40 shadow-inner" />
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-purple-300" />
            SMART & SIMPLE
          </span>
        </div>

        {/* Main Heading & Supporting Text */}
        <div className="mt-4 pt-1 space-y-1">
          <h3 className="text-sm sm:text-base font-black tracking-wide text-white uppercase">
            KNOW WHERE IT GOES
          </h3>
          <p className="text-[11px] text-zinc-300 leading-snug">
            Track it. Plan it. Keep it simple.
          </p>
        </div>
      </div>

      {/* Floating Badge 1: Top Floating Box (Top Right) */}
      <div className="absolute top-3 sm:top-5 right-0 sm:right-2 z-20 px-3.5 py-2.5 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-950/70 flex items-center gap-2.5 animate-bounce [animation-duration:4s]">
        <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-white">Money, Made Simple</p>
          <p className="text-[10px] text-zinc-400">Stay on top of every move</p>
        </div>
      </div>

      {/* Floating Badge 2: Bottom Floating Box (Bottom Left) */}
      <div className="absolute bottom-3 sm:bottom-5 left-0 sm:left-2 z-20 px-3.5 py-2.5 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-950/70 flex items-center gap-2.5 animate-bounce [animation-duration:5s] [animation-delay:1s]">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-white">Spend With Confidence</p>
          <p className="text-[10px] text-zinc-400">Less guessing. More control.</p>
        </div>
      </div>

      {/* Floating Accent Sparkles */}
      <div className="absolute top-10 left-10 text-purple-400/70 animate-pulse pointer-events-none">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="absolute bottom-16 right-8 text-indigo-400/70 animate-pulse pointer-events-none [animation-delay:2s]">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
