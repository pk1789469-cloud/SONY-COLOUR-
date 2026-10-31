import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Globe, ExternalLink, QrCode } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Public production URL for all players vs dev URL
  const publicShareUrl = 'https://ais-pre-x2sw4po2exgnz55lbnduss-335505079541.asia-northeast1.run.app';
  
  // Current active origin
  const currentOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : publicShareUrl;

  const isDevUrl = currentOrigin.includes('ais-dev-');
  const finalShareUrl = isDevUrl ? publicShareUrl : currentOrigin;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(finalShareUrl)}&margin=2`;

  const shareText = `🔥 *TG Gaming Owner* - Play India's #1 Color Trading Game!\n\n💰 Instant Auto PhonePe & UPI Recharge\n🎯 Win Go 30s, 1Min, 3Min Live\n⚡ Starting Balance ₹0.00 for New Players\n\n👉 Play Now in Browser: ${finalShareUrl}`;

  const handleCopy = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    soundManager.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    soundManager.playClick();
    const url = `https://t.me/share/url?url=${encodeURIComponent(finalShareUrl)}&text=${encodeURIComponent('TG Gaming Owner - Premium Color Trading Game')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl relative text-neutral-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mx-auto mb-2 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-black">Share Game Link</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Active verified link — opens directly on any mobile browser
          </p>
        </div>

        {/* Working Live Link Box */}
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Live Game URL</span>
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20 text-[10px]">
              Active & Working
            </span>
          </div>

          <p className="font-mono text-xs text-amber-300 break-all bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 select-all font-semibold">
            {finalShareUrl}
          </p>

          <button
            onClick={() => handleCopy(finalShareUrl)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-md shadow-amber-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied Successfully!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Game Link</span>
              </>
            )}
          </button>
        </div>

        {/* Public Sharing Instructions */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 text-[11px] text-amber-200/90 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-400">
            <span>📢 Public Access for All Users:</span>
          </p>
          <p className="text-neutral-300 text-[10.5px] leading-relaxed">
            Click the <strong className="text-amber-400">"Share"</strong> button at the top-right of your AI Studio screen and select <strong className="text-white">"Anyone with the link"</strong> so all external players can access and play instantly!
          </p>
        </div>

        {/* Dynamic QR Code for Quick Scan */}
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center text-center space-y-1.5">
          <div className="p-2 bg-white rounded-xl shadow-md">
            <img src={qrImageUrl} alt="Game QR" className="w-32 h-32 object-contain" />
          </div>
          <p className="text-[11px] text-neutral-400">
            Players can scan this QR code with their mobile camera to open and play
          </p>
        </div>

        {/* 1-Click WhatsApp & Telegram Share */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleTelegramShare}
            className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </button>
        </div>
      </div>
    </div>
  );
};
