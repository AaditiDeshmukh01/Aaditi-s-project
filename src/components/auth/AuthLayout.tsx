'use client';

import React from 'react';
import { AuthScreen } from '@/types/auth';

interface AuthLayoutProps {
  currentScreen?: AuthScreen;
  onNavigate?: (screen: AuthScreen, email?: string) => void;
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-purple-600 selection:text-white font-sans p-4 sm:p-6">
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

      {/* Main Centered Content Container */}
      <main className="relative z-20 w-full max-w-md mx-auto my-auto flex items-center justify-center">
        <div className="w-full animate-in fade-in zoom-in-95 duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}
