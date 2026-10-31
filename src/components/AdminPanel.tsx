import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, CreditCard, ArrowDownToLine, Settings, DollarSign, Search, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { AdminSettings, Bet, GameType, RechargeRequest, User, WithdrawalRequest } from '../types';
import {
  adminApproveRecharge,
  adminApproveWithdrawal,
  adminRejectRecharge,
  adminRejectWithdrawal,
  adminSetUserBalance,
  getAdminSettings,
  getBets,
  getRechargeRequests,
  getUsers,
  getWithdrawalRequests,
  saveAdminSettings,
  updateUserBalance,
} from '../utils/storage';
import { soundManager } from '../utils/sound';

interface AdminPanelProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'control' | 'recharges' | 'withdrawals' | 'users' | 'settings'>('control');
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [recharges, setRecharges] = useState<RechargeRequest[]>(getRechargeRequests());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(getWithdrawalRequests());
  const [users, setUsers] = useState<User[]>(getUsers());
  const [bets, setBets] = useState<Bet[]>(getBets());

  // Game control state
  const [selectedGame, setSelectedGame] = useState<GameType>('wingo_1m');
  const [forcedNum, setForcedNum] = useState<number | null>(null);

  // User management state
  const [searchUser, setSearchUser] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<string>('');

  // Settings form state
  const [upiIdInput, setUpiIdInput] = useState<string>(settings.upiId);
  const [payeeNameInput, setPayeeNameInput] = useState<string>(settings.payeeName);
  const [qrCodeInput, setQrCodeInput] = useState<string>(settings.qrCodeUrl || '');
  const [minRechargeInput, setMinRechargeInput] = useState<string>(settings.minRecharge.toString());
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<string>(settings.minWithdrawal.toString());
  const [noticeInput, setNoticeInput] = useState<string>(settings.notice);
  const [telegramInput, setTelegramInput] = useState<string>(settings.telegramChannel);
  const [whatsappInput, setWhatsappInput] = useState<string>(settings.whatsappSupport);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const refreshAll = () => {
    setSettings(getAdminSettings());
    setRecharges(getRechargeRequests());
    setWithdrawals(getWithdrawalRequests());
    setUsers(getUsers());
    setBets(getBets());
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check admin access (allow if user role is admin, or allow owner to login)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.mobile === '9999999999';

  const handleForceResult = (game: GameType, val: number | 'random' | 'least_payout' | null) => {
    const curSettings = getAdminSettings();
    curSettings.forcedResults[game] = val;
    saveAdminSettings(curSettings);
    setSettings(curSettings);
    soundManager.playClick();
  };

  const handleToggleHouseEdge = () => {
    const curSettings = getAdminSettings();
    curSettings.autoHouseEdge = !curSettings.autoHouseEdge;
    saveAdminSettings(curSettings);
    setSettings(curSettings);
    soundManager.playClick();
  };

  const handleApproveRecharge = (id: string) => {
    soundManager.playClick();
    adminApproveRecharge(id);
    refreshAll();
  };

  const handleRejectRecharge = (id: string) => {
    soundManager.playClick();
    adminRejectRecharge(id);
    refreshAll();
  };

  const handleApproveWithdrawal = (id: string) => {
    soundManager.playClick();
    adminApproveWithdrawal(id);
    refreshAll();
  };

  const handleRejectWithdrawal = (id: string) => {
    soundManager.playClick();
    adminRejectWithdrawal(id);
    refreshAll();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      ...settings,
      upiId: upiIdInput.trim() || 'tggamingempire@ybl',
      payeeName: payeeNameInput.trim() || 'TG Gaming Owner',
      qrCodeUrl: qrCodeInput.trim() || '/assets/aistudio/Screenshot_20261031-165524_02660bea.png',
      minRecharge: parseInt(minRechargeInput, 10) || 100,
      minWithdrawal: parseInt(minWithdrawalInput, 10) || 200,
      notice: noticeInput.trim(),
      telegramChannel: telegramInput.trim(),
      whatsappSupport: whatsappInput.trim(),
    };
    saveAdminSettings(updated);
    setSettings(updated);
    soundManager.playWin();
    setSaveSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleAdjustBalance = (userId: string, isAdd: boolean) => {
    const amt = parseFloat(balanceAdjustAmount);
    if (isNaN(amt) || amt <= 0) return;
    soundManager.playClick();
    updateUserBalance(userId, isAdd ? amt : -amt);
    setBalanceAdjustAmount('');
    refreshAll();
  };

  const pendingRecharges = recharges.filter((r) => r.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  // Calculate live bets for selected game
  const currentBets = bets.filter((b) => b.gameType === selectedGame && b.status === 'pending');
  const greenBetTotal = currentBets.filter((b) => b.selection === 'green').reduce((s, b) => s + b.totalAmount, 0);
  const redBetTotal = currentBets.filter((b) => b.selection === 'red').reduce((s, b) => s + b.totalAmount, 0);
  const violetBetTotal = currentBets.filter((b) => b.selection === 'violet').reduce((s, b) => s + b.totalAmount, 0);
  const bigBetTotal = currentBets.filter((b) => b.selection === 'big').reduce((s, b) => s + b.totalAmount, 0);
  const smallBetTotal = currentBets.filter((b) => b.selection === 'small').reduce((s, b) => s + b.totalAmount, 0);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4 pb-24 text-neutral-100">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-100">TG Gaming Owner Admin Access</h3>
            <p className="text-xs text-neutral-400 mt-1">
              This master panel is reserved for the game owner only. Please log in with owner admin credentials to manage games, players, and payments.
            </p>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-xs space-y-1 text-left">
            <p className="font-bold text-amber-400">⚡ Default Owner Credentials:</p>
            <p className="text-neutral-300 font-mono">Mobile: 9999999999</p>
            <p className="text-neutral-300 font-mono">Password: admin</p>
          </div>

          <button
            onClick={onOpenAuth}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25"
          >
            Log in as Owner / Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-3 space-y-4 pb-24 text-neutral-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-neutral-950 border border-red-900/40 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              Owner Master Control
            </span>
          </div>
          <h2 className="text-xl font-black text-neutral-100 mt-0.5">TG Gaming Admin Panel</h2>
          <p className="text-[11px] text-neutral-400">
            100% full control over game results, UPI, recharges & withdrawals
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 text-center">
        {[
          { id: 'control' as const, label: 'Results', icon: Sparkles },
          { id: 'recharges' as const, label: 'Recharges', icon: CreditCard, count: pendingRecharges.length },
          { id: 'withdrawals' as const, label: 'Withdraws', icon: ArrowDownToLine, count: pendingWithdrawals.length },
          { id: 'users' as const, label: 'Players', icon: Users },
          { id: 'settings' as const, label: 'UPI Setup', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all relative flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GAME RESULT RIGGING & CONTROL */}
      {activeTab === 'control' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Control Next Result (Force Win)</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Whatever color or number you select will be the guaranteed winner next round!
                </p>
              </div>

              {/* Game Selector */}
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value as GameType)}
                className="bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-300 outline-none"
              >
                <option value="wingo_30s">Win Go 30s</option>
                <option value="wingo_1m">Win Go 1Min</option>
                <option value="wingo_3m">Win Go 3Min</option>
              </select>
            </div>

            {/* Current Forced Status */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                  Current Forced Result:
                </span>
                <span className="text-sm font-bold text-neutral-200">
                  {settings.forcedResults[selectedGame] !== null
                    ? typeof settings.forcedResults[selectedGame] === 'number'
                      ? `Number ${settings.forcedResults[selectedGame]} (Fixed)`
                      : settings.forcedResults[selectedGame] === 'least_payout'
                      ? 'House Edge (Minimum Player Payout)'
                      : 'Random'
                    : 'Auto / Normal Fair'}
                </span>
              </div>
              {settings.forcedResults[selectedGame] !== null && (
                <button
                  onClick={() => handleForceResult(selectedGame, null)}
                  className="px-2.5 py-1 text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 cursor-pointer"
                >
                  Reset (Clear)
                </button>
              )}
            </div>

            {/* Quick Force Colors */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Direct Color Win (Force Color):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleForceResult(selectedGame, 1)} // Green (1)
                  className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition cursor-pointer"
                >
                  Force Green (Win)
                </button>
                <button
                  onClick={() => handleForceResult(selectedGame, 0)} // Violet (0)
                  className="py-2.5 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition cursor-pointer"
                >
                  Force Violet (Win)
                </button>
                <button
                  onClick={() => handleForceResult(selectedGame, 2)} // Red (2)
                  className="py-2.5 px-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition cursor-pointer"
                >
                  Force Red (Win)
                </button>
              </div>
            </div>

            {/* Exact Number Picker 0 to 9 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Fix Exact Number (0 to 9):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleForceResult(selectedGame, num)}
                    className={`h-11 rounded-xl font-mono font-bold text-sm flex items-center justify-center border transition cursor-pointer ${
                      settings.forcedResults[selectedGame] === num
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-700 hover:border-amber-500/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto House Edge / Minimum Payout Mode */}
            <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Maximum Company Profit Mode (Auto House Edge)
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Algorithm automatically selects the number that results in the least payout to players!
                  </p>
                </div>
                <button
                  onClick={handleToggleHouseEdge}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.autoHouseEdge ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoHouseEdge ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Live Bet Liability Overview */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <span className="font-bold text-neutral-300 block">
                Live Pool Bets (Current Round Bets in {selectedGame}):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-emerald-950/30 border border-emerald-900/40 rounded-xl">
                  <span className="text-[10px] text-emerald-400 block font-semibold">Green Bet</span>
                  <span className="font-bold text-neutral-100">₹{greenBetTotal}</span>
                </div>
                <div className="p-2 bg-purple-950/30 border border-purple-900/40 rounded-xl">
                  <span className="text-[10px] text-purple-400 block font-semibold">Violet Bet</span>
                  <span className="font-bold text-neutral-100">₹{violetBetTotal}</span>
                </div>
                <div className="p-2 bg-red-950/30 border border-red-900/40 rounded-xl">
                  <span className="text-[10px] text-red-400 block font-semibold">Red Bet</span>
                  <span className="font-bold text-neutral-100">₹{redBetTotal}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-1.5 bg-neutral-900 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block">Big Bet: ₹{bigBetTotal}</span>
                </div>
                <div className="p-1.5 bg-neutral-900 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block">Small Bet: ₹{smallBetTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECHARGE APPROVALS */}
      {activeTab === 'recharges' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-200">
              Player Recharge Requests (Pending: {pendingRecharges.length})
            </h3>
          </div>

          {recharges.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-500">
              No recharge requests found yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recharges.map((req) => (
                <div
                  key={req.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 space-y-2 shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        📱 {req.userMobile}
                      </span>
                      <p className="text-[10px] text-neutral-400">
                        Time: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{req.amount}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">12 Digit UTR No.</span>
                      <span className="font-mono font-bold text-neutral-200 select-all">{req.utr}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      {req.paymentMethod}
                    </span>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRejectRecharge(req.id)}
                        className="flex-1 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApproveRecharge(req.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Add Balance</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {req.status === 'approved' ? 'Approved ✓' : 'Rejected ✗'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-200">
              Player Withdrawal Requests (Pending: {pendingWithdrawals.length})
            </h3>
          </div>

          {withdrawals.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-500">
              No withdrawal requests pending.
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((req) => (
                <div
                  key={req.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        📱 {req.userMobile}
                      </span>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-base font-black text-amber-400 font-mono">
                      ₹{req.amount}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-xs">
                    <span className="text-[10px] text-neutral-500 block">Player Destination (UPI / Bank):</span>
                    <span className="font-mono font-bold text-neutral-200 select-all">{req.upiId}</span>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRejectWithdrawal(req.id)}
                        className="flex-1 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject & Refund</span>
                      </button>
                      <button
                        onClick={() => handleApproveWithdrawal(req.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Paid ✓</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {req.status === 'approved' ? 'Paid ✓' : 'Refunded ✗'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT & BALANCE ADJUSTMENT */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search player by mobile number..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {users
              .filter((u) => u.mobile.includes(searchUser.trim()))
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-200">{u.mobile}</span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[9px] font-bold">
                            OWNER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        Registered: {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300 font-mono">
                        ₹{u.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Add / Deduct balance controls */}
                  <div className="pt-1 flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Amount ₹"
                      value={selectedUserId === u.id ? balanceAdjustAmount : ''}
                      onFocus={() => setSelectedUserId(u.id)}
                      onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                      className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100 outline-none"
                    />
                    <button
                      onClick={() => handleAdjustBalance(u.id, true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => handleAdjustBalance(u.id, false)}
                      className="px-2.5 py-1 bg-red-950 border border-red-700 hover:bg-red-900 text-red-300 font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      - Deduct
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: UPI, QR & OWNER SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>Payment & Owner Settings (UPI Setup)</span>
            </h3>
          </div>

          {saveSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Your UPI ID (Where money is received)
            </label>
            <input
              type="text"
              value={upiIdInput}
              onChange={(e) => setUpiIdInput(e.target.value)}
              placeholder="e.g. tggamingempire@ybl"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Payee Name (Displayed to Players)
            </label>
            <input
              type="text"
              value={payeeNameInput}
              onChange={(e) => setPayeeNameInput(e.target.value)}
              placeholder="e.g. TG Gaming Owner"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              QR Code Image Asset Path / URL
            </label>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              placeholder="/assets/aistudio/Screenshot_20261031-165524_02660bea.png"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Minimum Recharge (₹)
              </label>
              <input
                type="number"
                value={minRechargeInput}
                onChange={(e) => setMinRechargeInput(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Minimum Withdrawal (₹)
              </label>
              <input
                type="number"
                value={minWithdrawalInput}
                onChange={(e) => setMinWithdrawalInput(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Home Notice Ticker Announcement
            </label>
            <textarea
              rows={2}
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Telegram Support Channel Link
            </label>
            <input
              type="text"
              value={telegramInput}
              onChange={(e) => setTelegramInput(e.target.value)}
              placeholder="https://t.me/tggaming"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-100 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              WhatsApp Support Number / Link
            </label>
            <input
              type="text"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="+919999999999"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-100 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition cursor-pointer"
          >
            Save All Settings
          </button>
        </form>
      )}
    </div>
  );
};
