import {
  Budget,
  DashboardMetrics,
  MonthlyCashflow,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '@/types/expense';

export const mockUserProfile: UserProfile = {
  name: 'Aaditi Deshmukh',
  email: 'aaditi.deshmukh@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role: 'Premium Member',
  currency: '₹',
};

export const mockMetrics: DashboardMetrics = {
  totalBalance: 0,
  balanceChangePercentage: 0,
  monthlyIncome: 0,
  incomeChangePercentage: 0,
  monthlyExpenses: 0,
  expensesChangePercentage: 0,
  savingsRate: 0,
  savingsRateChange: 0,
};

export const mockCashflow: MonthlyCashflow[] = [
  { month: 'Mar', income: 0, expense: 0 },
  { month: 'Apr', income: 0, expense: 0 },
  { month: 'May', income: 0, expense: 0 },
  { month: 'Jun', income: 0, expense: 0 },
  { month: 'Jul', income: 0, expense: 0 },
  { month: 'Aug', income: 0, expense: 0 },
];

export const mockBudgets: Budget[] = [];

export const mockTransactions: Transaction[] = [];

export const mockSavingsGoals: SavingsGoal[] = [];

export const categoryBreakdownData: {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  hex: string;
}[] = [];
