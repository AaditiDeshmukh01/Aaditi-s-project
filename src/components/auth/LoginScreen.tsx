'use client';

import React, { useState } from 'react';
import { AuthScreen } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (screen: AuthScreen) => void;
}

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(cleanEmail, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Your email has not been confirmed yet. Please check your inbox for the confirmation link.');
        } else {
          setErrorMessage(error.message || 'Login failed. Please try again.');
        }
      } else {
        onNavigate('dashboard');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl shadow-purple-950/40 relative">
      {/* Glow Corner Accents */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-1.5 mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-semibold text-purple-300 mb-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Supabase Authentication</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome Back 👋
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Log in with your credentials to manage your expenses.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-zinc-950/70 focus:bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-zinc-950/70 focus:bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1 transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/30 accent-purple-600 cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => onNavigate('forgot')}
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
        >
          {isLoading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer link to Sign Up */}
      <p className="text-center text-xs text-zinc-400 mt-6">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('signup')}
          className="font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
