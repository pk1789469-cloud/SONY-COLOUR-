import React from 'react';
import { Flame, CreditCard, ArrowDownToLine, Share2, Shield, Volume2, HelpCircle, Trophy, Sparkles, ChevronRight, Zap, Globe, Settings } from 'lucide-react';
import { AdminSettings, User } from '../types';
import { soundManager } from '../utils/sound';
import { Language, translations } from '../utils/i18n';

interface HomeViewProps {
  currentUser: User | null;
  settings: AdminSettings;
  currentLang: Language;
  onNavigate: (tab: 'home' | 'wingo' | 'recharge' | 'admin' | 'mine') => void;
  onOpenAuth: () => void;
  onOpenShare: () => void;
  onOpenWithdraw: () => void;
  onOpenSettings: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  settings,
  currentLang,
  onNavigate,
  onOpenAuth,
  onOpenShare,
  onOpenWithdraw,
  onOpenSettings,
}) => {
  const t = translations[currentLang];
  // Live winner ticker feed
  const liveWinners = [
    { mobile: '98***821', game: 'Win Go 1Min', amount: 3920, color: 'Green' },
    { mobile: '70***419', game: 'Win Go 30s', amount: 8820, color: 'Violet 4.5x' },
    { mobile: '91***044', game: 'Win Go 1Min', amount: 1960, color: 'Red' },
    { mobile: '88***620', game: 'Win Go 3Min', amount: 17640, color: 'Number 7' },
    { mobile: '99***312', game: 'Win Go 30s', amount: 4900, color: 'Big' },
  ];

  return (
    <div className="max-w-md mx-auto p-3 space-y-4 pb-24 text-neutral-100">
      {/* Hero Brand Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-500 p-5 shadow-xl shadow-amber-500/20 text-neutral-950">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/20 rounded-full blur-xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-neutral-950 font-black text-[11px] uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>VIP COLOR TRADING PLATFORM</span>
          </div>

          <h1 className="text-3xl font-black font-teko tracking-wide leading-none">
            TG GAMING OWNER
          </h1>

          <p className="text-xs font-semibold text-neutral-900/90 leading-relaxed">
            India's Premier Color Trading Game! Instant Auto PhonePe Recharge, QR Scanner & 100% Full Admin Control.
          </p>

          {/* Quick Action in banner */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('wingo');
              }}
              className="py-2 px-3.5 rounded-xl bg-neutral-950 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow hover:bg-neutral-900 transition cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Play Win Go</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenShare();
              }}
              className="py-2 px-2.5 rounded-xl bg-white/30 backdrop-blur text-neutral-950 font-bold text-xs flex items-center gap-1 hover:bg-white/40 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Running Notice Ticker */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 flex items-center gap-2 text-xs overflow-hidden">
        <div className="flex items-center gap-1 text-amber-400 font-bold flex-shrink-0 px-1">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Notice:</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-neutral-300 text-[11px]">
          <div className="inline-block animate-marquee">
            {settings.notice || '🔥 Welcome to TG Gaming Owner! Instant PhonePe UPI auto recharge available 24x7!'}
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Win Go Color Trading */}
        <div
          onClick={() => {
            soundManager.playClick();
            onNavigate('wingo');
          }}
          className="cursor-pointer group relative overflow-hidden bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mb-2 shadow-md shadow-amber-500/30">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-extrabold text-sm text-neutral-100 group-hover:text-amber-400 transition">
            Win Go Game
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Green, Red, Violet & Number Trading
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-bold mt-2">
            Start Playing <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Card 2: Auto PhonePe Recharge */}
        <div
          onClick={() => {
            soundManager.playClick();
            onNavigate('recharge');
          }}
          className="cursor-pointer group relative overflow-hidden bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-3.5 transition-all shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mb-2 shadow-md shadow-emerald-500/30">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-extrabold text-sm text-neutral-100 group-hover:text-emerald-400 transition">
            PhonePe Auto Pay
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Official QR & 1-Click Auto Pay
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold mt-2">
            Recharge Now <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Card 3: Withdrawal */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenWithdraw();
          }}
          className="cursor-pointer group relative overflow-hidden bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-sky-500/50 rounded-2xl p-3.5 transition-all shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-500 p-0.5 mb-2 shadow-md shadow-sky-500/30">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-sky-400">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-extrabold text-sm text-neutral-100 group-hover:text-sky-400 transition">
            Fast Withdrawal
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Direct to Bank or UPI ID
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-400 font-bold mt-2">
            Withdraw <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Card 4: Admin Master Control */}
        <div
          onClick={() => {
            soundManager.playClick();
            onNavigate('admin');
          }}
          className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-red-950/40 via-neutral-900 to-neutral-900 hover:border-red-500/50 border border-red-900/40 rounded-2xl p-3.5 transition-all shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-400 p-0.5 mb-2 shadow-md shadow-red-500/30">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-extrabold text-sm text-neutral-100 group-hover:text-red-400 transition">
            Owner Admin Panel
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Control next winner & balances
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 font-bold mt-2">
            Open Panel <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Share Web Link Promotion Banner */}
      <div
        onClick={() => {
          soundManager.playClick();
          onOpenShare();
        }}
        className="cursor-pointer bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-900 border border-emerald-700/40 rounded-2xl p-3.5 flex items-center justify-between shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-100">Share Public Link with Players</h4>
            <p className="text-[10px] text-neutral-400">
              1-Click Share on WhatsApp or Telegram (Anyone can play!)
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg">
          Share
        </span>
      </div>

      {/* Live Winning Broadcast (Ok Win / Tiranga style feed) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Live Winning Feed</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Realtime
          </span>
        </div>

        <div className="space-y-1.5">
          {liveWinners.map((win, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-950/60 border border-neutral-800/40"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-neutral-400 font-medium">{win.mobile}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                  {win.game}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-xs">
                <span>+₹{win.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
