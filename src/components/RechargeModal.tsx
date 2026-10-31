import React, { useState } from 'react';
import { Copy, Check, QrCode, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Smartphone, CheckCircle2, Clock } from 'lucide-react';
import { AdminSettings, RechargeRequest, User } from '../types';
import { createRechargeRequest, getRechargeRequests } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface RechargeModalProps {
  currentUser: User | null;
  settings: AdminSettings;
  onClose?: () => void;
  onOpenAuth: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  currentUser,
  settings,
  onOpenAuth,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<RechargeRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'pay' | 'utr' | 'success'>('pay');

  const amountPresets = [100, 300, 500, 1000, 2000, 5000, 10000];

  const currentAmount = parseInt(customAmount, 10) || selectedAmount || 100;

  // Construct official UPI payment URI with auto amount
  const payee = settings.payeeName || 'TG Gaming Owner';
  const upiId = settings.upiId || 'tggamingempire@ybl';
  const transactionNote = `TG_Gaming_${currentUser?.mobile || 'User'}_${Date.now().toString().slice(-4)}`;
  
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const phonePeIntentUrl = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const paytmIntentUrl = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Dynamic QR Code or Official Uploaded PhonePe QR Code
  const isCustomUploadedQr = Boolean(settings.qrCodeUrl && settings.qrCodeUrl.trim().length > 0);
  const qrCodeImageUrl = isCustomUploadedQr
    ? settings.qrCodeUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=000000&margin=2`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    soundManager.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
    soundManager.playClick();
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setSelectedAmount(num);
    }
  };

  // Trigger PhonePe Auto Payment button
  const handleOpenPhonePe = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    soundManager.playClick();
    
    // Automatically trigger deep-link to launch PhonePe / UPI
    try {
      // First attempt PhonePe direct intent
      window.location.href = phonePeIntentUrl;
      setTimeout(() => {
        // Fallback to standard UPI deep link which gives PhonePe / GPay picker
        window.location.href = upiUrl;
      }, 500);
    } catch {
      window.location.href = upiUrl;
    }

    // Advance to UTR entry step
    setPaymentStep('utr');
  };

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (currentAmount < (settings.minRecharge || 100)) {
      setErrorMessage(`Minimum recharge amount is ₹${settings.minRecharge || 100}!`);
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid 12-digit UTR / Reference number!');
      return;
    }

    const res = createRechargeRequest(
      currentUser.id,
      currentUser.mobile,
      currentAmount,
      utrNumber,
      'PhonePe / UPI'
    );

    if (res.success && res.request) {
      soundManager.playWin();
      setSubmittedRequest(res.request);
      setPaymentStep('success');
      setUtrNumber('');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Get user's recent recharge history
  const allRecharges = getRechargeRequests();
  const userRecharges = currentUser
    ? allRecharges.filter((r) => r.userId === currentUser.id).slice(0, 5)
    : [];

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24 text-neutral-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 rounded-2xl p-4 text-neutral-950 shadow-lg shadow-amber-500/20 relative overflow-hidden">
        <div className="absolute right-2 -bottom-2 opacity-15">
          <QrCode className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-neutral-900">
              ⚡ Instant PhonePe & UPI Recharge
            </span>
            <span className="text-xs font-semibold bg-white/30 px-2 py-0.5 rounded-full">
              24x7 Auto
            </span>
          </div>
          <h2 className="text-2xl font-black mt-1">Fast Wallet Recharge</h2>
          <p className="text-xs font-medium text-neutral-900/90 mt-0.5">
            Enter Amount ➜ Open PhonePe ➜ 1-Click Instant Payment
          </p>
          <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-xs font-bold">
            <span>Current Balance:</span>
            <span className="text-sm">₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>

      {!currentUser && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-xs text-amber-200">Please login first to recharge</p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:brightness-110 cursor-pointer"
          >
            Login Now
          </button>
        </div>
      )}

      {/* Amount Selector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Select Recharge Amount
        </label>

        {/* Amount Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-amber-400">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Enter amount"
            className="w-full pl-8 pr-4 py-2.5 bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl text-lg font-bold text-neutral-100 outline-none transition"
          />
        </div>

        {/* Quick Amount Chips */}
        <div className="grid grid-cols-4 gap-2">
          {amountPresets.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleAmountSelect(amt)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                selectedAmount === amt && customAmount === amt.toString()
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 border-neutral-700'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Official UPI & QR Details */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div>
            <p className="text-[11px] text-neutral-400">Official Payee UPI ID</p>
            <p className="text-sm font-bold text-amber-300">{payee}</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </div>
        </div>

        {/* UPI ID Copy Box */}
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">UPI ID</span>
            <span className="font-mono text-sm font-bold text-neutral-200 select-all">{upiId}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyUpi}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              copiedUpi
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700'
            }`}
          >
            {copiedUpi ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy UPI</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Card with dynamic amount */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col items-center text-center space-y-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
            <span>⚡ Official PhonePe QR</span>
            <span className="text-amber-400 font-mono">({upiId})</span>
          </div>

          <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/80 relative">
            <img
              src={qrCodeImageUrl}
              alt="Official PhonePe QR Code"
              className="w-48 h-48 object-contain rounded-lg"
              loading="eager"
            />
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-xl border border-neutral-800">
            <span className="text-[11px] text-neutral-400">Payment Amount:</span>
            <span className="text-sm font-black text-amber-400 font-mono">₹{currentAmount}</span>
          </div>

          <p className="text-xs font-medium text-neutral-300">
            Scan QR with PhonePe, GPay, or Paytm to pay ₹{currentAmount}
          </p>
        </div>

        {/* PRIMARY AUTO PAY BUTTON - Specifically requested by user */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenPhonePe}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-[0.98] transition cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>⚡ Pay via PhonePe (Auto Pay ₹{currentAmount})</span>
          </button>

          <p className="text-[11px] text-center text-neutral-400">
            Clicking this button automatically opens PhonePe with ₹{currentAmount} prefilled.
          </p>

          {/* Quick links for other UPI apps */}
          <div className="flex gap-2 pt-1">
            <a
              href={upiUrl}
              onClick={() => setPaymentStep('utr')}
              className="flex-1 py-2 text-center text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700"
            >
              Google Pay / Other UPI
            </a>
            <a
              href={paytmIntentUrl}
              onClick={() => setPaymentStep('utr')}
              className="flex-1 py-2 text-center text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded-lg border border-neutral-700"
            >
              Pay via Paytm
            </a>
          </div>
        </div>
      </div>

      {/* UTR Submission Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Step 2: Enter UTR / Reference No.</span>
        </div>

        <p className="text-xs text-neutral-400">
          After paying on PhonePe, copy the 12-digit UTR / Reference number and paste below:
        </p>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {paymentStep === 'success' && submittedRequest && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recharge request submitted successfully!</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Amount: <strong className="text-emerald-400">₹{submittedRequest.amount}</strong> | UTR: {submittedRequest.utr}
            </p>
            <p className="text-[10px] text-neutral-400">
              Your wallet balance will be updated within 1-2 minutes after admin verification.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitUtr} className="space-y-3">
          <div>
            <label className="text-[11px] text-neutral-400 font-semibold block mb-1">
              12 Digit UTR / Reference No.
            </label>
            <input
              type="text"
              maxLength={18}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="e.g. 430588291039"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl font-mono text-sm text-neutral-100 outline-none uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-neutral-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
          >
            <span>Submit UTR Proof</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Instructions Guide */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-2.5 text-xs text-neutral-300">
        <h4 className="font-bold text-neutral-100 flex items-center gap-1">
          📌 How to Recharge?
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400">
          <li>Select your desired recharge amount above.</li>
          <li>
            Click <strong className="text-neutral-200">"Pay via PhonePe (Auto Pay)"</strong> button to launch your PhonePe app.
          </li>
          <li>Enter your UPI PIN on PhonePe to complete the ₹{currentAmount} payment.</li>
          <li>
            After payment, copy the <strong className="text-neutral-200">12 Digit UTR / Reference No.</strong> from transaction details.
          </li>
          <li>Paste the UTR number in the box above and click <strong className="text-emerald-400">"Submit UTR Proof"</strong>.</li>
        </ol>
      </div>

      {/* Previous Recharge History */}
      {userRecharges.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              My Recent Recharges
            </h4>
          </div>
          <div className="space-y-2">
            {userRecharges.map((rc) => (
              <div
                key={rc.id}
                className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-200">₹{rc.amount}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">UTR: {rc.utr.slice(0, 8)}...</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(rc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  {rc.status === 'approved' ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px]">
                      Approved
                    </span>
                  ) : rc.status === 'rejected' ? (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full font-bold text-[10px]">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-bold text-[10px] animate-pulse">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
