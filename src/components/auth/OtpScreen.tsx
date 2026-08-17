'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthScreen } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Edit2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface OtpScreenProps {
  onNavigate: (screen: AuthScreen) => void;
  email?: string;
}

export default function OtpScreen({
  onNavigate,
  email = '',
}: OtpScreenProps) {
  const { verifyOtp, resetPassword } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend code
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle individual digit input
  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    if (errorMessage) setErrorMessage(null);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard events (Backspace, Left/Right arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event (supports 6-digit code pasting)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);

    try {
      if (email) {
        const { error } = await verifyOtp(email, code);
        if (error) {
          setErrorMessage(error.message || 'Invalid or expired verification code.');
          setIsVerifying(false);
          return;
        }
      }
      setIsVerifying(false);
      setIsVerified(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    } catch {
      setIsVerifying(false);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setErrorMessage(null);
    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    if (email) {
      try {
        await resetPassword(email);
      } catch (e) {
        console.error('Failed to resend code', e);
      }
    }
  };

  return (
    <div className="w-full bg-zinc-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl shadow-purple-950/40 relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => onNavigate('signup')}
        className="absolute top-6 left-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        title="Back to Sign Up"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="text-center space-y-2 mb-7 pt-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-950/50">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Your Email ✉️
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
          We&apos;ve sent a 6-digit verification code to
        </p>

        {/* Target Email Badge */}
        {email ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-semibold text-purple-300">
            <span>{email}</span>
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer ml-1"
              title="Change email"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-purple-300">your email address</p>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {isVerified ? (
        <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold text-white">Email Verified!</h3>
          <p className="text-xs text-zinc-400">
            Redirecting you to your Personal Expense Dashboard...
          </p>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 OTP Input Boxes */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-zinc-950/90 border border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 rounded-xl sm:rounded-2xl text-white outline-none transition-all"
              />
            ))}
          </div>

          {/* Resend Countdown */}
          <div className="text-center text-xs">
            {timeLeft > 0 ? (
              <p className="text-zinc-400 flex items-center justify-center gap-1.5">
                <span>Resend code in</span>
                <span className="font-bold text-purple-400 font-mono">{timeLeft}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={otp.join('').length < 6 || isVerifying}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer link to Login */}
      <p className="text-center text-xs text-zinc-400 mt-6">
        Already verified or have issues?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          Back to Login
        </button>
      </p>
    </div>
  );
}
