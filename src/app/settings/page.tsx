'use client';

import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Check, User, Bell, Volume2, Play, Music } from 'lucide-react';
import { useLanguage, languages } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { NOTIFICATION_SOUNDS, NotificationSoundId } from '@/lib/audio';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const {
    userProfile,
    soundEnabled,
    toggleSoundEnabled,
    notificationSound,
    setNotificationSound,
    previewSound,
  } = useExpense();
  const { user } = useAuth();

  const [activePreviewingId, setActivePreviewingId] = useState<string | null>(null);

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : userProfile.name);
  const displayEmail = user?.email || userProfile.email;

  const handlePreview = (e: React.MouseEvent, soundId: NotificationSoundId) => {
    e.stopPropagation();
    setActivePreviewingId(soundId);
    previewSound(soundId);
    setTimeout(() => {
      setActivePreviewingId((prev) => (prev === soundId ? null : prev));
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('settings')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your application preferences, appearance theme, language, and account profile
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your authenticated account identity</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium text-slate-900 dark:text-white">
                {displayName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium text-slate-900 dark:text-white">
                {displayEmail}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Default Currency</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium text-slate-900 dark:text-white flex items-center justify-between">
                <span>Indian Rupee (INR)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{userProfile.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Theme Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:text-indigo-300 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-bold">Light Mode</p>
                <p className="text-xs text-slate-400 font-normal">Clean bright interface</p>
              </div>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-slate-800 text-white font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-bold">Dark Mode</p>
                <p className="text-xs text-slate-400 font-normal">Sleek obsidian theme</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notification Sounds Card */}
        <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
          {/* Header & Main Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Sounds</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audio alerts for new notifications and budget conditions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {soundEnabled ? 'Sound Active' : 'Sound Muted'}
              </span>
              <button
                onClick={() => toggleSoundEnabled()}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={soundEnabled}
                title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sound Chooser Section */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Choose Notification Ringtone</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose the sound you want to hear when a new notification arrives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {NOTIFICATION_SOUNDS.map((sound) => {
                const isSelected = notificationSound === sound.id;
                const isPreviewing = activePreviewingId === sound.id;

                return (
                  <div
                    key={sound.id}
                    onClick={() => setNotificationSound(sound.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sound.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {sound.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handlePreview(e, sound.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                        isPreviewing
                          ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={`Preview ${sound.name}`}
                    >
                      {isPreviewing ? (
                        <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Preview</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Language Preferences Card */}
        <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Language & Localization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred interface language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {languages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{l.flag}</span>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">{l.nativeName}</p>
                      <p className="text-[10px] text-slate-400">{l.label}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
