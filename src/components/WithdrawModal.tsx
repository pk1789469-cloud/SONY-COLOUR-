import React, { useState } from 'react';
import { ArrowDownToLine, AlertCircle, CheckCircle2, Clock, ShieldCheck, Wallet } from 'lucide-react';
import { AdminSettings, User, WithdrawalRequest } from '../types';
import { createWithdrawalRequest, getWithdrawalRequests } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface WithdrawModalProps {
  currentUser: User | null;
  settings: AdminSettings;
  onOpenAuth: () => void;
  onOpenRecharge: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  currentUser,
  settings,
  onOpenAuth,
  onOpenRecharge,
}) => {
  const [amount, setAmount] = useState<string>('500');
  const [upiId, setUpiId] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4 pb-24 text-neutral-100">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">Login Required for Withdrawal</h3>
          <p className="text-xs text-neutral-400">
            Please log in with your mobile number to withdraw your winnings to your UPI ID or Bank account.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-400 transition"
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const numAmount = parseFloat(amount);
    const minWithdraw = settings.minWithdrawal || 200;

    if (isNaN(numAmount) || numAmount < minWithdraw) {
      setErrorMessage(`Minimum withdrawal amount is ₹${minWithdraw}!`);
      return;
    }

    if (currentUser.balance < numAmount) {
      setErrorMessage('Insufficient balance in your wallet!');
      return;
    }

    if (method === 'upi' && (!upiId.trim() || !upiId.includes('@'))) {
      setErrorMessage('Please enter a valid UPI ID (e.g. username@ybl)');
      return;
    }

    if (method === 'bank' && (!bankAccount.trim() || !ifsc.trim())) {
      setErrorMessage('Please enter both Bank Account number and IFSC code!');
      return;
    }

    const res = createWithdrawalRequest(
      currentUser.id,
      currentUser.mobile,
      numAmount,
      method === 'upi' ? upiId : `Bank: ${bankAccount} (IFSC: ${ifsc})`,
      bankAccount,
      ifsc
    );

    if (res.success) {
      soundManager.playWin();
      setSuccessMessage('Withdrawal request submitted! The amount will be transferred after owner verification.');
      setAmount('');
      setUpiId('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const allWithdrawals = getWithdrawalRequests();
  const userWithdrawals = allWithdrawals.filter((w) => w.userId === currentUser.id);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24 text-neutral-100">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Withdrawable Balance (Available):</span>
            <h2 className="text-2xl font-black text-amber-300 font-mono mt-0.5">
              ₹{currentUser.balance.toFixed(2)}
            </h2>
          </div>
          <button
            onClick={onOpenRecharge}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            + Recharge
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmitWithdrawal} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
            <ArrowDownToLine className="w-4 h-4 text-amber-400" />
            <span>Withdraw Money</span>
          </h3>
          <span className="text-[10px] text-neutral-400 font-medium">
            Min: ₹{settings.minWithdrawal || 200}
          </span>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
            Withdrawal Amount (in ₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-amber-400">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm font-bold text-neutral-100 outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Quick Amount presets */}
        <div className="grid grid-cols-4 gap-2">
          {[200, 500, 1000, 5000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                soundManager.playClick();
                setAmount(amt.toString());
              }}
              className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                amount === amt.toString()
                  ? 'bg-amber-500 text-neutral-950 border-amber-400'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Withdrawal Method Switcher */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-neutral-400 block">
            Select Payout Method:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMethod('upi');
                soundManager.playClick();
              }}
              className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                method === 'upi'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              UPI ID (Fast)
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('bank');
                soundManager.playClick();
              }}
              className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                method === 'bank'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              Bank Account
            </button>
          </div>
        </div>

        {method === 'upi' ? (
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Your UPI ID (PhonePe / GPay / Paytm)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourname@ybl, mobile@paytm"
              className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 outline-none focus:border-amber-500"
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 uppercase outline-none"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition cursor-pointer"
        >
          Submit Withdrawal Request
        </button>
      </form>

      {/* History */}
      {userWithdrawals.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            Recent Withdrawal History
          </h4>
          <div className="space-y-2">
            {userWithdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-neutral-200">₹{w.amount}</span>
                  <p className="text-[10px] text-neutral-500">{new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      w.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : w.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {w.status === 'approved' ? 'Success ✓' : w.status === 'rejected' ? 'Rejected ✗' : 'Pending ⏳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
