'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { playNotificationAudio, previewNotificationSound, unlockAudio } from '@/lib/audio';
import {
  AccountCard,
  Budget,
  CreateAccountCardPayload,
  CreateNotificationPayload,
  CreateSavingsGoalPayload,
  InAppNotification,
  MonthlyCashflow,
  NotificationSoundId,
  SavingsGoal,
  Transaction,
  UpdateAccountCardPayload,
  UpdateSavingsGoalPayload,
  UserProfile,
} from '@/types/expense';

export interface AddTransactionPayload {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface AddBudgetPayload {
  category: string;
  amount: number;
  month: string;
}

interface ExpenseContextType {
  transactions: Transaction[];
  transactionCount: number;
  budgets: Budget[];
  budgetCount: number;
  savingsGoals: SavingsGoal[];
  savingsGoalCount: number;
  accountsCards: AccountCard[];
  accountsCardsCount: number;
  isLoadingAccountsCards: boolean;
  notifications: InAppNotification[];
  unreadNotificationsCount: number;
  isLoadingNotifications: boolean;
  userProfile: UserProfile;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  isLoadingTransactions: boolean;
  isLoadingBudgets: boolean;
  isLoadingSavingsGoals: boolean;
  categoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
    hex: string;
  }[];
  cashflow: MonthlyCashflow[];
  addTransactionRecord: (payload: AddTransactionPayload) => Promise<{ data: Transaction | null; error: Error | null }>;
  updateTransactionRecord: (id: string, payload: AddTransactionPayload) => Promise<{ data: Transaction | null; error: Error | null }>;
  addExpense: (expenseData: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }) => Promise<{ data: Transaction | null; error: Error | null }>;
  addIncome: (incomeData: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }) => Promise<{ data: Transaction | null; error: Error | null }>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => Promise<{ error: Error | null }>;
  refreshTransactions: () => Promise<void>;
  addBudgetRecord: (payload: AddBudgetPayload) => Promise<{ data: Budget | null; error: Error | null }>;
  updateBudgetRecord: (id: string, payload: AddBudgetPayload) => Promise<{ data: Budget | null; error: Error | null }>;
  deleteBudgetRecord: (id: string) => Promise<{ error: Error | null }>;
  refreshBudgets: () => Promise<void>;
  addSavingsGoalRecord: (payload: CreateSavingsGoalPayload) => Promise<{ data: SavingsGoal | null; error: Error | null }>;
  updateSavingsGoalRecord: (id: string, payload: UpdateSavingsGoalPayload) => Promise<{ data: SavingsGoal | null; error: Error | null }>;
  addMoneyToSavingsGoal: (id: string, amount: number) => Promise<{ data: SavingsGoal | null; error: Error | null }>;
  deleteSavingsGoalRecord: (id: string) => Promise<{ error: Error | null }>;
  refreshSavingsGoals: () => Promise<void>;
  addAccountCardRecord: (payload: CreateAccountCardPayload) => Promise<{ data: AccountCard | null; error: Error | null }>;
  updateAccountCardRecord: (id: string, payload: UpdateAccountCardPayload) => Promise<{ data: AccountCard | null; error: Error | null }>;
  deleteAccountCardRecord: (id: string) => Promise<{ error: Error | null }>;
  refreshAccountsCards: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<{ error: Error | null }>;
  markAllNotificationsAsRead: () => Promise<{ error: Error | null }>;
  deleteNotificationRecord: (id: string) => Promise<{ error: Error | null }>;
  createNotificationRecord: (payload: CreateNotificationPayload) => Promise<{ data: InAppNotification | null; error: Error | null }>;
  checkBudgetNotifications: () => Promise<void>;
  soundEnabled: boolean;
  toggleSoundEnabled: (enabled?: boolean) => void;
  notificationSound: NotificationSoundId;
  setNotificationSound: (soundId: NotificationSoundId) => void;
  previewSound: (soundId: NotificationSoundId) => void;
  playNotificationSound: () => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearAllData: () => void;
  loadSampleData: () => void;
}

const defaultUserProfile: UserProfile = {
  name: 'Aaditi Deshmukh',
  email: 'aaditi.deshmukh@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role: 'Premium Member',
  currency: '₹',
  soundEnabled: true,
  notificationSound: 'notification-1',
};

const categoryColors: Record<string, { color: string; hex: string }> = {
  Food: { color: 'bg-pink-500', hex: '#EC4899' },
  'Food & Dining': { color: 'bg-pink-500', hex: '#EC4899' },
  Shopping: { color: 'bg-purple-500', hex: '#8B5CF6' },
  Transport: { color: 'bg-amber-500', hex: '#F59E0B' },
  Transportation: { color: 'bg-amber-500', hex: '#F59E0B' },
  Bills: { color: 'bg-yellow-500', hex: '#EAB308' },
  Utilities: { color: 'bg-yellow-500', hex: '#EAB308' },
  Entertainment: { color: 'bg-cyan-500', hex: '#06B6D4' },
  Health: { color: 'bg-emerald-500', hex: '#10B981' },
  Healthcare: { color: 'bg-emerald-500', hex: '#10B981' },
  Education: { color: 'bg-blue-500', hex: '#3B82F6' },
  Housing: { color: 'bg-indigo-500', hex: '#6366F1' },
  Salary: { color: 'bg-emerald-600', hex: '#059669' },
  Freelance: { color: 'bg-teal-500', hex: '#14B8A6' },
  Investments: { color: 'bg-violet-600', hex: '#7C3AED' },
  Other: { color: 'bg-slate-500', hex: '#64748B' },
};

function getStoredData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('spendwise_data_v1');
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [accountsCards, setAccountsCards] = useState<AccountCard[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = getStoredData();
    return stored?.userProfile || defaultUserProfile;
  });

  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState<boolean>(false);
  const [isLoadingSavingsGoals, setIsLoadingSavingsGoals] = useState<boolean>(false);
  const [isLoadingAccountsCards, setIsLoadingAccountsCards] = useState<boolean>(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  // In-flight locks to eliminate race conditions and prevent concurrent duplicate notification checks
  const inFlightEvaluationsRef = useRef<Set<string>>(new Set());

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Selected sound preference per user (with strict user isolation in localStorage)
  const currentSoundId = useMemo<NotificationSoundId>(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`spendwise_sound_${user.id}`);
      if (stored && ['notification-1', 'notification-2', 'notification-3', 'notification-4', 'notification-5'].includes(stored)) {
        return stored as NotificationSoundId;
      }
    }
    return userProfile.notificationSound || 'notification-1';
  }, [user, userProfile.notificationSound]);

  const setNotificationSound = useCallback((soundId: NotificationSoundId) => {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`spendwise_sound_${user.id}`, soundId);
    }
    setUserProfile((prev) => ({
      ...prev,
      notificationSound: soundId,
    }));
  }, [user]);

  const previewSound = useCallback((soundId: NotificationSoundId) => {
    previewNotificationSound(soundId).catch(() => {});
  }, []);

  // Notification audio playback trigger using user's selected sound
  const triggerNotificationSound = useCallback(() => {
    const isSoundActive = userProfile.soundEnabled !== false;
    if (isSoundActive) {
      playNotificationAudio(currentSoundId, true).catch(() => {});
    }
  }, [userProfile.soundEnabled, currentSoundId]);

  // Prime browser audio context on first user interaction to bypass autoplay restrictions
  useEffect(() => {
    const handleUserInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Realtime subscription for incoming notifications belonging to the authenticated user
  useEffect(() => {
    if (!user || !user.id) return;

    const channelName = `realtime-notifications-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row || !row.id || row.user_id !== user.id) return;

          const newNotif: InAppNotification = {
            id: row.id,
            user_id: row.user_id,
            type: row.type || 'info',
            title: row.title,
            message: row.message,
            read: Boolean(row.read),
            created_at: row.created_at,
            related_id: row.related_id || null,
            related_type: row.related_type || null,
          };

          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) {
              return prev;
            }
            triggerNotificationSound();
            return [newNotif, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, triggerNotificationSound]);

  // Dynamically compute user profile using authenticated Supabase user
  const effectiveUserProfile = useMemo<UserProfile>(() => {
    if (!user) return userProfile;
    const name = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : userProfile.name);
    const email = user.email || userProfile.email;
    return {
      ...userProfile,
      name: name || userProfile.name,
      email: email || userProfile.email,
    };
  }, [user, userProfile]);

  // Helper to execute Supabase query with automatic recovery on JWT clock-skew or expiration errors
  const executeWithAuthRetry = useCallback(
    async (
      queryFn: () => PromiseLike<any>
    ): Promise<{ data: any; error: any }> => {
      let result: any = await queryFn();

      // Check if PostgREST rejected the request due to JWT timestamp / clock skew / expired token error
      if (
        result?.error &&
        (result.error.message?.toLowerCase().includes('jwt') ||
          result.error.message?.toLowerCase().includes('future') ||
          result.error.message?.toLowerCase().includes('expired') ||
          result.error.message?.toLowerCase().includes('token') ||
          result.error.code === 'PGRST301')
      ) {
        console.warn('Auth token / JWT error detected in query. Refreshing session...', result.error.message);
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshData.session) {
            console.info('Supabase session refreshed successfully. Retrying query...');
            result = await queryFn();
          } else {
            console.error('Failed to refresh Supabase session:', refreshError?.message);
          }
        } catch (refreshErr) {
          console.error('Unexpected error during session refresh:', refreshErr);
        }
      }

      return {
        data: result?.data ?? null,
        error: result?.error ?? null,
      };
    },
    []
  );

  // Fetch transactions from Supabase for authenticated user
  const fetchTransactions = useCallback(async () => {
    if (!user || !user.id) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const { data, error } = await executeWithAuthRetry(() =>
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching Supabase transactions:', error.message);
      } else if (data) {
        const formatted: Transaction[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          type: row.type,
          amount: parseFloat(row.amount),
          category: row.category,
          description: row.description || '',
          date: row.date,
          created_at: row.created_at,
          updated_at: row.updated_at,
          title: row.description || row.category,
          paymentMethod: 'Cloud Sync',
          status: 'completed',
        }));
        setTransactions(formatted);
      }
    } catch (err) {
      console.error('Unexpected error loading transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user, executeWithAuthRetry]);

  // Fetch budgets from Supabase for authenticated user
  const fetchBudgets = useCallback(async () => {
    if (!user || !user.id) {
      setBudgets([]);
      setIsLoadingBudgets(false);
      return;
    }

    setIsLoadingBudgets(true);
    try {
      const { data, error } = await executeWithAuthRetry(() =>
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: false })
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching Supabase budgets:', error.message);
      } else if (data) {
        const formatted: Budget[] = data.map((row: any) => {
          const numAmount = parseFloat(row.amount);
          return {
            id: row.id,
            user_id: row.user_id,
            category: row.category,
            amount: numAmount,
            month: row.month,
            created_at: row.created_at,
            updated_at: row.updated_at,
            allocated: numAmount,
            spent: 0,
          };
        });
        setBudgets(formatted);
      }
    } catch (err) {
      console.error('Unexpected error loading budgets:', err);
    } finally {
      setIsLoadingBudgets(false);
    }
  }, [user, executeWithAuthRetry]);

  // Fetch savings goals from Supabase for authenticated user
  const fetchSavingsGoals = useCallback(async () => {
    if (!user || !user.id) {
      setSavingsGoals([]);
      setIsLoadingSavingsGoals(false);
      return;
    }

    setIsLoadingSavingsGoals(true);
    try {
      const { data, error } = await executeWithAuthRetry(() =>
        supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching Supabase savings goals:', error.message);
      } else if (data) {
        const formatted: SavingsGoal[] = data.map((row: any) => {
          const targetAmt = parseFloat(row.target_amount) || 0;
          const savedAmt = parseFloat(row.saved_amount ?? row.current_amount ?? 0);
          const goalName = row.name || row.title || 'Savings Goal';
          return {
            id: row.id,
            user_id: row.user_id,
            name: goalName,
            title: goalName,
            target_amount: targetAmt,
            targetAmount: targetAmt,
            saved_amount: savedAmt,
            current_amount: savedAmt,
            currentAmount: savedAmt,
            target_date: row.target_date,
            targetDate: row.target_date || '',
            completed: targetAmt > 0 && savedAmt >= targetAmt,
            category: row.category || 'General',
            icon: row.category || 'Target',
            color: 'indigo',
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });
        setSavingsGoals(formatted);
      }
    } catch (err) {
      console.error('Unexpected error loading savings goals:', err);
    } finally {
      setIsLoadingSavingsGoals(false);
    }
  }, [user, executeWithAuthRetry]);

  // Fetch accounts/cards from Supabase for authenticated user
  const fetchAccountsCards = useCallback(async () => {
    if (!user || !user.id) {
      setAccountsCards([]);
      setIsLoadingAccountsCards(false);
      return;
    }

    setIsLoadingAccountsCards(true);
    try {
      const { data, error } = await executeWithAuthRetry(() =>
        supabase
          .from('accounts_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching Supabase accounts/cards:', error.message);
      } else if (data) {
        const formatted: AccountCard[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          name: row.name,
          type: row.type,
          balance: parseFloat(row.balance) || 0,
          currency: row.currency || 'INR',
          account_number_last4: row.account_number_last4 || null,
          color: row.color || 'indigo',
          icon: row.icon || 'bank',
          is_default: Boolean(row.is_default),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setAccountsCards(formatted);
      }
    } catch (err) {
      console.error('Unexpected error loading accounts/cards:', err);
    } finally {
      setIsLoadingAccountsCards(false);
    }
  }, [user, executeWithAuthRetry]);

  // Fetch notifications from Supabase for authenticated user
  const fetchNotifications = useCallback(async () => {
    if (!user || !user.id) {
      setNotifications([]);
      setIsLoadingNotifications(false);
      return;
    }

    setIsLoadingNotifications(true);
    try {
      const { data, error } = await executeWithAuthRetry(() =>
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching Supabase notifications:', error.message);
      } else if (data) {
        const formatted: InAppNotification[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          type: row.type || 'info',
          title: row.title,
          message: row.message,
          read: Boolean(row.read),
          created_at: row.created_at,
          related_id: row.related_id || null,
          related_type: row.related_type || null,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Unexpected error loading notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user, executeWithAuthRetry]);

  // Automatic Budget Spending Notification Evaluation Engine (Feature 1, 2, 3, 4, 5, 7)
  const evaluateBudgetSpendingNotifications = useCallback(
    async (
      targetBudgets?: Budget[],
      targetTransactions?: Transaction[]
    ) => {
      if (!user || !user.id) return;

      const currentBudgets = targetBudgets ?? budgets;
      const currentTransactions = targetTransactions ?? transactions;

      if (!currentBudgets || currentBudgets.length === 0) return;

      // Filter budgets strictly to the authenticated user (Feature 4 - Strict User Isolation)
      const userBudgets = currentBudgets.filter(
        (b) => !b.user_id || b.user_id === user.id
      );

      for (const budget of userBudgets) {
        if (!budget.id || !budget.category || budget.amount <= 0) continue;

        // Extract budget month prefix (YYYY-MM)
        const budgetMonthPrefix = budget.month ? budget.month.substring(0, 7) : '';

        // Calculate total spending for this budget category and month for the current user
        const spent = currentTransactions
          .filter(
            (tx) =>
              tx.type === 'expense' &&
              tx.category.toLowerCase() === budget.category.toLowerCase() &&
              (!budgetMonthPrefix || tx.date.startsWith(budgetMonthPrefix)) &&
              (!tx.user_id || tx.user_id === user.id)
          )
          .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        let targetType: 'budget_exceeded' | 'budget_warning' | null = null;
        let title = '';
        let message = '';

        // Feature 1: Over-budget condition (spending > budget limit)
        if (spent > budget.amount) {
          targetType = 'budget_exceeded';
          const diff = spent - budget.amount;
          const formattedDiff = Math.round(diff).toLocaleString('en-IN');
          title = 'Budget exceeded';
          message = `Your ${budget.category} budget has been exceeded by ₹${formattedDiff}.`;
        }
        // Feature 2: Almost-at-limit condition (80% <= spending <= 100%)
        else if (spent >= budget.amount * 0.8) {
          targetType = 'budget_warning';
          title = 'Budget almost reached';
          message = `Your ${budget.category} budget is almost at its limit.`;
        }

        // Feature 5 (< 80% spending -> no notification)
        if (!targetType) {
          continue;
        }

        const dedupeKey = `${user.id}:${budget.id}:${targetType}`;

        // Feature 3: In-flight deduplication guard to eliminate race conditions
        if (inFlightEvaluationsRef.current.has(dedupeKey)) {
          continue;
        }

        // Feature 3: Check in-memory notifications state first (read or unread)
        const existsInMemory = notifications.some(
          (n) =>
            n.related_id === budget.id &&
            n.type === targetType &&
            (!n.user_id || n.user_id === user.id)
        );

        if (existsInMemory) {
          continue;
        }

        // Acquire in-flight lock for this budget and condition
        inFlightEvaluationsRef.current.add(dedupeKey);

        try {
          // Feature 3 & 4: Check if an existing notification already exists in Supabase for this user & budget
          const { data: existingRecords, error: checkError } = await executeWithAuthRetry(() =>
            supabase
              .from('notifications')
              .select('id')
              .eq('user_id', user.id)
              .eq('related_id', budget.id)
              .eq('type', targetType)
              .limit(1)
          );

          if (checkError) {
            console.error('Error checking existing budget notification in Supabase:', checkError.message);
            continue;
          }

          if (existingRecords && existingRecords.length > 0) {
            // Already created previously - prevent duplicate insertion
            continue;
          }

          // Feature 1, 2, 4: Insert notification into Supabase for authenticated user
          const { data: insertedData, error: insertError } = await executeWithAuthRetry(() =>
            supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: targetType,
                title,
                message,
                read: false,
                related_id: budget.id,
                related_type: 'budget',
              })
              .select()
              .single()
          );

          if (insertError) {
            console.error('Failed to create budget notification in Supabase:', insertError.message);
            continue;
          }

          if (insertedData) {
            const newNotif: InAppNotification = {
              id: insertedData.id,
              user_id: insertedData.user_id,
              type: insertedData.type,
              title: insertedData.title,
              message: insertedData.message,
              read: Boolean(insertedData.read),
              created_at: insertedData.created_at,
              related_id: insertedData.related_id || budget.id,
              related_type: insertedData.related_type || 'budget',
            };

            // Atomically add to state avoiding duplicate entries and play sound for genuinely new notification
            setNotifications((prev) => {
              if (
                prev.some(
                  (n) =>
                    n.id === newNotif.id ||
                    (n.related_id === budget.id && n.type === targetType)
                )
              ) {
                return prev;
              }
              triggerNotificationSound();
              return [newNotif, ...prev];
            });
          }
        } catch (err) {
          // Feature 7: Resilient Error Handling - log technical error without crashing UI
          console.error('Unexpected error evaluating budget notification:', err);
        } finally {
          // Release in-flight lock after safety window
          setTimeout(() => {
            inFlightEvaluationsRef.current.delete(dedupeKey);
          }, 1500);
        }
      }
    },
    [user, budgets, transactions, notifications, executeWithAuthRetry, triggerNotificationSound]
  );

  // Automatically trigger budget evaluation on initial load or data updates (Feature 5)
  useEffect(() => {
    if (!user || !user.id || budgets.length === 0 || isLoadingBudgets || isLoadingTransactions) {
      return;
    }
    const timer = setTimeout(() => {
      evaluateBudgetSpendingNotifications(budgets, transactions);
    }, 200);
    return () => clearTimeout(timer);
  }, [budgets, transactions, user, isLoadingBudgets, isLoadingTransactions, evaluateBudgetSpendingNotifications]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]);

  useEffect(() => {
    fetchAccountsCards();
  }, [fetchAccountsCards]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Persist preferences (excluding budgets, transactions, and savings goals) to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        userProfile,
      };
      localStorage.setItem('spendwise_data_v1', JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to persist data', e);
    }
  }, [userProfile]);

  // Purely dynamic calculations from transactions list
  const totalIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [transactions]);

  // Total Balance = Total Income - Total Expenses
  const totalBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Monthly metrics for the active calendar month
  const currentYearMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentYearMonth))
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [transactions, currentYearMonth]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentYearMonth))
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [transactions, currentYearMonth]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome > 0) {
      return Math.max(0, Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100));
    }
    if (totalIncome > 0) {
      return Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100));
    }
    return 0;
  }, [monthlyIncome, monthlyExpenses, totalIncome, totalExpenses]);

  // Compute category breakdown from expense transactions
  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');
    const totalExpenseSum = expenseTransactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const categoryTotals: Record<string, number> = {};
    expenseTransactions.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + (Number(tx.amount) || 0);
    });

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => {
        const meta = categoryColors[name] || categoryColors.Other;
        const percentage =
          totalExpenseSum > 0 ? parseFloat(((amount / totalExpenseSum) * 100).toFixed(1)) : 0;
        return {
          name,
          amount,
          percentage,
          color: meta.color,
          hex: meta.hex,
        };
      });
  }, [transactions]);

  // Compute 6-month cashflow dynamically
  const cashflow: MonthlyCashflow[] = useMemo(() => {
    const dNow = new Date();
    const mList: string[] = [];
    const prefixList: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dNow.getFullYear(), dNow.getMonth() - i, 1);
      mList.push(d.toLocaleString('default', { month: 'short' }));
      prefixList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    return mList.map((month, idx) => {
      const prefix = prefixList[idx];
      const inc = transactions
        .filter((tx) => tx.type === 'income' && tx.date.startsWith(prefix))
        .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
      const exp = transactions
        .filter((tx) => tx.type === 'expense' && tx.date.startsWith(prefix))
        .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

      return {
        month,
        income: inc,
        expense: exp,
      };
    });
  }, [transactions]);

  // Add Transaction Record (Unified for Income & Expense to Supabase)
  const addTransactionRecord = useCallback(
    async (payload: AddTransactionPayload): Promise<{ data: Transaction | null; error: Error | null }> => {
      if (!user || !user.id) {
        const error = new Error('You must be logged in to record a transaction.');
        return { data: null, error };
      }

      const numAmount = parseFloat(String(payload.amount));
      if (isNaN(numAmount) || numAmount <= 0) {
        const error = new Error('Amount is required and must be greater than 0.');
        return { data: null, error };
      }

      if (!payload.category || !payload.category.trim()) {
        const error = new Error('Category is required.');
        return { data: null, error };
      }

      if (!payload.date || !payload.date.trim()) {
        const error = new Error('Date is required.');
        return { data: null, error };
      }

      const txType = payload.type === 'income' ? 'income' : 'expense';

      try {
        const insertPayload = {
          user_id: user.id,
          type: txType,
          amount: numAmount,
          category: payload.category.trim(),
          description: payload.description?.trim() || null,
          date: payload.date.trim(),
        };

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('transactions')
            .insert(insertPayload)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase transaction insert error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Failed to insert transaction into Supabase.') };
        }

        const newTx: Transaction = {
          id: data.id,
          user_id: data.user_id,
          type: data.type,
          amount: parseFloat(data.amount),
          category: data.category,
          description: data.description || '',
          date: data.date,
          created_at: data.created_at,
          updated_at: data.updated_at,
          title: data.description || data.category,
          paymentMethod: 'Cloud Sync',
          status: 'completed',
        };

        setTransactions((prev) => [newTx, ...prev]);

        // Evaluate budget spending notifications proactively when an expense is added
        if (txType === 'expense') {
          setTimeout(() => {
            evaluateBudgetSpendingNotifications(budgets, [newTx, ...transactions]);
          }, 50);
        }

        return { data: newTx, error: null };
      } catch (err) {
        console.error('Unexpected error inserting transaction:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while saving transaction.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry, budgets, transactions, evaluateBudgetSpendingNotifications]
  );

  // Update Transaction Record (Supabase)
  const updateTransactionRecord = useCallback(
    async (
      id: string,
      payload: AddTransactionPayload
    ): Promise<{ data: Transaction | null; error: Error | null }> => {
      if (!user || !user.id) {
        const error = new Error('You must be logged in to update a transaction.');
        return { data: null, error };
      }

      const numAmount = parseFloat(String(payload.amount));
      if (isNaN(numAmount) || numAmount <= 0) {
        const error = new Error('Amount is required and must be greater than 0.');
        return { data: null, error };
      }

      if (!payload.category || !payload.category.trim()) {
        const error = new Error('Category is required.');
        return { data: null, error };
      }

      if (!payload.date || !payload.date.trim()) {
        const error = new Error('Date is required.');
        return { data: null, error };
      }

      const txType = payload.type === 'income' ? 'income' : 'expense';

      try {
        const updatePayload = {
          type: txType,
          amount: numAmount,
          category: payload.category.trim(),
          description: payload.description?.trim() || null,
          date: payload.date.trim(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('transactions')
            .update(updatePayload)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase transaction update error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Transaction not found or unauthorized.') };
        }

        const updatedTx: Transaction = {
          id: data.id,
          user_id: data.user_id,
          type: data.type,
          amount: parseFloat(data.amount),
          category: data.category,
          description: data.description || '',
          date: data.date,
          created_at: data.created_at,
          updated_at: data.updated_at,
          title: data.description || data.category,
          paymentMethod: 'Cloud Sync',
          status: 'completed',
        };

        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? updatedTx : tx))
        );

        // Evaluate budget spending notifications when a transaction is updated
        setTimeout(() => {
          const nextTransactions = transactions.map((tx) => (tx.id === id ? updatedTx : tx));
          evaluateBudgetSpendingNotifications(budgets, nextTransactions);
        }, 50);

        return { data: updatedTx, error: null };
      } catch (err) {
        console.error('Unexpected error updating transaction:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while updating transaction.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry, budgets, transactions, evaluateBudgetSpendingNotifications]
  );

  const addExpense = useCallback(
    (expenseData: { amount: number; category: string; description?: string; date: string }) => {
      return addTransactionRecord({ ...expenseData, type: 'expense' });
    },
    [addTransactionRecord]
  );

  const addIncome = useCallback(
    (incomeData: { amount: number; category: string; description?: string; date: string }) => {
      return addTransactionRecord({ ...incomeData, type: 'income' });
    },
    [addTransactionRecord]
  );

  // Local fallback action methods
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = async (id: string): Promise<{ error: Error | null }> => {
    if (!user || !user.id) {
      return { error: new Error('You must be logged in to delete a transaction.') };
    }
    try {
      const { error } = await executeWithAuthRetry(() =>
        supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
      );

      if (error) {
        console.error('Failed to delete transaction from Supabase', error.message);
        return { error: new Error(error.message) };
      }

      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      return { error: null };
    } catch (e) {
      console.error('Failed to delete transaction from Supabase', e);
      const error = e instanceof Error ? e : new Error('Failed to delete transaction.');
      return { error };
    }
  };

  // Add Budget Record (Supabase)
  const addBudgetRecord = useCallback(
    async (payload: AddBudgetPayload): Promise<{ data: Budget | null; error: Error | null }> => {
      if (!user || !user.id) {
        const error = new Error('You must be logged in to create a budget.');
        return { data: null, error };
      }

      const numAmount = parseFloat(String(payload.amount));
      if (isNaN(numAmount) || numAmount <= 0) {
        const error = new Error('Budget amount must be a valid number greater than 0.');
        return { data: null, error };
      }

      if (!payload.category || !payload.category.trim()) {
        const error = new Error('Category is required.');
        return { data: null, error };
      }

      if (!payload.month || !payload.month.trim()) {
        const error = new Error('Month is required.');
        return { data: null, error };
      }

      // Format month as YYYY-MM-01 if YYYY-MM provided
      let normalizedMonth = payload.month.trim();
      if (/^\d{4}-\d{2}$/.test(normalizedMonth)) {
        normalizedMonth = `${normalizedMonth}-01`;
      }

      // Check client-side duplicate
      const monthPrefix = normalizedMonth.substring(0, 7);
      const isDuplicate = budgets.some(
        (b) =>
          b.category.toLowerCase() === payload.category.trim().toLowerCase() &&
          (b.month === normalizedMonth || b.month.startsWith(monthPrefix))
      );

      if (isDuplicate) {
        const error = new Error(`A budget for ${payload.category.trim()} already exists for this month. Please edit the existing budget.`);
        return { data: null, error };
      }

      try {
        const insertPayload = {
          user_id: user.id,
          category: payload.category.trim(),
          amount: numAmount,
          month: normalizedMonth,
        };

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('budgets')
            .insert(insertPayload)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase budget insert error:', error.message);
          if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
            return {
              data: null,
              error: new Error(`A budget for ${payload.category.trim()} already exists for this month.`),
            };
          }
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Failed to create budget in Supabase.') };
        }

        const newBudget: Budget = {
          id: data.id,
          user_id: data.user_id,
          category: data.category,
          amount: parseFloat(data.amount),
          month: data.month,
          created_at: data.created_at,
          updated_at: data.updated_at,
          allocated: parseFloat(data.amount),
          spent: 0,
        };

        setBudgets((prev) => [newBudget, ...prev]);

        // Evaluate budget spending notifications proactively when a budget is added
        setTimeout(() => {
          evaluateBudgetSpendingNotifications([newBudget, ...budgets], transactions);
        }, 50);

        return { data: newBudget, error: null };
      } catch (err) {
        console.error('Unexpected error inserting budget:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while saving budget.');
        return { data: null, error };
      }
    },
    [user, budgets, transactions, executeWithAuthRetry, evaluateBudgetSpendingNotifications]
  );

  // Update Budget Record (Supabase)
  const updateBudgetRecord = useCallback(
    async (
      id: string,
      payload: AddBudgetPayload
    ): Promise<{ data: Budget | null; error: Error | null }> => {
      if (!user || !user.id) {
        const error = new Error('You must be logged in to update a budget.');
        return { data: null, error };
      }

      const numAmount = parseFloat(String(payload.amount));
      if (isNaN(numAmount) || numAmount <= 0) {
        const error = new Error('Budget amount must be a valid number greater than 0.');
        return { data: null, error };
      }

      if (!payload.category || !payload.category.trim()) {
        const error = new Error('Category is required.');
        return { data: null, error };
      }

      if (!payload.month || !payload.month.trim()) {
        const error = new Error('Month is required.');
        return { data: null, error };
      }

      let normalizedMonth = payload.month.trim();
      if (/^\d{4}-\d{2}$/.test(normalizedMonth)) {
        normalizedMonth = `${normalizedMonth}-01`;
      }

      const monthPrefix = normalizedMonth.substring(0, 7);
      const isDuplicate = budgets.some(
        (b) =>
          b.id !== id &&
          b.category.toLowerCase() === payload.category.trim().toLowerCase() &&
          (b.month === normalizedMonth || b.month.startsWith(monthPrefix))
      );

      if (isDuplicate) {
        const error = new Error(`Another budget for ${payload.category.trim()} already exists for this month.`);
        return { data: null, error };
      }

      try {
        const updatePayload = {
          category: payload.category.trim(),
          amount: numAmount,
          month: normalizedMonth,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('budgets')
            .update(updatePayload)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase budget update error:', error.message);
          if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
            return {
              data: null,
              error: new Error(`A budget for ${payload.category.trim()} already exists for this month.`),
            };
          }
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Budget not found or unauthorized.') };
        }

        const updatedBudget: Budget = {
          id: data.id,
          user_id: data.user_id,
          category: data.category,
          amount: parseFloat(data.amount),
          month: data.month,
          created_at: data.created_at,
          updated_at: data.updated_at,
          allocated: parseFloat(data.amount),
          spent: 0,
        };

        setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)));

        // Evaluate budget spending notifications when a budget is updated
        setTimeout(() => {
          const nextBudgets = budgets.map((b) => (b.id === id ? updatedBudget : b));
          evaluateBudgetSpendingNotifications(nextBudgets, transactions);
        }, 50);

        return { data: updatedBudget, error: null };
      } catch (err) {
        console.error('Unexpected error updating budget:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while updating budget.');
        return { data: null, error };
      }
    },
    [user, budgets, transactions, executeWithAuthRetry, evaluateBudgetSpendingNotifications]
  );

  // Delete Budget Record (Supabase)
  const deleteBudgetRecord = async (id: string): Promise<{ error: Error | null }> => {
    if (!user || !user.id) {
      return { error: new Error('You must be logged in to delete a budget.') };
    }
    try {
      const { error } = await executeWithAuthRetry(() =>
        supabase
          .from('budgets')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
      );

      if (error) {
        console.error('Failed to delete budget from Supabase', error.message);
        return { error: new Error(error.message) };
      }

      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    } catch (e) {
      console.error('Failed to delete budget from Supabase', e);
      const error = e instanceof Error ? e : new Error('Failed to delete budget.');
      return { error };
    }
  };

  // Add Savings Goal Record (Supabase)
  const addSavingsGoalRecord = useCallback(
    async (
      payload: CreateSavingsGoalPayload
    ): Promise<{ data: SavingsGoal | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to create a savings goal.') };
      }

      const goalName = (payload.name || payload.title || '').trim();
      if (!goalName) {
        return { data: null, error: new Error('Goal name is required.') };
      }

      const numTarget = Number(payload.target_amount ?? payload.targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        return { data: null, error: new Error('Target amount must be greater than 0.') };
      }

      const numSaved = Number(payload.saved_amount ?? payload.current_amount ?? payload.currentAmount ?? 0);
      if (isNaN(numSaved) || numSaved < 0) {
        return { data: null, error: new Error('Saved amount cannot be negative.') };
      }

      if (numSaved > numTarget) {
        return { data: null, error: new Error('Saved amount cannot be greater than target amount.') };
      }

      const targetDate = payload.target_date || payload.targetDate || null;

      try {
        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('savings_goals')
            .insert({
              user_id: user.id,
              name: goalName,
              target_amount: numTarget,
              saved_amount: numSaved,
              target_date: targetDate ? targetDate : null,
              category: payload.category || 'General',
            })
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase savings_goals insert error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Failed to create savings goal.') };
        }

        const targetAmt = parseFloat(data.target_amount) || 0;
        const savedAmt = parseFloat(data.saved_amount ?? data.current_amount ?? 0);
        const resName = data.name || data.title || goalName;

        const formatted: SavingsGoal = {
          id: data.id,
          user_id: data.user_id,
          name: resName,
          title: resName,
          target_amount: targetAmt,
          targetAmount: targetAmt,
          saved_amount: savedAmt,
          current_amount: savedAmt,
          currentAmount: savedAmt,
          target_date: data.target_date,
          targetDate: data.target_date || '',
          completed: targetAmt > 0 && savedAmt >= targetAmt,
          category: data.category || payload.category || 'General',
          icon: data.category || payload.category || 'Target',
          color: 'indigo',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setSavingsGoals((prev) => [formatted, ...prev]);
        return { data: formatted, error: null };
      } catch (e) {
        console.error('Unexpected error inserting savings goal:', e);
        const error = e instanceof Error ? e : new Error('Failed to create savings goal.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Update Savings Goal Record (Supabase)
  const updateSavingsGoalRecord = useCallback(
    async (
      id: string,
      payload: UpdateSavingsGoalPayload
    ): Promise<{ data: SavingsGoal | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to update a savings goal.') };
      }

      const goalName = (payload.name || payload.title || '').trim();
      if (!goalName) {
        return { data: null, error: new Error('Goal name is required.') };
      }

      const numTarget = Number(payload.target_amount ?? payload.targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        return { data: null, error: new Error('Target amount must be greater than 0.') };
      }

      const numSaved = Number(payload.saved_amount ?? payload.current_amount ?? payload.currentAmount ?? 0);
      if (isNaN(numSaved) || numSaved < 0) {
        return { data: null, error: new Error('Saved amount cannot be negative.') };
      }

      if (numSaved > numTarget) {
        return { data: null, error: new Error('Saved amount cannot be greater than target amount.') };
      }

      const targetDate = payload.target_date || payload.targetDate || null;

      try {
        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('savings_goals')
            .update({
              name: goalName,
              target_amount: numTarget,
              saved_amount: numSaved,
              target_date: targetDate ? targetDate : null,
              category: payload.category || 'General',
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        );

        if (error) {
          console.error('Failed to update savings goal in Supabase', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Savings goal not found.') };
        }

        const targetAmt = parseFloat(data.target_amount) || 0;
        const savedAmt = parseFloat(data.saved_amount ?? data.current_amount ?? 0);
        const resName = data.name || data.title || goalName;

        const formatted: SavingsGoal = {
          id: data.id,
          user_id: data.user_id,
          name: resName,
          title: resName,
          target_amount: targetAmt,
          targetAmount: targetAmt,
          saved_amount: savedAmt,
          current_amount: savedAmt,
          currentAmount: savedAmt,
          target_date: data.target_date,
          targetDate: data.target_date || '',
          completed: targetAmt > 0 && savedAmt >= targetAmt,
          category: data.category || payload.category || 'General',
          icon: data.category || payload.category || 'Target',
          color: 'indigo',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setSavingsGoals((prev) => prev.map((g) => (g.id === id ? formatted : g)));
        return { data: formatted, error: null };
      } catch (e) {
        console.error('Failed to update savings goal', e);
        const error = e instanceof Error ? e : new Error('Failed to update savings goal.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Add Money to Savings Goal (Supabase)
  const addMoneyToSavingsGoal = useCallback(
    async (
      id: string,
      amount: number
    ): Promise<{ data: SavingsGoal | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to deposit money.') };
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return { data: null, error: new Error('Deposit amount must be greater than 0.') };
      }

      const currentGoal = savingsGoals.find((g) => g.id === id);
      if (!currentGoal) {
        return { data: null, error: new Error('Savings goal not found.') };
      }

      const currentSaved = Number(currentGoal.saved_amount ?? currentGoal.current_amount ?? currentGoal.currentAmount ?? 0);
      const targetAmt = Number(currentGoal.target_amount ?? currentGoal.targetAmount ?? 0);
      const newSavedAmount = Math.min(targetAmt, Math.max(0, currentSaved + numAmount));

      try {
        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('savings_goals')
            .update({
              saved_amount: newSavedAmount,
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        );

        if (error) {
          console.error('Failed to add money to savings goal in Supabase', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Savings goal not found.') };
        }

        const finalTarget = parseFloat(data.target_amount) || 0;
        const finalSaved = parseFloat(data.saved_amount ?? data.current_amount ?? 0);
        const resName = data.name || data.title || currentGoal.name;

        const formatted: SavingsGoal = {
          id: data.id,
          user_id: data.user_id,
          name: resName,
          title: resName,
          target_amount: finalTarget,
          targetAmount: finalTarget,
          saved_amount: finalSaved,
          current_amount: finalSaved,
          currentAmount: finalSaved,
          target_date: data.target_date,
          targetDate: data.target_date || '',
          completed: finalTarget > 0 && finalSaved >= finalTarget,
          category: data.category || currentGoal.category || 'General',
          icon: data.category || currentGoal.category || 'Target',
          color: 'indigo',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setSavingsGoals((prev) => prev.map((g) => (g.id === id ? formatted : g)));
        return { data: formatted, error: null };
      } catch (e) {
        console.error('Failed to add money to savings goal', e);
        const error = e instanceof Error ? e : new Error('Failed to add money to savings goal.');
        return { data: null, error };
      }
    },
    [user, savingsGoals, executeWithAuthRetry]
  );

  // Delete Savings Goal Record (Supabase)
  const deleteSavingsGoalRecord = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      if (!user || !user.id) {
        return { error: new Error('You must be logged in to delete a savings goal.') };
      }
      try {
        const { error } = await executeWithAuthRetry(() =>
          supabase
            .from('savings_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        );

        if (error) {
          console.error('Failed to delete savings goal from Supabase', error.message);
          return { error: new Error(error.message) };
        }

        setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
        return { error: null };
      } catch (e) {
        console.error('Failed to delete savings goal from Supabase', e);
        const error = e instanceof Error ? e : new Error('Failed to delete savings goal.');
        return { error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Add Account/Card Record (Supabase)
  const addAccountCardRecord = useCallback(
    async (payload: CreateAccountCardPayload): Promise<{ data: AccountCard | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to create an account or card.') };
      }

      const accountName = (payload.name || '').trim();
      if (!accountName) {
        return { data: null, error: new Error('Account name is required.') };
      }

      const numBalance = typeof payload.balance === 'number' && !isNaN(payload.balance) ? payload.balance : parseFloat(String(payload.balance || 0)) || 0;
      const accountType = payload.type || 'bank';
      const currency = (payload.currency || 'INR').trim();
      const last4 = payload.account_number_last4 ? payload.account_number_last4.trim().slice(-4) : null;
      const isDefault = Boolean(payload.is_default);

      try {
        if (isDefault) {
          await executeWithAuthRetry(() =>
            supabase
              .from('accounts_cards')
              .update({ is_default: false })
              .eq('user_id', user.id)
          );
        }

        const insertPayload = {
          user_id: user.id,
          name: accountName,
          type: accountType,
          balance: numBalance,
          currency: currency,
          account_number_last4: last4,
          color: payload.color || 'indigo',
          icon: payload.icon || 'bank',
          is_default: isDefault,
        };

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('accounts_cards')
            .insert(insertPayload)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase accounts_cards insert error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Failed to create account/card in Supabase.') };
        }

        const newAccount: AccountCard = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          type: data.type,
          balance: parseFloat(data.balance) || 0,
          currency: data.currency || 'INR',
          account_number_last4: data.account_number_last4 || null,
          color: data.color || 'indigo',
          icon: data.icon || 'bank',
          is_default: Boolean(data.is_default),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setAccountsCards((prev) => {
          const updatedPrev = isDefault ? prev.map((a) => ({ ...a, is_default: false })) : prev;
          return [newAccount, ...updatedPrev];
        });

        return { data: newAccount, error: null };
      } catch (err) {
        console.error('Unexpected error inserting account/card:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while saving account/card.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Update Account/Card Record (Supabase)
  const updateAccountCardRecord = useCallback(
    async (
      id: string,
      payload: UpdateAccountCardPayload
    ): Promise<{ data: AccountCard | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to update an account or card.') };
      }

      const accountName = payload.name !== undefined ? payload.name.trim() : undefined;
      if (accountName !== undefined && !accountName) {
        return { data: null, error: new Error('Account name cannot be empty.') };
      }

      const numBalance = payload.balance !== undefined ? (typeof payload.balance === 'number' && !isNaN(payload.balance) ? payload.balance : parseFloat(String(payload.balance)) || 0) : undefined;
      const last4 = payload.account_number_last4 !== undefined ? (payload.account_number_last4 ? payload.account_number_last4.trim().slice(-4) : null) : undefined;
      const isDefault = payload.is_default;

      try {
        if (isDefault) {
          await executeWithAuthRetry(() =>
            supabase
              .from('accounts_cards')
              .update({ is_default: false })
              .eq('user_id', user.id)
          );
        }

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (accountName !== undefined) updatePayload.name = accountName;
        if (payload.type !== undefined) updatePayload.type = payload.type;
        if (numBalance !== undefined) updatePayload.balance = numBalance;
        if (payload.currency !== undefined) updatePayload.currency = payload.currency.trim();
        if (last4 !== undefined) updatePayload.account_number_last4 = last4;
        if (payload.color !== undefined) updatePayload.color = payload.color;
        if (payload.icon !== undefined) updatePayload.icon = payload.icon;
        if (isDefault !== undefined) updatePayload.is_default = isDefault;

        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('accounts_cards')
            .update(updatePayload)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase accounts_cards update error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Account/card not found or unauthorized.') };
        }

        const updatedAccount: AccountCard = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          type: data.type,
          balance: parseFloat(data.balance) || 0,
          currency: data.currency || 'INR',
          account_number_last4: data.account_number_last4 || null,
          color: data.color || 'indigo',
          icon: data.icon || 'bank',
          is_default: Boolean(data.is_default),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setAccountsCards((prev) =>
          prev.map((a) => {
            if (a.id === id) return updatedAccount;
            if (isDefault) return { ...a, is_default: false };
            return a;
          })
        );

        return { data: updatedAccount, error: null };
      } catch (err) {
        console.error('Unexpected error updating account/card:', err);
        const error = err instanceof Error ? err : new Error('An unexpected error occurred while updating account/card.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Delete Account/Card Record (Supabase)
  const deleteAccountCardRecord = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      if (!user || !user.id) {
        return { error: new Error('You must be logged in to delete an account or card.') };
      }

      try {
        const { error } = await executeWithAuthRetry(() =>
          supabase
            .from('accounts_cards')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        );

        if (error) {
          console.error('Failed to delete account/card from Supabase', error.message);
          return { error: new Error(error.message) };
        }

        setAccountsCards((prev) => prev.filter((a) => a.id !== id));
        return { error: null };
      } catch (e) {
        console.error('Failed to delete account/card from Supabase', e);
        const error = e instanceof Error ? e : new Error('Failed to delete account/card.');
        return { error };
      }
    },
    [user, executeWithAuthRetry]
  );

  // Mark Single Notification As Read (Supabase)
  const markNotificationAsRead = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      if (!user || !user.id) {
        return { error: new Error('You must be logged in to update notifications.') };
      }

      // Optimistically update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      try {
        const { error } = await executeWithAuthRetry(() =>
          supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', user.id)
        );

        if (error) {
          console.error('Failed to mark notification as read in Supabase', error.message);
          await fetchNotifications();
          return { error: new Error(error.message) };
        }

        return { error: null };
      } catch (e) {
        console.error('Failed to mark notification as read', e);
        await fetchNotifications();
        const error = e instanceof Error ? e : new Error('Failed to mark notification as read.');
        return { error };
      }
    },
    [user, executeWithAuthRetry, fetchNotifications]
  );

  // Mark All Notifications As Read (Supabase)
  const markAllNotificationsAsRead = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!user || !user.id) {
      return { error: new Error('You must be logged in to update notifications.') };
    }

    // Optimistically update all to read immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const { error } = await executeWithAuthRetry(() =>
        supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false)
      );

      if (error) {
        console.error('Failed to mark all notifications as read in Supabase', error.message);
        await fetchNotifications();
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
      await fetchNotifications();
      const error = e instanceof Error ? e : new Error('Failed to mark all notifications as read.');
      return { error };
    }
  }, [user, executeWithAuthRetry, fetchNotifications]);

  // Delete Notification Record (Supabase)
  const deleteNotificationRecord = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      if (!user || !user.id) {
        return { error: new Error('You must be logged in to delete notifications.') };
      }

      // Optimistically remove from state immediately
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      try {
        const { error } = await executeWithAuthRetry(() =>
          supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        );

        if (error) {
          console.error('Failed to delete notification from Supabase', error.message);
          await fetchNotifications();
          return { error: new Error(error.message) };
        }

        return { error: null };
      } catch (e) {
        console.error('Failed to delete notification from Supabase', e);
        await fetchNotifications();
        const error = e instanceof Error ? e : new Error('Failed to delete notification.');
        return { error };
      }
    },
    [user, executeWithAuthRetry, fetchNotifications]
  );

  // Create Notification (Supabase)
  const createNotificationRecord = useCallback(
    async (
      payload: CreateNotificationPayload
    ): Promise<{ data: InAppNotification | null; error: Error | null }> => {
      if (!user || !user.id) {
        return { data: null, error: new Error('You must be logged in to create a notification.') };
      }

      const notifTitle = (payload.title || '').trim();
      const notifMessage = (payload.message || '').trim();
      if (!notifTitle || !notifMessage) {
        return { data: null, error: new Error('Notification title and message are required.') };
      }

      try {
        const { data, error } = await executeWithAuthRetry(() =>
          supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: payload.type || 'info',
              title: notifTitle,
              message: notifMessage,
              read: false,
              related_id: payload.related_id || null,
              related_type: payload.related_type || null,
            })
            .select()
            .single()
        );

        if (error) {
          console.error('Supabase notifications insert error:', error.message);
          return { data: null, error: new Error(error.message) };
        }

        if (!data) {
          return { data: null, error: new Error('Failed to create notification.') };
        }

        const formatted: InAppNotification = {
          id: data.id,
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          read: Boolean(data.read),
          created_at: data.created_at,
          related_id: data.related_id || null,
          related_type: data.related_type || null,
        };

        setNotifications((prev) => {
          if (prev.some((n) => n.id === formatted.id)) {
            return prev;
          }
          triggerNotificationSound();
          return [formatted, ...prev];
        });
        return { data: formatted, error: null };
      } catch (e) {
        console.error('Unexpected error creating notification:', e);
        const error = e instanceof Error ? e : new Error('Failed to create notification.');
        return { data: null, error };
      }
    },
    [user, executeWithAuthRetry, triggerNotificationSound]
  );

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `g-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setAccountsCards([]);
    setNotifications([]);
    localStorage.removeItem('spendwise_data_v1');
  };

  const loadSampleData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setAccountsCards([]);
    setNotifications([]);
    fetchTransactions();
    fetchBudgets();
    fetchSavingsGoals();
    fetchAccountsCards();
    fetchNotifications();
  };

  const toggleSoundEnabled = useCallback((enabled?: boolean) => {
    setUserProfile((prev) => {
      const nextVal = enabled !== undefined ? enabled : !(prev.soundEnabled ?? true);
      return {
        ...prev,
        soundEnabled: nextVal,
      };
    });
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        transactionCount: transactions.length,
        budgets,
        budgetCount: budgets.length,
        savingsGoals,
        savingsGoalCount: savingsGoals.length,
        accountsCards,
        accountsCardsCount: accountsCards.length,
        isLoadingAccountsCards,
        notifications,
        unreadNotificationsCount,
        isLoadingNotifications,
        userProfile: effectiveUserProfile,
        totalBalance,
        totalIncome,
        totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        isLoadingTransactions,
        isLoadingBudgets,
        isLoadingSavingsGoals,
        categoryBreakdown,
        cashflow,
        addTransactionRecord,
        updateTransactionRecord,
        addExpense,
        addIncome,
        addTransaction,
        deleteTransaction,
        refreshTransactions: fetchTransactions,
        addBudgetRecord,
        updateBudgetRecord,
        deleteBudgetRecord,
        refreshBudgets: fetchBudgets,
        addSavingsGoalRecord,
        updateSavingsGoalRecord,
        addMoneyToSavingsGoal,
        deleteSavingsGoalRecord,
        refreshSavingsGoals: fetchSavingsGoals,
        addAccountCardRecord,
        updateAccountCardRecord,
        deleteAccountCardRecord,
        refreshAccountsCards: fetchAccountsCards,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotificationRecord,
        createNotificationRecord,
        checkBudgetNotifications: () => evaluateBudgetSpendingNotifications(budgets, transactions),
        soundEnabled: userProfile.soundEnabled !== false,
        toggleSoundEnabled,
        notificationSound: currentSoundId,
        setNotificationSound,
        previewSound,
        playNotificationSound: triggerNotificationSound,
        addBudget,
        addSavingsGoal,
        updateProfile,
        clearAllData,
        loadSampleData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}



