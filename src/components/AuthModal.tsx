import React, { useState } from 'react';
import { X, Lock, Phone, UserPlus, LogIn, AlertCircle, Shield } from 'lucide-react';
import { loginUser, registerUser } from '../utils/storage';
import { soundManager } from '../utils/sound';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!mobile.trim() || !password.trim()) {
      setErrorMessage('Please enter both mobile number and password!');
      return;
    }

    const res = loginUser(mobile, password);
    if (res.success && res.user) {
      soundManager.playWin();
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!mobile.trim() || mobile.trim().length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number!');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match! Please verify.');
      return;
    }

    const res = registerUser(mobile, password);
    if (res.success && res.user) {
      soundManager.playWin();
      setSuccessMessage('Registration successful! Your initial starting balance is ₹0.00.');
      setTimeout(() => {
        if (res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      }, 900);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleAdminQuickFill = () => {
    setMobile('9999999999');
    setPassword('admin');
    setActiveTab('login');
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Title */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <span>TG Gaming Owner</span>
          </div>
          <h3 className="text-xl font-black text-neutral-100">
            {activeTab === 'login' ? 'Login to Account' : 'Register New Account'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {activeTab === 'login'
              ? 'Secure login with your mobile number and password'
              : 'New members receive exactly ₹0.00 starting balance'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              soundManager.playClick();
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              soundManager.playClick();
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm font-mono text-neutral-100 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-neutral-100 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm font-mono text-neutral-100 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-neutral-100 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-neutral-100 outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-[10px] text-amber-300">
              ⚡ All new registered members start with exactly <strong>₹0.00</strong> balance.
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register (₹0.00 Balance)</span>
            </button>
          </form>
        )}

        {/* Quick Admin fill button */}
        <div className="pt-2 border-t border-neutral-800 text-center">
          <button
            type="button"
            onClick={handleAdminQuickFill}
            className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill Owner Credentials (9999999999 / admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
