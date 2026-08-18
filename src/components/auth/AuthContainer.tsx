'use client';

import React, { useState } from 'react';
import { AuthScreen } from '@/types/auth';
import AuthLayout from './AuthLayout';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import OtpScreen from './OtpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

interface AuthContainerProps {
  currentScreen: AuthScreen;
  onNavigate: (screen: AuthScreen, email?: string) => void;
  initialEmail?: string;
}

export default function AuthContainer({
  currentScreen,
  onNavigate,
  initialEmail = '',
}: AuthContainerProps) {
  const [pendingEmail, setPendingEmail] = useState<string>(initialEmail);

  const handleNavigate = (screen: AuthScreen, email?: string) => {
    if (email) {
      setPendingEmail(email);
    }
    onNavigate(screen, email);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpScreen onNavigate={handleNavigate} />;
      case 'otp':
        return <OtpScreen onNavigate={handleNavigate} email={pendingEmail} />;
      case 'forgot':
        return <ForgotPasswordScreen onNavigate={handleNavigate} />;
      default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {renderScreen()}
    </AuthLayout>
  );
}
