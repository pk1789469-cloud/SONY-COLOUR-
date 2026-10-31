export type GameType = 'wingo_30s' | 'wingo_1m' | 'wingo_3m';

export type ColorType = 'green' | 'violet' | 'red';
export type SizeType = 'big' | 'small';

export interface GameResult {
  period: string;
  gameType: GameType;
  number: number; // 0 - 9
  colors: ColorType[]; // [green], [red], [red, violet] (for 0), [green, violet] (for 5)
  size: SizeType; // 0-4 small, 5-9 big
  timestamp: number;
}

export type SelectionType = 'color' | 'number' | 'size';

export interface Bet {
  id: string;
  userId: string;
  userMobile: string;
  period: string;
  gameType: GameType;
  selectionType: SelectionType;
  selection: string | number; // 'green', 'red', 'violet', 0-9, 'big', 'small'
  contractAmount: number; // ₹10, ₹100, ₹500, ₹1000
  multiplier: number; // 1, 5, 10, etc.
  totalAmount: number;
  status: 'pending' | 'won' | 'lost';
  payout: number;
  resultNumber?: number;
  createdAt: number;
}

export interface User {
  id: string;
  mobile: string;
  password?: string;
  balance: number;
  role: 'user' | 'admin';
  createdAt: number;
  totalRecharged: number;
  totalWithdrawn: number;
  totalBetsPlaced: number;
  status: 'active' | 'banned';
}

export interface RechargeRequest {
  id: string;
  userId: string;
  userMobile: string;
  amount: number;
  utr: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  adminNote?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userMobile: string;
  amount: number;
  upiId: string;
  bankAccount?: string;
  ifsc?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  adminNote?: string;
}

export interface AdminSettings {
  upiId: string;
  payeeName: string;
  qrCodeUrl: string;
  minRecharge: number;
  minWithdrawal: number;
  notice: string;
  telegramChannel: string;
  whatsappSupport: string;
  autoHouseEdge: boolean;
  forcedResults: Record<GameType, number | 'random' | 'least_payout' | null>;
}
