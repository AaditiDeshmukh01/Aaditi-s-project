export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Other';

export type TransactionCategory =
  | ExpenseCategory
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Healthcare'
  | 'Utilities'
  | 'Salary'
  | 'Freelance'
  | 'Investments';

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
  // Optional UI presentation helper fields
  title?: string;
  paymentMethod?: string;
  status?: 'completed' | 'pending';
  merchantIcon?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category: string;
  amount: number;
  month: string;
  created_at?: string;
  updated_at?: string;
  // UI helper fields for backward compatibility with existing dashboard widgets
  allocated?: number;
  spent?: number;
  color?: string;
  iconName?: string;
}

export interface BudgetPayload {
  category: string;
  amount: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  completed?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
  // UI helper aliases
  name?: string;
  saved_amount?: number;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  icon?: string;
  color?: string;
}

export interface CreateSavingsGoalPayload {
  title?: string;
  name?: string;
  target_amount?: number;
  targetAmount?: number;
  current_amount?: number;
  saved_amount?: number;
  currentAmount?: number;
  target_date?: string | null;
  targetDate?: string | null;
  category?: string;
}

export interface UpdateSavingsGoalPayload {
  title?: string;
  name?: string;
  target_amount?: number;
  targetAmount?: number;
  current_amount?: number;
  saved_amount?: number;
  currentAmount?: number;
  target_date?: string | null;
  targetDate?: string | null;
  category?: string;
}

export interface MonthlyCashflow {
  month: string;
  income: number;
  expense: number;
}

export type NotificationSoundId =
  | 'notification-1'
  | 'notification-2'
  | 'notification-3'
  | 'notification-4'
  | 'notification-5';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  currency: string;
  soundEnabled?: boolean;
  notificationSound?: NotificationSoundId;
}

export interface DashboardMetrics {
  totalBalance: number;
  balanceChangePercentage: number;
  monthlyIncome: number;
  incomeChangePercentage: number;
  monthlyExpenses: number;
  expensesChangePercentage: number;
  savingsRate: number;
  savingsRateChange: number;
}

export type NotificationType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'savings_goal_achieved'
  | 'savings_goal_reminder'
  | 'system'
  | 'info'
  | string;

export interface InAppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string | null;
  related_type?: string | null;
}

export interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string | null;
  related_type?: string | null;
}

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'savings' | 'investment' | 'loan' | 'other';

export interface AccountCard {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency?: string;
  account_number_last4?: string | null;
  color?: string | null;
  icon?: string | null;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountCardPayload {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  account_number_last4?: string | null;
  color?: string | null;
  icon?: string | null;
  is_default?: boolean;
}

export interface UpdateAccountCardPayload {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  account_number_last4?: string | null;
  color?: string | null;
  icon?: string | null;
  is_default?: boolean;
}

// Aliases for compatibility
export type Account = AccountCard;
export type CreateAccountPayload = CreateAccountCardPayload;
export type UpdateAccountPayload = UpdateAccountCardPayload;

