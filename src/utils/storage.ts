import { AdminSettings, Bet, ColorType, GameResult, GameType, RechargeRequest, SizeType, User, WithdrawalRequest } from '../types';

const STORAGE_KEYS = {
  USERS: 'tg_gaming_users_v1',
  CURRENT_USER: 'tg_gaming_current_user_v1',
  SETTINGS: 'tg_gaming_settings_v1',
  RESULTS: 'tg_gaming_results_v1',
  BETS: 'tg_gaming_bets_v1',
  RECHARGES: 'tg_gaming_recharges_v1',
  WITHDRAWALS: 'tg_gaming_withdrawals_v1',
};

// Map number to colors
export const getNumberColors = (num: number): ColorType[] => {
  if (num === 0) return ['red', 'violet'];
  if (num === 5) return ['green', 'violet'];
  if ([1, 3, 7, 9].includes(num)) return ['green'];
  return ['red'];
};

export const getNumberSize = (num: number): SizeType => {
  return num >= 5 ? 'big' : 'small';
};

// Initial admin & demo settings
const DEFAULT_SETTINGS: AdminSettings = {
  upiId: 'tggamingempire@ybl',
  payeeName: 'TG Gaming Owner',
  qrCodeUrl: '/assets/aistudio/Screenshot_20261031-165524_02660bea.png',
  minRecharge: 100,
  minWithdrawal: 200,
  notice: '🔥 Welcome to TG Gaming Owner! India\'s #1 Trusted Color Trading Platform. Instant PhonePe / UPI Recharge available.',
  telegramChannel: 'https://t.me/tggamingowner',
  whatsappSupport: '+919999999999',
  autoHouseEdge: false,
  forcedResults: {
    wingo_30s: null,
    wingo_1m: null,
    wingo_3m: null,
  },
};

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  mobile: '9999999999',
  password: 'admin',
  balance: 100000,
  role: 'admin',
  createdAt: Date.now() - 86400000 * 10,
  totalRecharged: 100000,
  totalWithdrawn: 0,
  totalBetsPlaced: 0,
  status: 'active',
};

// Helper to seed initial game history
const generateSeedHistory = (gameType: GameType): GameResult[] => {
  const list: GameResult[] = [];
  const basePeriodNumber = 20261031000;
  const now = Date.now();
  for (let i = 25; i >= 1; i--) {
    const num = Math.floor(Math.random() * 10);
    list.push({
      period: `${basePeriodNumber + i}`,
      gameType,
      number: num,
      colors: getNumberColors(num),
      size: getNumberSize(num),
      timestamp: now - (25 - i) * 60000,
    });
  }
  return list;
};

// Dispatch custom event to notify all components in real-time
export const notifyStateChange = (type: string, detail?: unknown) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`tg_${type}`, { detail }));
    // Also trigger storage event for cross-tab sync
    try {
      localStorage.setItem('tg_last_sync_timestamp', Date.now().toString());
    } catch {
      // ignore
    }
  }
};

// Initialize default storage data
export const initStorage = () => {
  if (typeof window === 'undefined') return;

  const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!storedSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } else {
    try {
      const parsed = JSON.parse(storedSettings);
      if (parsed.upiId !== 'tggamingempire@ybl' || !parsed.qrCodeUrl) {
        parsed.upiId = 'tggamingempire@ybl';
        parsed.qrCodeUrl = '/assets/aistudio/Screenshot_20261031-165524_02660bea.png';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
    const initialResults: Record<GameType, GameResult[]> = {
      wingo_30s: generateSeedHistory('wingo_30s'),
      wingo_1m: generateSeedHistory('wingo_1m'),
      wingo_3m: generateSeedHistory('wingo_3m'),
    };
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(initialResults));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BETS)) {
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECHARGES)) {
    localStorage.setItem(STORAGE_KEYS.RECHARGES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
  }
};

// User authentication & management
export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [DEFAULT_ADMIN];
  } catch {
    return [DEFAULT_ADMIN];
  }
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyStateChange('users_updated');
};

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Refresh user state from users list to get up-to-date balance
    const users = getUsers();
    const fresh = users.find((u) => u.id === parsed.id);
    return fresh || parsed;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
  notifyStateChange('user_auth_changed');
};

// Register user with ZERO BALANCE strictly as requested!
export const registerUser = (mobile: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const existing = users.find((u) => u.mobile === mobile.trim());
  if (existing) {
    return { success: false, message: 'This mobile number is already registered! Please login.' };
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    mobile: mobile.trim(),
    password: password.trim(),
    balance: 0, // CRITICAL: strictly ZERO balance for new register
    role: mobile.trim() === '9999999999' ? 'admin' : 'user',
    createdAt: Date.now(),
    totalRecharged: 0,
    totalWithdrawn: 0,
    totalBetsPlaced: 0,
    status: 'active',
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  return { success: true, message: 'Registration successful! Initial wallet balance: ₹0.00', user: newUser };
};

export const loginUser = (mobile: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const user = users.find((u) => u.mobile === mobile.trim());

  if (!user) {
    return { success: false, message: 'Account not found! Please register first.' };
  }

  if (user.password !== password.trim()) {
    return { success: false, message: 'Incorrect password! Please try again.' };
  }

  if (user.status === 'banned') {
    return { success: false, message: 'This account has been banned by the administrator.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Login successful!', user };
};

export const updateUserBalance = (userId: string, deltaAmount: number): boolean => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  const newBalance = Math.max(0, Math.round((users[index].balance + deltaAmount) * 100) / 100);
  users[index].balance = newBalance;
  if (deltaAmount > 0) {
    users[index].totalRecharged = (users[index].totalRecharged || 0) + deltaAmount;
  }
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(users[index]);
  }
  notifyStateChange('balance_updated');
  return true;
};

export const adminSetUserBalance = (userId: string, newBalance: number): boolean => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  users[index].balance = Math.max(0, Math.round(newBalance * 100) / 100);
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(users[index]);
  }
  notifyStateChange('balance_updated');
  return true;
};

// Settings
export const getAdminSettings = (): AdminSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAdminSettings = (settings: AdminSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  notifyStateChange('settings_updated');
};

// Game Results
export const getAllResults = (): Record<GameType, GameResult[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : {
      wingo_30s: generateSeedHistory('wingo_30s'),
      wingo_1m: generateSeedHistory('wingo_1m'),
      wingo_3m: generateSeedHistory('wingo_3m'),
    };
  } catch {
    return {
      wingo_30s: [],
      wingo_1m: [],
      wingo_3m: [],
    };
  }
};

export const getResultsForGame = (gameType: GameType): GameResult[] => {
  const all = getAllResults();
  return all[gameType] || [];
};

// Bets
export const getBets = (): Bet[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BETS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveBets = (bets: Bet[]) => {
  localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));
  notifyStateChange('bets_updated');
};

export const placeBet = (
  userId: string,
  userMobile: string,
  period: string,
  gameType: GameType,
  selectionType: 'color' | 'number' | 'size',
  selection: string | number,
  contractAmount: number,
  multiplier: number
): { success: boolean; message: string; bet?: Bet } => {
  const user = getCurrentUser();
  if (!user || user.id !== userId) {
    return { success: false, message: 'Please login first!' };
  }

  const totalAmount = contractAmount * multiplier;
  if (user.balance < totalAmount) {
    return { success: false, message: 'Insufficient wallet balance! Please recharge first.' };
  }

  // Deduct balance
  const successDeduct = updateUserBalance(userId, -totalAmount);
  if (!successDeduct) {
    return { success: false, message: 'Error updating balance.' };
  }

  const newBet: Bet = {
    id: `bet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userMobile,
    period,
    gameType,
    selectionType,
    selection,
    contractAmount,
    multiplier,
    totalAmount,
    status: 'pending',
    payout: 0,
    createdAt: Date.now(),
  };

  const bets = getBets();
  bets.unshift(newBet);
  saveBets(bets);

  // Update user's total bets placed count
  const users = getUsers();
  const uIdx = users.findIndex((u) => u.id === userId);
  if (uIdx !== -1) {
    users[uIdx].totalBetsPlaced = (users[uIdx].totalBetsPlaced || 0) + 1;
    saveUsers(users);
  }

  return { success: true, message: 'Bet placed successfully!', bet: newBet };
};

// Settlement: Calculate winners & payouts when a period draws
export const settlePeriod = (gameType: GameType, result: GameResult) => {
  const bets = getBets();
  let anyUpdated = false;

  bets.forEach((bet) => {
    if (bet.gameType === gameType && bet.period === result.period && bet.status === 'pending') {
      anyUpdated = true;
      bet.resultNumber = result.number;

      let isWin = false;
      let multiplierRate = 0;

      if (bet.selectionType === 'number') {
        if (Number(bet.selection) === result.number) {
          isWin = true;
          multiplierRate = 9; // 9x payout on exact number
        }
      } else if (bet.selectionType === 'size') {
        if (bet.selection === result.size) {
          isWin = true;
          multiplierRate = 2; // 2x payout
        }
      } else if (bet.selectionType === 'color') {
        const selColor = bet.selection as ColorType;
        if (result.colors.includes(selColor)) {
          isWin = true;
          if (selColor === 'violet') {
            multiplierRate = 4.5;
          } else if (result.colors.includes('violet')) {
            // Half win on 0 (red+violet) or 5 (green+violet)
            multiplierRate = 1.5;
          } else {
            multiplierRate = 2; // Full win 2x
          }
        }
      }

      if (isWin) {
        bet.status = 'won';
        bet.payout = Math.round(bet.totalAmount * multiplierRate * 0.98 * 100) / 100; // 2% house commission
        updateUserBalance(bet.userId, bet.payout);
      } else {
        bet.status = 'lost';
        bet.payout = 0;
      }
    }
  });

  if (anyUpdated) {
    saveBets(bets);
  }
};

// Add new result and settle bets
export const addNewResult = (gameType: GameType, forcedNumber?: number | null): GameResult => {
  const settings = getAdminSettings();
  const allResults = getAllResults();
  const currentList = allResults[gameType] || [];
  const bets = getBets();

  // Next Period calculation
  const now = new Date();
  const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  let periodSeq = currentList.length + 1;
  const lastResult = currentList[0];
  if (lastResult && lastResult.period.startsWith(datePrefix)) {
    const lastSeq = parseInt(lastResult.period.slice(-4), 10);
    if (!isNaN(lastSeq)) {
      periodSeq = lastSeq + 1;
    }
  }
  const period = `${datePrefix}${String(periodSeq).padStart(4, '0')}`;

  // Check result logic:
  // 1. Admin forced number for this gameType
  // 2. Auto house edge (pick outcome with lowest payout)
  // 3. Random fair outcome
  let chosenNumber: number;

  const adminForced = settings.forcedResults[gameType];

  if (typeof forcedNumber === 'number' && forcedNumber >= 0 && forcedNumber <= 9) {
    chosenNumber = forcedNumber;
  } else if (typeof adminForced === 'number' && adminForced >= 0 && adminForced <= 9) {
    chosenNumber = adminForced;
    // Reset forced result once consumed
    settings.forcedResults[gameType] = null;
    saveAdminSettings(settings);
  } else if (settings.autoHouseEdge || adminForced === 'least_payout') {
    // Calculate total payout for each number 0-9 for pending bets
    const pendingBets = bets.filter((b) => b.gameType === gameType && b.period === period);
    if (pendingBets.length === 0) {
      chosenNumber = Math.floor(Math.random() * 10);
    } else {
      let lowestPayout = Infinity;
      let bestNumber = 0;

      for (let n = 0; n <= 9; n++) {
        let simulatedPayout = 0;
        const colors = getNumberColors(n);
        const size = getNumberSize(n);

        pendingBets.forEach((b) => {
          if (b.selectionType === 'number' && Number(b.selection) === n) {
            simulatedPayout += b.totalAmount * 9;
          } else if (b.selectionType === 'size' && b.selection === size) {
            simulatedPayout += b.totalAmount * 2;
          } else if (b.selectionType === 'color' && colors.includes(b.selection as ColorType)) {
            simulatedPayout += b.selection === 'violet' ? b.totalAmount * 4.5 : b.totalAmount * 2;
          }
        });

        if (simulatedPayout < lowestPayout) {
          lowestPayout = simulatedPayout;
          bestNumber = n;
        }
      }
      chosenNumber = bestNumber;
    }
  } else {
    // Normal fair random
    chosenNumber = Math.floor(Math.random() * 10);
  }

  const newResult: GameResult = {
    period,
    gameType,
    number: chosenNumber,
    colors: getNumberColors(chosenNumber),
    size: getNumberSize(chosenNumber),
    timestamp: Date.now(),
  };

  currentList.unshift(newResult);
  // Keep last 100 results
  allResults[gameType] = currentList.slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(allResults));

  // Settle bets for this round
  settlePeriod(gameType, newResult);

  notifyStateChange('result_drawn', newResult);
  return newResult;
};

// Recharges (Deposit)
export const getRechargeRequests = (): RechargeRequest[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECHARGES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveRechargeRequests = (list: RechargeRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.RECHARGES, JSON.stringify(list));
  notifyStateChange('recharges_updated');
};

export const createRechargeRequest = (
  userId: string,
  userMobile: string,
  amount: number,
  utr: string,
  paymentMethod: string = 'PhonePe UPI'
): { success: boolean; message: string; request?: RechargeRequest } => {
  if (amount < 100) {
    return { success: false, message: 'Minimum recharge amount is ₹100!' };
  }
  if (!utr || utr.trim().length < 8) {
    return { success: false, message: 'Please enter a valid 12-digit UTR / Reference No.!' };
  }

  const list = getRechargeRequests();
  const existingUtr = list.find((r) => r.utr.trim().toLowerCase() === utr.trim().toLowerCase());
  if (existingUtr) {
    return { success: false, message: 'This UTR number has already been submitted!' };
  }

  const req: RechargeRequest = {
    id: `rc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userMobile,
    amount,
    utr: utr.trim(),
    paymentMethod,
    status: 'pending',
    createdAt: Date.now(),
  };

  list.unshift(req);
  saveRechargeRequests(list);

  return { success: true, message: 'Recharge request submitted! Balance will be credited after admin verification.', request: req };
};

export const adminApproveRecharge = (requestId: string): boolean => {
  const list = getRechargeRequests();
  const req = list.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;

  req.status = 'approved';
  updateUserBalance(req.userId, req.amount);
  saveRechargeRequests(list);
  notifyStateChange('recharge_approved', req);
  return true;
};

export const adminRejectRecharge = (requestId: string, reason = 'Invalid UTR Number'): boolean => {
  const list = getRechargeRequests();
  const req = list.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;

  req.status = 'rejected';
  req.adminNote = reason;
  saveRechargeRequests(list);
  return true;
};

// Withdrawals
export const getWithdrawalRequests = (): WithdrawalRequest[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveWithdrawalRequests = (list: WithdrawalRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
  notifyStateChange('withdrawals_updated');
};

export const createWithdrawalRequest = (
  userId: string,
  userMobile: string,
  amount: number,
  upiId: string,
  bankAccount?: string,
  ifsc?: string
): { success: boolean; message: string; request?: WithdrawalRequest } => {
  const user = getCurrentUser();
  if (!user || user.id !== userId) return { success: false, message: 'Please login first!' };

  if (amount < 200) {
    return { success: false, message: 'Minimum withdrawal amount is ₹200!' };
  }
  if (user.balance < amount) {
    return { success: false, message: 'Insufficient wallet balance!' };
  }

  // Deduct balance immediately
  updateUserBalance(userId, -amount);

  const req: WithdrawalRequest = {
    id: `wd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userMobile,
    amount,
    upiId: upiId.trim(),
    bankAccount: bankAccount?.trim(),
    ifsc: ifsc?.trim(),
    status: 'pending',
    createdAt: Date.now(),
  };

  const list = getWithdrawalRequests();
  list.unshift(req);
  saveWithdrawalRequests(list);

  return { success: true, message: 'Withdrawal request submitted! Funds will be transferred to your account shortly.', request: req };
};

export const adminApproveWithdrawal = (requestId: string): boolean => {
  const list = getWithdrawalRequests();
  const req = list.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;

  req.status = 'approved';
  // Update total withdrawn on user
  const users = getUsers();
  const u = users.find((x) => x.id === req.userId);
  if (u) {
    u.totalWithdrawn = (u.totalWithdrawn || 0) + req.amount;
    saveUsers(users);
  }

  saveWithdrawalRequests(list);
  notifyStateChange('withdrawal_approved', req);
  return true;
};

export const adminRejectWithdrawal = (requestId: string, reason = 'Invalid Bank or UPI Details'): boolean => {
  const list = getWithdrawalRequests();
  const req = list.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;

  req.status = 'rejected';
  req.adminNote = reason;
  // Refund money to user
  updateUserBalance(req.userId, req.amount);
  saveWithdrawalRequests(list);
  return true;
};
