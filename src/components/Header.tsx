import React from 'react';
import { Volume2, VolumeX, Shield, Share2, Wallet, User as UserIcon, Plus, Settings } from 'lucide-react';
import { User } from '../types';
import { soundManager } from '../utils/sound';
import { Language, translations } from '../utils/i18n';

interface HeaderProps {
  currentUser: User | null;
  currentLang: Language;
  onOpenAuth: () => void;
  onOpenRecharge: () => void;
  onOpenShare: () => void;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentLang,
  onOpenAuth,
  onOpenRecharge,
  onOpenShare,
  onOpenAdmin,
  onOpenSettings,
  onLogout,
  isMuted,
  onToggleMute,
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name (Compact Left) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[9px] flex items-center justify-center font-teko text-lg font-bold text-amber-400">
              TG
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs tracking-wide bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                TG GAMING
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-semibold">
                OWNER
              </span>
            </div>
          </div>
        </div>

        {/* Compact Right Side: Balance Badge + Utility Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Top Wallet Balance - Small, sleek, side-aligned as requested */}
          {currentUser ? (
            <div
              onClick={onOpenRecharge}
              role="button"
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-neutral-950/90 hover:bg-neutral-900 border border-amber-500/50 hover:border-amber-400 rounded-full transition shadow-sm"
              title="Click to Recharge Wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-mono font-black text-amber-300 tracking-tight">
                ₹{currentUser.balance.toFixed(2)}
              </span>
              <div className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center ml-0.5 shadow-sm">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 text-xs font-black rounded-full flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <UserIcon className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}

          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Quick Share Link Button */}
          <button
            onClick={() => {
              onOpenShare();
              soundManager.playClick();
            }}
            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 flex items-center justify-center transition cursor-pointer"
            title="Share Game Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              onOpenSettings();
              soundManager.playClick();
            }}
            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-300" />
          </button>

          {/* Admin shortcut if owner */}
          {currentUser && (currentUser.role === 'admin' || currentUser.mobile === '9999999999') && (
            <button
              onClick={() => {
                onOpenAdmin();
                soundManager.playClick();
              }}
              className="w-7 h-7 rounded-lg bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 text-red-400 flex items-center justify-center transition cursor-pointer"
              title="Admin Control"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
