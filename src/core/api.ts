import { Connection, PublicKey } from '@solana/web3.js';
import { StrategyEngine } from './strategy';
import { PythPriceFeed } from '../integrations/pyth';
import { KaminoLending } from '../integrations/kamino';
import { MarinadeStaking } from '../integrations/marinade';

/**
 * Sentience Yield API
 * 
 * Inspired by CLODDS - Compute API with USDC payments
 * 
 * Other agents can query our yield intelligence for a fee.
 * Revenue goes directly to the treasury!
 */

export interface YieldQuery {
  asset?: string;
  protocol?: string;
  minApy?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface YieldRecommendation {
  asset: string;
  protocol: string;
  apy: number;
  riskScore: number;
  allocation: number;
  reasoning: string;
}

export interface ApiUsage {
  clientId: string;
  queries: number;
  revenue: number;
  lastQuery: number;
}

export class SentienceAPI {
  private connection: Connection;
  private strategy: StrategyEngine;
  private pyth: PythPriceFeed;
  private kamino: KaminoLending;
  private marinade: MarinadeStaking;
  
  private usage: Map<string, ApiUsage> = new Map();
  private totalRevenue: number = 0;
  
  // Pricing (in USDC)
  private readonly PRICING = {
    basicQuery: 0.001,      // $0.001 per basic query
    recommendation: 0.01,   // $0.01 for strategy recommendation
    fullAnalysis: 0.05,     // $0.05 for complete portfolio analysis
  };

  constructor(connection: Connection) {
    this.connection = connection;
    this.strategy = new StrategyEngine();
    this.pyth = new PythPriceFeed();
    this.kamino = new KaminoLending();
    this.marinade = new MarinadeStaking();
  }

  /**
   * GET /api/yields
   * Basic yield data - $0.001 per call
   */
  async getYields(query: YieldQuery): Promise<{
    data: any[];
    timestamp: number;
    cost: number;
  }> {
    const yields = await this.kamino.getCurrentYields();
    
    // Filter based on query
    const filtered = Object.entries(yields)
      .filter(([asset, apy]) => {
        if (query.asset && asset !== query.asset) return false;
        if (query.minApy && apy < query.minApy) return false;
        return true;
      })
      .map(([asset, apy]) => ({
        asset,
        apy,
        protocol: 'Kamino',
        timestamp: Date.now(),
      }));

    return {
      data: filtered,
      timestamp: Date.now(),
      cost: this.PRICING.basicQuery,
    };
  }

  /**
   * GET /api/recommendation
   * Strategy recommendation - $0.01 per call
   */
  async getRecommendation(
    portfolio: {
      assets: Record<string, number>;
      riskTolerance: number;
    }
  ): Promise<{
    recommendations: YieldRecommendation[];
    expectedApy: number;
    riskScore: number;
    cost: number;
  }> {
    // Get current market data
    const prices = await this.pyth.getPrices(['SOL', 'USDC', 'mSOL']);
    const yields = await this.kamino.getCurrentYields();
    const stakingApy = await this.marinade.getStakingApy();

    // Run strategy optimization
    const marketData = {
      prices,
      yields,
      stakingApy,
      riskProfile: {
        volatility: 0.2,
        shouldHalt: false,
        maxDrawdown: 0.1,
      },
      currentPortfolio: {
        sol: portfolio.assets['SOL'] || 0,
        usdc: portfolio.assets['USDC'] || 0,
        msol: portfolio.assets['mSOL'] || 0,
        kaminoDeposits: {},
        totalValue: Object.values(portfolio.assets).reduce((a, b) => a + b, 0),
        prices,
      },
    };

    const allocation = this.strategy.optimizeAllocations(marketData);

    // Generate recommendations
    const recommendations: YieldRecommendation[] = [];
    
    if (allocation.sol > 0) {
      recommendations.push({
        asset: 'SOL',
        protocol: 'Native',
        apy: 0,
        riskScore: 50,
        allocation: allocation.sol * 100,
        reasoning: 'Liquid reserve for opportunities',
      });
    }

    if (allocation.usdc > 0) {
      recommendations.push({
        asset: 'USDC',
        protocol: 'Kamino Lending',
        apy: yields['USDC'] || 8.5,
        riskScore: 20,
        allocation: allocation.usdc * 100,
        reasoning: 'Stable yield with low risk',
      });
    }

    if (allocation.msol > 0) {
      recommendations.push({
        asset: 'mSOL',
        protocol: 'Marinade Staking',
        apy: stakingApy,
        riskScore: 30,
        allocation: allocation.msol * 100,
        reasoning: 'Liquid staking for base yield',
      });
    }

    // Calculate expected APY
    const expectedApy = recommendations.reduce((sum, rec) => {
      return sum + (rec.apy * rec.allocation / 100);
    }, 0);

    return {
      recommendations,
      expectedApy,
      riskScore: portfolio.riskTolerance,
      cost: this.PRICING.recommendation,
    };
  }

  /**
   * GET /api/analysis
   * Full portfolio analysis - $0.05 per call
   */
  async getFullAnalysis(address: string): Promise<{
    portfolio: any;
    analysis: any;
    recommendations: any[];
    cost: number;
  }> {
    // In production, fetch actual portfolio from chain
    const mockPortfolio = {
      address,
      totalValue: 100000,
      assets: {
        SOL: 40000,
        USDC: 30000,
        mSOL: 30000,
      },
    };

    const recommendation = await this.getRecommendation({
      assets: mockPortfolio.assets,
      riskTolerance: 50,
    });

    return {
      portfolio: mockPortfolio,
      analysis: {
        currentAllocation: mockPortfolio.assets,
        efficiency: 85,
        riskLevel: 'medium',
      },
      recommendations: recommendation.recommendations,
      cost: this.PRICING.fullAnalysis,
    };
  }

  /**
   * POST /api/pay
   * Process USDC payment for API usage
   */
  async processPayment(
    clientId: string,
    amount: number
  ): Promise<{ success: boolean; txHash?: string }> {
    // In production:
    // 1. Verify USDC transfer from client
    // 2. Credit their account
    // 3. Add to treasury

    console.log(`💰 Payment received: ${amount} USDC from ${clientId}`);
    
    // Track usage
    const usage = this.usage.get(clientId) || {
      clientId,
      queries: 0,
      revenue: 0,
      lastQuery: 0,
    };
    
    usage.revenue += amount;
    usage.lastQuery = Date.now();
    this.usage.set(clientId, usage);
    
    this.totalRevenue += amount;

    return {
      success: true,
      txHash: 'mock-tx-hash',
    };
  }

  /**
   * GET /api/usage
   * Get API usage stats
   */
  async getUsageStats(): Promise<{
    totalClients: number;
    totalQueries: number;
    totalRevenue: number;
    topClients: ApiUsage[];
  }> {
    const usages = Array.from(this.usage.values());
    
    return {
      totalClients: usages.length,
      totalQueries: usages.reduce((sum, u) => sum + u.queries, 0),
      totalRevenue: this.totalRevenue,
      topClients: usages
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
    };
  }

  /**
   * GET /skill.md
   * OpenClaw-compatible skill file
   */
  getSkillFile(): string {
    return `# Sentience Yield API

An AI-managed treasury sharing yield intelligence with other agents.

## Endpoints

### GET /api/yields
Get current yield rates across protocols.
**Cost:** 0.001 USDC

### GET /api/recommendation  
Get portfolio optimization recommendations.
**Cost:** 0.01 USDC

### GET /api/analysis
Full portfolio analysis with rebalancing suggestions.
**Cost:** 0.05 USDC

## Payment
All payments in USDC on Solana.
Pay-to-use with x402 protocol support.

## Contact
Agent: Sentience
Treasury: 276awy6pQNbQ7mZduJrY5Dp2w6MEjHprHjUD67Kk8qhu
`;
  }
}

export default SentienceAPI;
