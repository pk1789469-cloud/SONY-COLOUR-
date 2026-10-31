/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { WinGoGame } from './components/WinGoGame';
import { RechargeModal } from './components/RechargeModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AdminPanel } from './components/AdminPanel';
import { AccountTab } from './components/AccountTab';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminSettings, User } from './types';
import {
  getAdminSettings,
  getCurrentUser,
  getRechargeRequests,
  initStorage,
  setCurrentUser,
} from './utils/storage';
import { soundManager } from './utils/sound';
import { getLanguage, Language, setLanguage as saveLanguage } from './utils/i18n';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [activeTab, setActiveTab] = useState<'home' | 'wingo' | 'recharge' | 'admin' | 'mine'>('home');
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [pendingRechargesCount, setPendingRechargesCount] = useState<number>(0);

  useEffect(() => {
    // Initialize initial seed data and admin settings
    initStorage();
    setUser(getCurrentUser());
    setSettings(getAdminSettings());

    const updatePendingCount = () => {
      const allRc = getRechargeRequests();
      setPendingRechargesCount(allRc.filter((r) => r.status === 'pending').length);
    };
    updatePendingCount();

    // Listen to real-time events
    const handleAuthChange = () => {
      setUser(getCurrentUser());
      updatePendingCount();
    };

    const handleSettingsChange = () => {
      setSettings(getAdminSettings());
    };

    const handleRechargeChange = () => {
      updatePendingCount();
    };

    window.addEventListener('tg_user_auth_changed', handleAuthChange);
    window.addEventListener('tg_balance_updated', handleAuthChange);
    window.addEventListener('tg_settings_updated', handleSettingsChange);
    window.addEventListener('tg_recharges_updated', handleRechargeChange);

    return () => {
      window.removeEventListener('tg_user_auth_changed', handleAuthChange);
      window.removeEventListener('tg_balance_updated', handleAuthChange);
      window.removeEventListener('tg_settings_updated', handleSettingsChange);
      window.removeEventListener('tg_recharges_updated', handleRechargeChange);
    };
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.isMuted = next;
  };

  const handleLogout = () => {
    soundManager.playClick();
    setCurrentUser(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* App Frame container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative bg-neutral-950 min-h-screen shadow-2xl border-x border-neutral-800/40">
        {/* Sticky Header */}
        <Header
          currentUser={currentUser}
          currentLang={currentLang}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenRecharge={() => setActiveTab('recharge')}
          onOpenShare={() => setShareModalOpen(true)}
          onOpenAdmin={() => setActiveTab('admin')}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onLogout={handleLogout}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeView
              currentUser={currentUser}
              settings={settings}
              currentLang={currentLang}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenShare={() => setShareModalOpen(true)}
              onOpenWithdraw={() => setWithdrawModalOpen(true)}
              onOpenSettings={() => setSettingsModalOpen(true)}
            />
          )}

          {activeTab === 'wingo' && (
            <WinGoGame
              currentUser={currentUser}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenRecharge={() => setActiveTab('recharge')}
            />
          )}

          {activeTab === 'recharge' && (
            <RechargeModal
              currentUser={currentUser}
              settings={settings}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              currentUser={currentUser}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {activeTab === 'mine' && (
            <AccountTab
              currentUser={currentUser}
              settings={settings}
              currentLang={currentLang}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenRecharge={() => setActiveTab('recharge')}
              onOpenWithdraw={() => setWithdrawModalOpen(true)}
              onOpenShare={() => setShareModalOpen(true)}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenSettings={() => setSettingsModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Bottom Navigation Dock */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentLang={currentLang}
          pendingRechargesCount={currentUser?.role === 'admin' ? pendingRechargesCount : 0}
        />

        {/* Global Modals */}
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          currentLang={currentLang}
          onLanguageChange={(lang) => {
            setCurrentLang(lang);
            saveLanguage(lang);
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(u) => {
            setUser(u);
            setAuthModalOpen(false);
          }}
        />

        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />

        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-neutral-900/90 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-neutral-800 z-10">
                <span className="font-bold text-sm text-neutral-100">Withdrawal Portal</span>
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-2.5 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-lg hover:text-white cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
              <WithdrawModal
                currentUser={currentUser}
                settings={settings}
                onOpenAuth={() => {
                  setWithdrawModalOpen(false);
                  setAuthModalOpen(true);
                }}
                onOpenRecharge={() => {
                  setWithdrawModalOpen(false);
                  setActiveTab('recharge');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
