// Types for the Sentience AI Treasury Dashboard

export interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
  price: number;
  priceChange24h: number;
  allocation: number;
  logoUrl?: string;
}

export interface KaminoPosition {
  id: string;
  market: string;
  type: 'lend' | 'borrow';
  asset: string;
  amount: number;
  valueUsd: number;
  apy: number;
  healthFactor?: number;
}

export interface YieldDataPoint {
  timestamp: number;
  date: string;
  totalYield: number;
  solYield: number;
  usdcYield: number;
  msolYield: number;
  kaminoYield: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'stake' | 'harvest' | 'rebalance';
  asset: string;
  amount: number;
  valueUsd: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  allocation: number;
  currentApy: number;
  totalValue: number;
  lastRebalance: number;
  protocol: string;
}

export interface RiskMetrics {
  totalValueLocked: number;
  volatility24h: number;
  sharpeRatio: number;
  maxDrawdown: number;
  healthScore: number;
  liquidAssetsRatio: number;
  concentrationRisk: number;
}

export interface DashboardData {
  portfolio: PortfolioAsset[];
  kaminoPositions: KaminoPosition[];
  yieldHistory: YieldDataPoint[];
  recentTransactions: Transaction[];
  strategies: Strategy[];
  riskMetrics: RiskMetrics;
  lastUpdated: number;
}
