import { DashboardData, PortfolioAsset, KaminoPosition, YieldDataPoint, Transaction, Strategy, RiskMetrics } from './types';

// Mock data generator for the Sentience AI Treasury Dashboard

const generateYieldHistory = (): YieldDataPoint[] => {
  const data: YieldDataPoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  let totalYield = 0;
  let solYield = 0;
  let usdcYield = 0;
  let msolYield = 0;
  let kaminoYield = 0;
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = now - i * dayMs;
    const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Add some random yield each day
    solYield += Math.random() * 50 + 20;
    usdcYield += Math.random() * 80 + 40;
    msolYield += Math.random() * 40 + 15;
    kaminoYield += Math.random() * 120 + 60;
    totalYield = solYield + usdcYield + msolYield + kaminoYield;
    
    data.push({
      timestamp,
      date,
      totalYield: Math.round(totalYield * 100) / 100,
      solYield: Math.round(solYield * 100) / 100,
      usdcYield: Math.round(usdcYield * 100) / 100,
      msolYield: Math.round(msolYield * 100) / 100,
      kaminoYield: Math.round(kaminoYield * 100) / 100,
    });
  }
  
  return data;
};

const generateTransactions = (): Transaction[] => {
  const types: Transaction['type'][] = ['deposit', 'withdraw', 'swap', 'stake', 'harvest', 'rebalance'];
  const assets = ['SOL', 'USDC', 'mSOL', 'JTO', 'BONK'];
  const now = Date.now();
  
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.random() * 1000 + 100;
    const price = asset === 'USDC' ? 1 : Math.random() * 100 + 50;
    const status: Transaction['status'] = Math.random() > 0.9 ? 'pending' : 'completed';
    
    transactions.push({
      id: `tx-${Date.now()}-${i}`,
      type,
      asset,
      amount: Math.round(amount * 100) / 100,
      valueUsd: Math.round(amount * price * 100) / 100,
      timestamp: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      status,
      txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    });
  }
  
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

export const mockDashboardData: DashboardData = {
  portfolio: [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: 2450.5,
      valueUsd: 425390.75,
      price: 173.59,
      priceChange24h: 4.2,
      allocation: 42.5,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 285000,
      valueUsd: 285000,
      price: 1,
      priceChange24h: 0.01,
      allocation: 28.5,
    },
    {
      symbol: 'mSOL',
      name: 'Marinade Staked SOL',
      balance: 890.25,
      valueUsd: 156487.50,
      price: 175.78,
      priceChange24h: 4.1,
      allocation: 15.6,
    },
    {
      symbol: 'JTO',
      name: 'Jito',
      balance: 4250,
      valueUsd: 89325,
      price: 21.02,
      priceChange24h: -2.3,
      allocation: 8.9,
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      balance: 2500000000,
      valueUsd: 44800,
      price: 0.00001792,
      priceChange24h: 12.5,
      allocation: 4.5,
    },
  ],
  kaminoPositions: [
    {
      id: 'kamino-1',
      market: 'SOL-USDC',
      type: 'lend',
      asset: 'USDC',
      amount: 150000,
      valueUsd: 150000,
      apy: 8.45,
    },
    {
      id: 'kamino-2',
      market: 'mSOL-SOL',
      type: 'lend',
      asset: 'mSOL',
      amount: 500,
      valueUsd: 87890,
      apy: 6.82,
    },
    {
      id: 'kamino-3',
      market: 'JTO-USDC',
      type: 'lend',
      asset: 'JTO',
      amount: 2000,
      valueUsd: 42040,
      apy: 12.34,
    },
  ],
  yieldHistory: generateYieldHistory(),
  recentTransactions: generateTransactions(),
  strategies: [
    {
      id: 'strat-1',
      name: 'Conservative Yield',
      description: 'Low-risk lending on Kamino with USDC',
      status: 'active',
      allocation: 30,
      currentApy: 8.45,
      totalValue: 150000,
      lastRebalance: Date.now() - 2 * 60 * 60 * 1000,
      protocol: 'Kamino',
    },
    {
      id: 'strat-2',
      name: 'Liquid Staking',
      description: 'mSOL staking with Marinade',
      status: 'active',
      allocation: 25,
      currentApy: 6.82,
      totalValue: 125000,
      lastRebalance: Date.now() - 24 * 60 * 60 * 1000,
      protocol: 'Marinade',
    },
    {
      id: 'strat-3',
      name: 'Jito MEV Rewards',
      description: 'JitoSOL staking for MEV rewards',
      status: 'active',
      allocation: 20,
      currentApy: 7.15,
      totalValue: 100000,
      lastRebalance: Date.now() - 12 * 60 * 60 * 1000,
      protocol: 'Jito',
    },
    {
      id: 'strat-4',
      name: 'Alpha Farming',
      description: 'Higher risk yield farming on new protocols',
      status: 'active',
      allocation: 15,
      currentApy: 15.67,
      totalValue: 75000,
      lastRebalance: Date.now() - 6 * 60 * 60 * 1000,
      protocol: 'Multiple',
    },
    {
      id: 'strat-5',
      name: 'Stablecoin LP',
      description: 'USD stablecoin liquidity provision',
      status: 'paused',
      allocation: 10,
      currentApy: 4.23,
      totalValue: 50000,
      lastRebalance: Date.now() - 48 * 60 * 60 * 1000,
      protocol: 'Orca',
    },
  ],
  riskMetrics: {
    totalValueLocked: 1000003.25,
    volatility24h: 3.45,
    sharpeRatio: 2.18,
    maxDrawdown: 8.92,
    healthScore: 87,
    liquidAssetsRatio: 45.2,
    concentrationRisk: 32.5,
  },
  lastUpdated: Date.now(),
};

// API function to fetch dashboard data
export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDashboardData;
};
