'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  clearError: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'email' | 'recovery') => Promise<{ session: Session | null; error: AuthError | Error | null }>;
  resendOtp: (email: string, type?: 'signup' | 'email_change') => Promise<{ error: AuthError | Error | null }>;
}

function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const rawMsg = (typeof error === 'string' ? error : error?.message || '').trim();
  const lower = rawMsg.toLowerCase();

  if (!isSupabaseConfigured()) {
    return 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower.includes('load failed') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('err_name_not_resolved')
  ) {
    return 'Unable to connect to the authentication server. Please check your internet connection or verify your Supabase environment variables in Vercel.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Your email has not been confirmed yet. Please check your inbox for the confirmation link.';
  }

  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'An account with this email already exists. Please log in instead.';
  }

  if (lower.includes('weak password') || (lower.includes('password') && lower.includes('characters'))) {
    return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
  }

  return rawMsg || 'An error occurred during authentication. Please try again.';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Initialize and listen to persistent Supabase session
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      console.warn('[AuthContext] Supabase is not configured with valid environment variables.');
      setIsLoading(false);
      return;
    }

    async function initializeAuth() {
      try {
        // Retrieve initial session from storage
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Session retrieval notice:', sessionError.message);
        }

        if (initialSession) {
          // Validate token with Supabase Auth server
          const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();

          if (userError) {
            console.warn('Initial session validation error (refreshing token):', userError.message);
            // Refresh session if token was stale or had clock skew
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session && isMounted) {
              setSession(refreshData.session);
              setUser(refreshData.user);
            } else if (isMounted) {
              setSession(null);
              setUser(null);
            }
          } else if (validatedUser && isMounted) {
            setSession(initialSession);
            setUser(validatedUser);
          }
        } else if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Unexpected auth initialization error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return;

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign Up with Email + Password and Full Name metadata
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      const msg = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
      const customError = new Error(msg);
      setAuthError(msg);
      return { user: null, session: null, error: customError };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        const formattedMsg = formatAuthErrorMessage(error);
        setAuthError(formattedMsg);
        return { user: null, session: null, error: new Error(formattedMsg) };
      }

      // Check if user already exists (Supabase returns empty identities array when user already exists & email confirm is on)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        const customError = new Error('An account with this email already exists. Please log in instead.');
        setAuthError(customError.message);
        return { user: null, session: null, error: customError };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      const formattedMsg = formatAuthErrorMessage(err);
      setAuthError(formattedMsg);
      return { user: null, session: null, error: new Error(formattedMsg) };
    }
  }, []);

  // Sign In with Email + Password
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      const msg = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
      const customError = new Error(msg);
      setAuthError(msg);
      return { user: null, session: null, error: customError };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const formattedMsg = formatAuthErrorMessage(error);
        setAuthError(formattedMsg);
        return { user: null, session: null, error: new Error(formattedMsg) };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      const formattedMsg = formatAuthErrorMessage(err);
      setAuthError(formattedMsg);
      return { user: null, session: null, error: new Error(formattedMsg) };
    }
  }, []);

  // Sign Out and clear session
  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  // Password reset email
  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      const msg = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
      const customError = new Error(msg);
      setAuthError(msg);
      return { error: customError };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      });
      if (error) {
        const formattedMsg = formatAuthErrorMessage(error);
        setAuthError(formattedMsg);
        return { error: new Error(formattedMsg) };
      }
      return { error: null };
    } catch (err) {
      const formattedMsg = formatAuthErrorMessage(err);
      setAuthError(formattedMsg);
      return { error: new Error(formattedMsg) };
    }
  }, []);

  // Verify OTP token
  const verifyOtp = useCallback(async (email: string, token: string, type: 'signup' | 'email' | 'recovery' = 'signup') => {
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      const msg = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
      const customError = new Error(msg);
      setAuthError(msg);
      return { session: null, error: customError };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type,
      });
      if (error) {
        const formattedMsg = formatAuthErrorMessage(error);
        setAuthError(formattedMsg);
        return { session: null, error: new Error(formattedMsg) };
      }
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { session: data.session, error: null };
    } catch (err) {
      const formattedMsg = formatAuthErrorMessage(err);
      setAuthError(formattedMsg);
      return { session: null, error: new Error(formattedMsg) };
    }
  }, []);

  // Resend OTP / verification email
  const resendOtp = useCallback(async (email: string, type: 'signup' | 'email_change' = 'signup') => {
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      const msg = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel Project Settings and redeploy.';
      const customError = new Error(msg);
      setAuthError(msg);
      return { error: customError };
    }

    try {
      const { error } = await supabase.auth.resend({
        type,
        email: email.trim(),
      });
      if (error) {
        const formattedMsg = formatAuthErrorMessage(error);
        setAuthError(formattedMsg);
        return { error: new Error(formattedMsg) };
      }
      return { error: null };
    } catch (err: any) {
      const formattedMsg = formatAuthErrorMessage(err);
      setAuthError(formattedMsg);
      return { error: new Error(formattedMsg) };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: Boolean(user && session),
      authError,
      clearError,
      signUp,
      signIn,
      signOut,
      resetPassword,
      verifyOtp,
      resendOtp,
    }),
    [user, session, isLoading, authError, clearError, signUp, signIn, signOut, resetPassword, verifyOtp, resendOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
