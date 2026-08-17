'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

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
        setAuthError(error.message);
        return { user: null, session: null, error };
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
      const errorObj = err instanceof Error ? err : new Error('An unexpected error occurred during sign up');
      setAuthError(errorObj.message);
      return { user: null, session: null, error: errorObj };
    }
  }, []);

  // Sign In with Email + Password
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { user: null, session: null, error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('An unexpected error occurred during log in');
      setAuthError(errorObj.message);
      return { user: null, session: null, error: errorObj };
    }
  }, []);

  // Sign Out and clear session
  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  // Password reset email
  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      });
      if (error) {
        setAuthError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send password reset email');
      setAuthError(errorObj.message);
      return { error: errorObj };
    }
  }, []);

  // Verify OTP token
  const verifyOtp = useCallback(async (email: string, token: string, type: 'signup' | 'email' | 'recovery' = 'signup') => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type,
      });
      if (error) {
        setAuthError(error.message);
        return { session: null, error };
      }
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { session: data.session, error: null };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to verify code');
      setAuthError(errorObj.message);
      return { session: null, error: errorObj };
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
    }),
    [user, session, isLoading, authError, clearError, signUp, signIn, signOut, resetPassword, verifyOtp]
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
