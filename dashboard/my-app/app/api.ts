// Real API client for Sentience Dashboard
// Connects to the backend API server

import { DashboardData, PortfolioAsset, KaminoPosition, YieldDataPoint, Transaction, Strategy, RiskMetrics } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get full dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      const portfolio = await this.getPortfolio();
      const yields = await this.getYields();
      const transactions = await this.getTransactions();
      const strategies = await this.getStrategies();
      const riskMetrics = await this.getRiskMetrics();
      const kaminoPositions = await this.getKaminoPositions();
      const yieldHistory = await this.getYieldHistory();

      return {
        portfolio,
        kaminoPositions,
        yieldHistory,
        recentTransactions: transactions,
        strategies,
        riskMetrics,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to mock data if API is unavailable
      return getMockDashboardData();
    }
  }

  // Get portfolio assets
  async getPortfolio(): Promise<PortfolioAsset[]> {
    try {
      const data = await this.fetch<any>('/api/portfolio');
      return this.transformPortfolio(data);
    } catch {
      return [];
    }
  }

  // Get yield data
  async getYields(): Promise<any> {
    try {
      return await this.fetch<any>('/api/yields');
    } catch {
      return {};
    }
  }

  // Get recent transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      return await this.fetch<Transaction[]>('/api/transactions');
    } catch {
      return [];
    }
  }

  // Get active strategies
  async getStrategies(): Promise<Strategy[]> {
    try {
      return await this.fetch<Strategy[]>('/api/strategies');
    } catch {
      return [];
    }
  }

  // Get risk metrics
  async getRiskMetrics(): Promise<RiskMetrics> {
    try {
      return await this.fetch<RiskMetrics>('/api/risk');
    } catch {
      return {
        totalValueLocked: 0,
        volatility24h: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        healthScore: 0,
        liquidAssetsRatio: 0,
        concentrationRisk: 0,
      };
    }
  }

  // Get Kamino positions
  async getKaminoPositions(): Promise<KaminoPosition[]> {
    try {
      return await this.fetch<KaminoPosition[]>('/api/positions/kamino');
    } catch {
      return [];
    }
  }

  // Get yield history
  async getYieldHistory(): Promise<YieldDataPoint[]> {
    try {
      return await this.fetch<YieldDataPoint[]>('/api/yields/history');
    } catch {
      return generateYieldHistory();
    }
  }

  // Execute swap
  async executeSwap(from: string, to: string, amount: number): Promise<any> {
    return this.fetch<any>(`/api/swap?from=${from}&to=${to}&amount=${amount}`);
  }

  // Execute deposit
  async deposit(protocol: string, token: string, amount: number): Promise<any> {
    return this.fetch<any>(`/api/deposit?protocol=${protocol}&token=${token}&amount=${amount}`);
  }

  // Execute rebalance
  async rebalance(): Promise<any> {
    return this.fetch<any>('/api/rebalance');
  }

  // Transform backend portfolio data to frontend format
  private transformPortfolio(data: any): PortfolioAsset[] {
    const assets: PortfolioAsset[] = [];
    
    if (data.sol > 0) {
      assets.push({
        symbol: 'SOL',
        name: 'Solana',
        balance: data.sol,
        valueUsd: data.sol * (data.prices?.SOL || 170),
        price: data.prices?.SOL || 170,
        priceChange24h: 0,
        allocation: 0,
      });
    }
    
    if (data.usdc > 0) {
      assets.push({
        symbol: 'USDC',
        name: 'USD Coin',
        balance: data.usdc,
        valueUsd: data.usdc,
        price: 1,
        priceChange24h: 0,
        allocation: 0,
      });
    }
    
    if (data.msol > 0) {
      assets.push({
        symbol: 'mSOL',
        name: 'Marinade Staked SOL',
        balance: data.msol,
        valueUsd: data.msol * (data.prices?.mSOL || 175),
        price: data.prices?.mSOL || 175,
        priceChange24h: 0,
        allocation: 0,
      });
    }

    // Calculate allocations
    const totalValue = assets.reduce((sum, a) => sum + a.valueUsd, 0);
    assets.forEach(a => {
      a.allocation = totalValue > 0 ? (a.valueUsd / totalValue) * 100 : 0;
    });

    return assets;
  }
}

// Generate mock yield history as fallback
function generateYieldHistory(): YieldDataPoint[] {
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
}

// Mock data fallback
function getMockDashboardData(): DashboardData {
  return {
    portfolio: [
      { symbol: 'SOL', name: 'Solana', balance: 2450.5, valueUsd: 425390.75, price: 173.59, priceChange24h: 4.2, allocation: 42.5 },
      { symbol: 'USDC', name: 'USD Coin', balance: 285000, valueUsd: 285000, price: 1, priceChange24h: 0.01, allocation: 28.5 },
      { symbol: 'mSOL', name: 'Marinade Staked SOL', balance: 890.25, valueUsd: 156487.50, price: 175.78, priceChange24h: 4.1, allocation: 15.6 },
    ],
    kaminoPositions: [
      { id: 'kamino-1', market: 'SOL-USDC', type: 'lend', asset: 'USDC', amount: 150000, valueUsd: 150000, apy: 8.45 },
      { id: 'kamino-2', market: 'mSOL-SOL', type: 'lend', asset: 'mSOL', amount: 500, valueUsd: 87890, apy: 6.82 },
    ],
    yieldHistory: generateYieldHistory(),
    recentTransactions: [],
    strategies: [
      { id: 'strat-1', name: 'Conservative Yield', description: 'Low-risk lending', status: 'active', allocation: 30, currentApy: 8.45, totalValue: 150000, lastRebalance: Date.now(), protocol: 'Kamino' },
    ],
    riskMetrics: { totalValueLocked: 1000000, volatility24h: 3.45, sharpeRatio: 2.18, maxDrawdown: 8.92, healthScore: 87, liquidAssetsRatio: 45.2, concentrationRisk: 32.5 },
    lastUpdated: Date.now(),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
