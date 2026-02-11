// API client for connecting dashboard to backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PortfolioData {
  totalValue: number;
  change24h: number;
  apy: number;
  allocations: Array<{
    protocol: string;
    asset: string;
    amount: number;
    apy: number;
    color: string;
    progress: number;
  }>;
}

export interface YieldData {
  protocol: string;
  apy: number;
  tvl: string;
  risk: string;
}

export interface Transaction {
  id: string;
  type: string;
  protocol: string;
  amount: number;
  asset: string;
  timestamp: number;
  status: string;
  txHash: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'running' | 'monitoring' | 'simulating' | 'idle';
  activity: string;
  lastAction: string;
  profit: string;
  uptime: string;
}

export interface SimulationResult {
  id: string;
  timestamp: number;
  action: string;
  protocol: string;
  input: {
    asset: string;
    amount: number;
    valueUsd: number;
  };
  output: {
    asset: string;
    expectedAmount: number;
    expectedValueUsd: number;
    slippage: number;
    fees: number;
  };
  portfolioImpact: {
    totalValueBefore: number;
    totalValueAfter: number;
    apyBefore: number;
    apyAfter: number;
    riskScoreBefore: number;
    riskScoreAfter: number;
  };
  riskAssessment: {
    safeToExecute: boolean;
    warnings: string[];
    maxSlippageExceeded: boolean;
    liquidationRiskIncreased: boolean;
  };
  executionRecommended: boolean;
}

class SentienceAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async health() {
    return this.fetch('/health');
  }

  // Get portfolio data
  async getPortfolio(): Promise<{ success: boolean; data: PortfolioData }> {
    return this.fetch('/api/portfolio');
  }

  // Get yield opportunities
  async getYields(): Promise<{ success: boolean; data: YieldData[] }> {
    return this.fetch('/api/yields');
  }

  // Get transaction history
  async getTransactions(): Promise<{ success: boolean; data: Transaction[] }> {
    return this.fetch('/api/transactions');
  }

  // Get agent statuses
  async getAgents(): Promise<{ success: boolean; data: AgentStatus[] }> {
    return this.fetch('/api/agents');
  }

  // Simulate strategy
  async simulateStrategy(strategy: {
    action: string;
    protocol: string;
    from: { asset: string; amount: number };
    to: { asset: string; expectedAmount: number };
    currentPortfolio: any;
  }): Promise<{ success: boolean; data: SimulationResult }> {
    return this.fetch('/api/simulate', {
      method: 'POST',
      body: JSON.stringify(strategy),
    });
  }

  // Execute strategy
  async executeStrategy(strategy: any): Promise<{ success: boolean; data: { simulation: SimulationResult; executed: boolean; txId?: string } }> {
    return this.fetch('/api/execute', {
      method: 'POST',
      body: JSON.stringify(strategy),
    });
  }

  // Get risk metrics
  async getRisk(): Promise<{ success: boolean; data: any }> {
    return this.fetch('/api/risk');
  }

  // Get lending positions
  async getLendingPositions(wallet: string): Promise<{ success: boolean; data: any[] }> {
    return this.fetch(`/api/lending/positions?wallet=${wallet}`);
  }
}

export const api = new SentienceAPI();
export default SentienceAPI;
