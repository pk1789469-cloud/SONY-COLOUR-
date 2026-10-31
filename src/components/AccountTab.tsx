import React from 'react';
import { User as UserIcon, Wallet, ArrowDownToLine, CreditCard, History, Share2, Shield, PhoneCall, Send, LogOut, ChevronRight, Settings, Globe } from 'lucide-react';
import { AdminSettings, User } from '../types';
import { soundManager } from '../utils/sound';
import { Language, translations } from '../utils/i18n';

interface AccountTabProps {
  currentUser: User | null;
  settings: AdminSettings;
  currentLang: Language;
  onOpenAuth: () => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onOpenShare: () => void;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  currentUser,
  settings,
  currentLang,
  onOpenAuth,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenShare,
  onOpenAdmin,
  onOpenSettings,
  onLogout,
}) => {
  const t = translations[currentLang];
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4 pb-24 text-neutral-100">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">TG Gaming Owner</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Please log in to view your wallet balance, betting history, and account settings.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-3 space-y-4 pb-24 text-neutral-100">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-bold text-amber-400 text-xl font-mono">
              {currentUser.mobile.slice(-2)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-neutral-100">
                {currentUser.mobile}
              </span>
              {currentUser.role === 'admin' ? (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full text-[10px] font-black uppercase">
                  OWNER
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-[10px] font-bold">
                  VIP 1
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
              UID: {currentUser.id.slice(0, 12)}
            </p>
          </div>
        </div>

        {/* Balance Showcase */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 bg-neutral-950/60 p-3 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Total Wallet Balance</span>
            <span className="text-2xl font-black text-amber-300 font-mono">
              ₹{currentUser.balance.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenRecharge();
              }}
              className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-neutral-950 font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              + Recharge
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenWithdraw();
              }}
              className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl border border-neutral-700 cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-center">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Recharged</span>
          <span className="text-xs font-bold text-neutral-200 font-mono mt-0.5 block">
            ₹{currentUser.totalRecharged || 0}
          </span>
        </div>
        <div className="border-x border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Withdrawn</span>
          <span className="text-xs font-bold text-neutral-200 font-mono mt-0.5 block">
            ₹{currentUser.totalWithdrawn || 0}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Bets Placed</span>
          <span className="text-xs font-bold text-amber-400 font-mono mt-0.5 block">
            {currentUser.totalBetsPlaced || 0}
          </span>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/80 overflow-hidden text-xs">
        {/* Settings & Language row */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-3.5 flex items-center justify-between hover:bg-neutral-850 cursor-pointer transition bg-amber-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-neutral-100 block">
                {t.settingsModalTitle} ({t.languageOption})
              </span>
              <span className="text-[10px] text-amber-400 font-medium">
                Audio & Language Settings
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold uppercase">
              {currentLang.toUpperCase()}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </div>
        </div>

        {/* Share website */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenShare();
          }}
          className="p-3.5 flex items-center justify-between hover:bg-neutral-850 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-neutral-200">{t.shareWithFriends}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </div>

        {/* Admin panel shortcut */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenAdmin();
          }}
          className="p-3.5 flex items-center justify-between hover:bg-neutral-850 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-neutral-200">Owner Admin Control Panel</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </div>

        {/* Telegram Customer Support */}
        {settings.telegramChannel && (
          <a
            href={settings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 flex items-center justify-between hover:bg-neutral-850 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <span className="font-semibold text-neutral-200">Telegram Customer Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </a>
        )}

        {/* WhatsApp Support */}
        {settings.whatsappSupport && (
          <a
            href={`https://wa.me/${settings.whatsappSupport.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 flex items-center justify-between hover:bg-neutral-850 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="font-semibold text-neutral-200">WhatsApp Helpline</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </a>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-neutral-900 hover:bg-red-950/40 border border-neutral-800 hover:border-red-800/60 text-red-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Account</span>
      </button>
    </div>
  );
};
