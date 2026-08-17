'use client';

import React from 'react';
import { AuthScreen } from '@/types/auth';
import AuthLayout from './AuthLayout';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import OtpScreen from './OtpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

interface AuthContainerProps {
  currentScreen: AuthScreen;
  onNavigate: (screen: AuthScreen) => void;
}

export default function AuthContainer({
  currentScreen,
  onNavigate,
}: AuthContainerProps) {
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={onNavigate} />;
      case 'login':
        return <LoginScreen onNavigate={onNavigate} />;
      case 'signup':
        return <SignUpScreen onNavigate={onNavigate} />;
      case 'otp':
        return <OtpScreen onNavigate={onNavigate} />;
      case 'forgot':
        return <ForgotPasswordScreen onNavigate={onNavigate} />;
      default:
        return <WelcomeScreen onNavigate={onNavigate} />;
    }
  };

  return (
    <AuthLayout currentScreen={currentScreen} onNavigate={onNavigate}>
      {renderScreen()}
    </AuthLayout>
  );
}
