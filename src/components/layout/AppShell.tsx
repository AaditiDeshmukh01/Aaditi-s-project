'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { AuthScreen } from '@/types/auth';
import AuthContainer from '@/components/auth/AuthContainer';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import { LogOut, Loader2 } from 'lucide-react';

interface AppShellContentProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellContentProps) {
  const { user, isLoading: isAuthLoading, signOut, isPasswordRecovery } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleNavigate = (screen: AuthScreen, email?: string) => {
    if (email) {
      setPendingEmail(email);
    }
    setAuthScreen(screen);
  };

  // Derive user display name
  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  // 1. Loading state during session restoration
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-white tracking-wide">ExpenseFlow</p>
            <p className="text-xs text-zinc-400">Authenticating session...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Password Recovery Flow: Enforce Set New Password screen
  if (isPasswordRecovery) {
    return (
      <AuthContainer
        currentScreen="reset-password"
        onNavigate={handleNavigate}
        initialEmail={pendingEmail}
      />
    );
  }

  // 3. Unauthenticated: Protect app by rendering Auth Flow
  if (!user) {
    const activeAuthScreen = authScreen === 'dashboard' ? 'welcome' : authScreen;
    return (
      <AuthContainer
        currentScreen={activeAuthScreen}
        onNavigate={handleNavigate}
        initialEmail={pendingEmail}
      />
    );
  }

  // If user explicitly switched to viewing an auth screen while logged in
  if (authScreen !== 'dashboard' && authScreen !== 'welcome') {
    return (
      <AuthContainer
        currentScreen={authScreen}
        onNavigate={handleNavigate}
        initialEmail={pendingEmail}
      />
    );
  }

  // 3. Authenticated: Render Persistent Layout Shell with dynamic page content
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased transition-colors duration-200">
      {/* Active Session Status & Logout Bar */}
      <div className="bg-zinc-900 text-zinc-300 text-xs px-4 py-2 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Authenticated as <strong className="text-white">{displayName}</strong>{' '}
            <span className="text-zinc-400 hidden sm:inline">({user.email})</span>
          </span>
        </div>
        <button
          onClick={async () => {
            await signOut();
            setAuthScreen('welcome');
          }}
          className="flex items-center gap-1.5 font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="flex flex-1 w-full min-h-screen">
        {/* Desktop Sidebar (Persistent) */}
        <Sidebar
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAuth={() => setAuthScreen('welcome')}
        />

        {/* Mobile Nav (Slide drawer + bottom bar) */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Main Layout Container */}
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
          {/* Header */}
          <Header
            onOpenMobileMenu={() => setIsMobileNavOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenAuth={() => setAuthScreen('welcome')}
          />

          {/* Main Page Content Area */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
            {children}
          </main>
        </div>
      </div>

      {/* Interactive Add Transaction Modal (Global) */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ExpenseProvider>
            <AppShellContent>{children}</AppShellContent>
          </ExpenseProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
