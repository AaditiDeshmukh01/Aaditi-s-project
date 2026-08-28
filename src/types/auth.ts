export type AuthScreen =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'otp'
  | 'forgot'
  | 'reset-password'
  | 'dashboard';

export type NavigateFunction = (screen: AuthScreen, email?: string) => void;

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}
