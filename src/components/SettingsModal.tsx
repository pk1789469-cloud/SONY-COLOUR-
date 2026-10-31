import React from 'react';
import { X, Globe, Volume2, VolumeX, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/i18n';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl relative text-neutral-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mx-auto mb-2 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-black">{t.settingsModalTitle}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {currentLang === 'hi' ? 'भाषा व गेम प्राथमिकताएं बदलें' : 'Change language & game preferences'}
          </p>
        </div>

        {/* LANGUAGE SELECTOR SECTION - User Preference */}
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>{t.languageOption}</span>
            </span>
            <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
              {currentLang === 'hi' ? 'Active: Hindi' : 'Active: English'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* English Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onLanguageChange('en');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/30 scale-[1.02] font-black'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border-neutral-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇬🇧</span>
                <span className="text-xs font-bold">English</span>
                {currentLang === 'en' && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] ${currentLang === 'en' ? 'text-neutral-900/80' : 'text-neutral-500'}`}>
                Primary
              </span>
            </button>

            {/* Hindi Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onLanguageChange('hi');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/30 scale-[1.02] font-black'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border-neutral-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇮🇳</span>
                <span className="text-xs font-bold">हिन्दी</span>
                {currentLang === 'hi' && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] ${currentLang === 'hi' ? 'text-neutral-900/80' : 'text-neutral-500'}`}>
                Hindi Option
              </span>
            </button>
          </div>
        </div>

        {/* SOUND TOGGLE SECTION */}
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center">
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">{t.soundOption}</span>
              <span className="text-[10px] text-neutral-400">
                {isMuted ? t.soundOff : t.soundOn}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              !isMuted ? 'bg-amber-500' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                !isMuted ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* App Info Box */}
        <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TG Gaming Owner Platform</span>
          </div>
          <span className="font-mono text-[11px] text-amber-400 font-bold">v1.2.0 VIP</span>
        </div>

        {/* Done / Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs rounded-xl transition"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
