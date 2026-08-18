'use client';

import React, { useState } from 'react';
import { AuthScreen } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: AuthScreen, email?: string) => void;
}

export default function ForgotPasswordScreen({
  onNavigate,
}: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(cleanEmail);
      if (error) {
        setErrorMessage(error.message || 'Failed to send reset link. Please check your email and try again.');
      } else {
        setIsSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl shadow-purple-950/40 relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => onNavigate('login')}
        className="absolute top-6 left-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        title="Back to Login"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="text-center space-y-2 mb-7 pt-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-950/50">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Forgot Password? 🔑
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
          Enter your registered email and we&apos;ll send you a password reset link.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {isSent ? (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Reset Link Sent!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              We&apos;ve dispatched a secure password reset link to <span className="font-semibold text-purple-300">{email}</span>.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setEmail('');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Didn&apos;t receive it? Try another email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Your Registered Email
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
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer link to Login */}
      {!isSent && (
        <p className="text-center text-xs text-zinc-400 mt-6">
          Remember your credentials?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </p>
      )}
    </div>
  );
}
