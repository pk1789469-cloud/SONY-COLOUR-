import React from 'react';
import { Home, Flame, CreditCard, ShieldCheck, User as UserIcon } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { Language, translations } from '../utils/i18n';

interface NavbarProps {
  activeTab: 'home' | 'wingo' | 'recharge' | 'admin' | 'mine';
  setActiveTab: (tab: 'home' | 'wingo' | 'recharge' | 'admin' | 'mine') => void;
  pendingRechargesCount?: number;
  currentLang?: Language;
}

interface NavItem {
  id: 'home' | 'wingo' | 'recharge' | 'admin' | 'mine';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingRechargesCount = 0,
  currentLang = 'en',
}) => {
  const t = translations[currentLang];
  const tabs: NavItem[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'wingo', label: t.navWingo, icon: Flame, highlight: true },
    { id: 'recharge', label: t.navRecharge, icon: CreditCard },
    { id: 'admin', label: t.navAdmin, icon: ShieldCheck, badge: pendingRechargesCount },
    { id: 'mine', label: t.navMine, icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }`}
            >
              {tab.highlight && !isActive && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-0.5 right-1 px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full animate-bounce">
                  {tab.badge}
                </span>
              ) : null}

              <div
                className={`p-1 rounded-lg ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/30'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${tab.highlight && isActive ? 'text-amber-400 drop-shadow' : ''}`} />
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
