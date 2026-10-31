import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Clock, Award, History, TrendingUp, HelpCircle, X, ChevronRight, AlertCircle, Wallet } from 'lucide-react';
import { Bet, ColorType, GameResult, GameType, SizeType, User } from '../types';
import { addNewResult, getBets, getResultsForGame, placeBet } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface WinGoGameProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenRecharge: () => void;
}

export const WinGoGame: React.FC<WinGoGameProps> = ({
  currentUser,
  onOpenAuth,
  onOpenRecharge,
}) => {
  const [selectedGameType, setSelectedGameType] = useState<GameType>('wingo_1m');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [historyResults, setHistoryResults] = useState<GameResult[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'chart' | 'mybets'>('history');

  // Bet Dialog State
  const [betModalOpen, setBetModalOpen] = useState<boolean>(false);
  const [betSelection, setBetSelection] = useState<{
    type: 'color' | 'number' | 'size';
    value: string | number;
    label: string;
    multiplierText: string;
    bgColor: string;
  } | null>(null);

  const [contractMoney, setContractMoney] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [betMessage, setBetMessage] = useState<string>('');
  const [ruleModalOpen, setRuleModalOpen] = useState<boolean>(false);

  // Win dialog state
  const [winCelebration, setWinCelebration] = useState<{
    show: boolean;
    period: string;
    amount: number;
    number: number;
  } | null>(null);

  // My Bets state
  const [myBets, setMyBets] = useState<Bet[]>([]);

  // Duration in seconds per game mode
  const getDuration = (type: GameType): number => {
    switch (type) {
      case 'wingo_30s': return 30;
      case 'wingo_1m': return 60;
      case 'wingo_3m': return 180;
      default: return 60;
    }
  };

  // Synchronize timer based on wall clock modulo duration
  const lastDrawPeriodRef = useRef<string>('');

  const refreshGameData = () => {
    const list = getResultsForGame(selectedGameType);
    setHistoryResults(list);

    // Compute current period ID based on latest history
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    let nextSeq = 1;
    if (list.length > 0 && list[0].period.startsWith(datePrefix)) {
      const lastSeq = parseInt(list[0].period.slice(-4), 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
    const currentPeriodId = `${datePrefix}${String(nextSeq).padStart(4, '0')}`;
    setCurrentPeriod(currentPeriodId);

    // Refresh my bets
    if (currentUser) {
      const allBets = getBets();
      setMyBets(allBets.filter((b) => b.userId === currentUser.id && b.gameType === selectedGameType));
    }
  };

  useEffect(() => {
    refreshGameData();

    // Listen to storage sync events
    const handleSync = () => refreshGameData();
    window.addEventListener('tg_result_drawn', handleSync);
    window.addEventListener('tg_bets_updated', handleSync);
    window.addEventListener('tg_balance_updated', handleSync);

    return () => {
      window.removeEventListener('tg_result_drawn', handleSync);
      window.removeEventListener('tg_bets_updated', handleSync);
      window.removeEventListener('tg_balance_updated', handleSync);
    };
  }, [selectedGameType, currentUser?.id]);

  // Main countdown timer interval
  useEffect(() => {
    const duration = getDuration(selectedGameType);

    const updateTimer = () => {
      const nowMs = Date.now();
      const currentSeconds = Math.floor(nowMs / 1000) % duration;
      const remaining = duration - currentSeconds;

      setTimeLeft(remaining);

      // Play beep sound for urgent last 5 seconds
      if (remaining <= 5 && remaining >= 1) {
        soundManager.playTick(true);
      }

      // Draw trigger when remaining hits 1 or 0
      if (remaining === duration || remaining === 1) {
        // Prevent duplicate draw calls within same period
        if (currentPeriod && lastDrawPeriodRef.current !== currentPeriod) {
          lastDrawPeriodRef.current = currentPeriod;
          const result = addNewResult(selectedGameType);
          refreshGameData();

          // Check if current user won on this period
          if (currentUser) {
            const allBets = getBets();
            const periodBets = allBets.filter(
              (b) => b.userId === currentUser.id && b.period === result.period && b.status === 'won'
            );
            if (periodBets.length > 0) {
              const totalWon = periodBets.reduce((acc, b) => acc + b.payout, 0);
              soundManager.playWin();
              try {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              } catch {
                // ignore
              }
              setWinCelebration({
                show: true,
                period: result.period,
                amount: totalWon,
                number: result.number,
              });
            }
          }
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedGameType, currentPeriod, currentUser]);

  const isLocked = timeLeft <= 5;

  const handleOpenBet = (
    type: 'color' | 'number' | 'size',
    value: string | number,
    label: string,
    multiplierText: string,
    bgColor: string
  ) => {
    if (isLocked) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    soundManager.playClick();
    setBetSelection({ type, value, label, multiplierText, bgColor });
    setContractMoney(10);
    setMultiplier(1);
    setBetMessage('');
    setBetModalOpen(true);
  };

  const handleConfirmBet = () => {
    if (!currentUser || !betSelection) return;
    const total = contractMoney * multiplier;
    if (currentUser.balance < total) {
      setBetMessage('वॉलेट में पर्याप्त बैलेंस नहीं है!');
      return;
    }

    const res = placeBet(
      currentUser.id,
      currentUser.mobile,
      currentPeriod,
      selectedGameType,
      betSelection.type,
      betSelection.value,
      contractMoney,
      multiplier
    );

    if (res.success) {
      soundManager.playBetPlaced();
      setBetModalOpen(false);
      refreshGameData();
    } else {
      setBetMessage(res.message);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-3 space-y-3 pb-24 text-neutral-100">
      {/* Wallet Balance Bar (Ok Win / Tiranga style) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2 px-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wallet className="w-3 h-3" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-neutral-400 font-semibold">Balance:</span>
            <span className="text-xs font-mono font-black text-amber-300">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenRecharge();
            }}
            className="py-1 px-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-neutral-950 font-bold text-[11px] rounded-lg shadow cursor-pointer"
          >
            + Recharge
          </button>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAuth();
            }}
            className="py-1 px-2.5 bg-amber-500 text-neutral-950 font-bold text-[11px] rounded-lg cursor-pointer"
          >
            Login
          </button>
        )}
      </div>

      {/* Game Mode Switcher */}
      <div className="bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 flex items-center justify-between gap-1 shadow-inner">
        {[
          { id: 'wingo_30s' as GameType, label: 'Win Go 30s', badge: 'Ultra Fast' },
          { id: 'wingo_1m' as GameType, label: 'Win Go 1Min', badge: 'Popular' },
          { id: 'wingo_3m' as GameType, label: 'Win Go 3Min', badge: 'Classic' },
        ].map((mode) => {
          const isSelected = selectedGameType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedGameType(mode.id);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="truncate">{mode.label}</span>
                <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isSelected ? 'text-neutral-950/80' : 'text-amber-400/80'}`}>
                  {mode.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Timer & Current Period Board */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Period Number</span>
            </div>
            <p className="text-xl font-mono font-black text-amber-300 tracking-wider mt-0.5">
              {currentPeriod || '202610310001'}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs text-neutral-400">
              <Clock className={`w-3.5 h-3.5 ${isLocked ? 'text-red-500 animate-spin' : 'text-amber-400'}`} />
              <span>Time Left</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="font-mono text-2xl font-black tracking-widest text-neutral-100 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800 shadow-inner">
                {formatSeconds(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Rule link & Status bar */}
        <div className="flex items-center justify-between pt-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Trading Active</span>
          </div>
          <button
            onClick={() => setRuleModalOpen(true)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* LOCK OVERLAY IF LAST 5 SECONDS */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-neutral-950/85 rounded-3xl flex flex-col items-center justify-center p-4 border border-red-500/40 text-center animate-fade-in shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-2 animate-pulse">
              <span className="font-mono text-4xl font-black text-red-400">{timeLeft}</span>
            </div>
            <h3 className="text-lg font-black text-red-400">Betting Closed</h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs">
              Drawing round result... Please wait!
            </p>
          </div>
        )}

        {/* BETTING BOARD CONTAINER */}
        <div className="space-y-3">
          {/* Top 3 Color Buttons (Green, Violet, Red) */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Green */}
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'green', 'Green', '2x', 'bg-emerald-600')}
              className="group relative overflow-hidden py-3.5 px-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base tracking-wide">Green</span>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-bold">
                  2x Payout
                </span>
              </div>
            </button>

            {/* Violet */}
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'violet', 'Violet', '4.5x', 'bg-purple-600')}
              className="group relative overflow-hidden py-3.5 px-2 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base tracking-wide">Violet</span>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-bold">
                  4.5x Payout
                </span>
              </div>
            </button>

            {/* Red */}
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'red', 'Red', '2x', 'bg-red-600')}
              className="group relative overflow-hidden py-3.5 px-2 rounded-2xl bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base tracking-wide">Red</span>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-bold">
                  2x Payout
                </span>
              </div>
            </button>
          </div>

          {/* Numbers Grid (0 to 9) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-300">Select Number</span>
              <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Direct 9x Payout!
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                let bgStyle = 'bg-red-600';
                let borderStyle = 'border-red-500/40';

                if (num === 0) {
                  bgStyle = 'bg-gradient-to-tr from-red-600 via-purple-600 to-purple-600';
                  borderStyle = 'border-purple-500/40';
                } else if (num === 5) {
                  bgStyle = 'bg-gradient-to-tr from-emerald-600 via-purple-600 to-purple-600';
                  borderStyle = 'border-purple-500/40';
                } else if ([1, 3, 7, 9].includes(num)) {
                  bgStyle = 'bg-gradient-to-b from-emerald-500 to-emerald-700';
                  borderStyle = 'border-emerald-500/40';
                } else {
                  bgStyle = 'bg-gradient-to-b from-red-500 to-red-700';
                  borderStyle = 'border-red-500/40';
                }

                return (
                  <button
                    key={num}
                    disabled={isLocked}
                    onClick={() =>
                      handleOpenBet('number', num, `Number ${num}`, '9x', bgStyle)
                    }
                    className={`h-13 rounded-xl ${bgStyle} border ${borderStyle} text-white font-mono font-black text-xl flex flex-col items-center justify-center shadow hover:brightness-110 active:scale-90 transition cursor-pointer disabled:opacity-50`}
                  >
                    <span>{num}</span>
                    <span className="text-[9px] -mt-1 font-sans font-bold opacity-80">9x</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big / Small Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('size', 'big', 'Big (5-9)', '2x', 'bg-amber-600')}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:brightness-110 text-neutral-950 font-black text-sm flex items-center justify-between shadow-lg shadow-amber-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <span>Big</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-bold text-neutral-900">
                5-9 (2x)
              </span>
            </button>

            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('size', 'small', 'Small (0-4)', '2x', 'bg-sky-600')}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:brightness-110 text-white font-black text-sm flex items-center justify-between shadow-lg shadow-blue-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <span>Small</span>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-bold">
                0-4 (2x)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Game Records / Trend Chart / My Bets */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="flex border-b border-neutral-800 bg-neutral-950">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-bold text-center transition ${
              activeTab === 'history'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Game History
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-3 text-xs font-bold text-center transition ${
              activeTab === 'chart'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Trend Chart
          </button>
          <button
            onClick={() => setActiveTab('mybets')}
            className={`flex-1 py-3 text-xs font-bold text-center transition ${
              activeTab === 'mybets'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            My Bets
          </button>
        </div>

        {/* Tab 1: Game History Table */}
        {activeTab === 'history' && (
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-800 pb-2">
                  <th className="text-left py-2 font-semibold">Period</th>
                  <th className="text-center py-2 font-semibold">Number</th>
                  <th className="text-center py-2 font-semibold">Big/Small</th>
                  <th className="text-right py-2 font-semibold">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {historyResults.slice(0, 15).map((res) => (
                  <tr key={res.period} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 text-neutral-300 font-medium">
                      ...{res.period.slice(-4)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block w-6 h-6 leading-6 text-center rounded-full font-bold text-white text-xs ${
                          res.number === 0
                            ? 'bg-gradient-to-r from-red-500 to-purple-500'
                            : res.number === 5
                            ? 'bg-gradient-to-r from-emerald-500 to-purple-500'
                            : [1, 3, 7, 9].includes(res.number)
                            ? 'bg-emerald-600'
                            : 'bg-red-600'
                        }`}
                      >
                        {res.number}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          res.size === 'big'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-sky-400 bg-sky-500/10'
                        }`}
                      >
                        {res.size === 'big' ? 'Big' : 'Small'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {res.colors.map((c) => (
                          <span
                            key={c}
                            className={`w-3.5 h-3.5 rounded-full inline-block shadow ${
                              c === 'green'
                                ? 'bg-emerald-500'
                                : c === 'red'
                                ? 'bg-red-500'
                                : 'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Visual Trend Chart */}
        {activeTab === 'chart' && (
          <div className="p-3 space-y-3">
            <div className="text-xs text-neutral-400 flex items-center justify-between">
              <span>Last 20 Results Color Trend Flow</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Violet
                </span>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1.5 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
              {historyResults.slice(0, 20).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs text-white shadow ${
                      item.number === 0
                        ? 'bg-gradient-to-r from-red-500 to-purple-500'
                        : item.number === 5
                        ? 'bg-gradient-to-r from-emerald-500 to-purple-500'
                        : [1, 3, 7, 9].includes(item.number)
                        ? 'bg-emerald-600'
                        : 'bg-red-600'
                    }`}
                  >
                    {item.number}
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {item.size === 'big' ? 'B' : 'S'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: My Bets */}
        {activeTab === 'mybets' && (
          <div className="p-3">
            {!currentUser ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-neutral-400">Please login to view your bets</p>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Login Now
                </button>
              </div>
            ) : myBets.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                You have not placed any bets in this mode yet.
              </div>
            ) : (
              <div className="space-y-2">
                {myBets.slice(0, 15).map((bet) => (
                  <div
                    key={bet.id}
                    className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-300 font-bold">
                          Period ...{bet.period.slice(-4)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-bold text-amber-300 uppercase">
                          {bet.selection}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Amount: ₹{bet.totalAmount} (₹{bet.contractAmount} × {bet.multiplier})
                      </p>
                    </div>

                    <div className="text-right">
                      {bet.status === 'won' ? (
                        <div className="text-emerald-400 font-bold">
                          <span>Won: +₹{bet.payout}</span>
                        </div>
                      ) : bet.status === 'lost' ? (
                        <div className="text-red-400 font-semibold">
                          <span>Lost</span>
                        </div>
                      ) : (
                        <div className="text-amber-400 font-semibold animate-pulse">
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BET BOTTOM SHEET / MODAL */}
      {betModalOpen && betSelection && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${betSelection.bgColor}`} />
                <h3 className="font-bold text-sm text-neutral-100">
                  Place Bet: {betSelection.label}
                </h3>
              </div>
              <button
                onClick={() => setBetModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contract Amount selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">
                Contract Money:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setContractMoney(amt);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      contractMoney === amt
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-400">Multiplier:</span>
                <span className="font-bold text-amber-400 font-mono">X{multiplier}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMultiplier((prev) => Math.max(1, prev - 1));
                  }}
                  className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-base flex items-center justify-center border border-neutral-700 cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 grid grid-cols-5 gap-1">
                  {[1, 5, 10, 20, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setMultiplier(m);
                      }}
                      className={`py-2 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                        multiplier === m
                          ? 'bg-amber-500 text-neutral-950 border-amber-400'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      X{m}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMultiplier((prev) => prev + 1);
                  }}
                  className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-base flex items-center justify-center border border-neutral-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Bet Summary & Balance Check */}
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-500 text-[11px] block">Total Bet Amount</span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  ₹{contractMoney * multiplier}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 text-[11px] block">Wallet Balance</span>
                <span className="font-bold text-neutral-200">
                  ₹{currentUser?.balance.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            {betMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-2 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{betMessage}</span>
              </div>
            )}

            {/* Confirm / Cancel Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBetModalOpen(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBet}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                Confirm Bet (₹{contractMoney * multiplier})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIN CELEBRATION MODAL */}
      {winCelebration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-amber-500 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-lg shadow-amber-500/50">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-amber-400 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                Congratulations! You Won!
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Period #{winCelebration.period.slice(-4)} | Result: Number {winCelebration.number}
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                Winning Amount
              </span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                +₹{winCelebration.amount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setWinCelebration(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-neutral-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              Awesome! Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* GAME RULES MODAL */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="font-bold text-base text-amber-400">TG Gaming Owner - Game Rules</h3>
              <button
                onClick={() => setRuleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <h4 className="font-bold text-emerald-400">1. Green (Numbers: 1, 3, 7, 9)</h4>
                <p>If the result is 1, 3, 7, or 9, you receive 2x payout. If result is 5, you get 1.5x payout.</p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <h4 className="font-bold text-red-400">2. Red (Numbers: 2, 4, 6, 8)</h4>
                <p>If the result is 2, 4, 6, or 8, you receive 2x payout. If result is 0, you get 1.5x payout.</p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <h4 className="font-bold text-purple-400">3. Violet (Numbers: 0, 5)</h4>
                <p>If the result is 0 or 5, you receive a massive 4.5x payout!</p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <h4 className="font-bold text-amber-400">4. Exact Number (0 - 9)</h4>
                <p>If your exact number matches the draw result, you receive a direct 9x payout!</p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <h4 className="font-bold text-sky-400">5. Big / Small</h4>
                <p>Big (5, 6, 7, 8, 9) and Small (0, 1, 2, 3, 4) pay 2x your bet amount.</p>
              </div>
            </div>

            <button
              onClick={() => setRuleModalOpen(false)}
              className="w-full py-2.5 bg-neutral-800 text-neutral-200 font-bold text-xs rounded-xl hover:bg-neutral-700 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
