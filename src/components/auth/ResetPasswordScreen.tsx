'use client';

import React, { useState } from 'react';
import { AuthScreen } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface ResetPasswordScreenProps {
  onNavigate: (screen: AuthScreen, email?: string) => void;
}

export default function ResetPasswordScreen({
  onNavigate,
}: ResetPasswordScreenProps) {
  const { updatePassword, setIsPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-zinc-700',
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error.message || 'Failed to update password. Please try again.');
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          setIsPasswordRecovery(false);
          onNavigate('dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl shadow-purple-950/40 relative animate-in fade-in duration-200">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-950/50">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Set New Password 🔒
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
          Create a secure, fresh password for your Expense Tracker account.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Your password has been changed successfully. Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              New Password
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
                className="w-full bg-zinc-950/70 focus:bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Security:
                </span>
                <span
                  className={`font-semibold ${
                    strength <= 1
                      ? 'text-rose-400'
                      : strength === 2
                      ? 'text-amber-400'
                      : strength === 3
                      ? 'text-indigo-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full transition-all duration-300 ${
                      strength >= step ? strengthColors[strength] : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-zinc-950/70 focus:bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
