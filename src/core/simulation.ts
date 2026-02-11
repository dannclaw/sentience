import { Connection } from '@solana/web3.js';
import { LendingPosition, LendingMonitor, RiskLevel } from './lending';

/**
 * Simulation Engine
 * 
 * Simulates trades and strategies before execution.
 * Inspired by DeFi Risk Guardian's simulation-first safety approach.
 * 
 * Features:
 * - Dry-run mode for testing strategies
 * - Expected vs actual outcome comparison
 * - Risk assessment before execution
 * - Judge-friendly demo snapshots
 */

export interface SimulationResult {
  id: string;
  timestamp: number;
  action: 'swap' | 'deposit' | 'withdraw' | 'rebalance' | 'repay';
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

export interface DemoSnapshot {
  title: string;
  timestamp: number;
  scenario: string;
  before: {
    portfolioValue: number;
    allocation: Record<string, number>;
    apy: number;
    riskLevel: string;
  };
  action: {
    type: string;
    description: string;
    expectedOutcome: string;
  };
  after: {
    portfolioValue: number;
    allocation: Record<string, number>;
    apy: number;
    riskLevel: string;
    valueChange: number;
    apyChange: number;
  };
  reasoning: string;
}

export class SimulationEngine {
  private connection: Connection;
  private simulations: SimulationResult[] = [];
  private lendingMonitor: LendingMonitor;

  constructor(connection: Connection) {
    this.connection = connection;
    this.lendingMonitor = new LendingMonitor(connection);
  }

  /**
   * Simulate a strategy before execution
   */
  async simulateStrategy(
    strategy: {
      action: 'swap' | 'deposit' | 'withdraw' | 'rebalance' | 'repay';
      protocol: string;
      from: { asset: string; amount: number };
      to: { asset: string; expectedAmount: number };
      currentPortfolio: {
        totalValue: number;
        allocations: Record<string, number>;
        apy: number;
        riskScore: number;
      };
    }
  ): Promise<SimulationResult> {
    const id = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    // Calculate fees and slippage
    const fees = this.calculateFees(strategy.action, strategy.from.amount);
    const slippage = 0.005; // 0.5% default slippage
    
    const outputValue = strategy.to.expectedAmount * (1 - slippage) - fees;
    
    // Calculate portfolio impact
    const valueChange = outputValue - strategy.from.amount;
    const newTotalValue = strategy.currentPortfolio.totalValue + valueChange;
    
    // Estimate APY change based on protocol
    const apyChange = this.estimateApyChange(strategy);
    
    // Risk assessment
    const warnings: string[] = [];
    let safeToExecute = true;
    
    if (slippage > 0.01) {
      warnings.push(`High slippage: ${(slippage * 100).toFixed(2)}%`);
      safeToExecute = false;
    }
    
    if (valueChange < -strategy.from.amount * 0.02) {
      warnings.push('Significant value loss expected');
      safeToExecute = false;
    }
    
    // Check liquidation risk for lending positions
    const liquidationRisk = await this.checkLiquidationRisk(strategy);
    if (liquidationRisk.increased) {
      warnings.push('Liquidation risk increased');
    }
    
    const result: SimulationResult = {
      id,
      timestamp: Date.now(),
      action: strategy.action,
      protocol: strategy.protocol,
      input: {
        asset: strategy.from.asset,
        amount: strategy.from.amount,
        valueUsd: strategy.from.amount // Simplified
      },
      output: {
        asset: strategy.to.asset,
        expectedAmount: strategy.to.expectedAmount,
        expectedValueUsd: outputValue,
        slippage,
        fees
      },
      portfolioImpact: {
        totalValueBefore: strategy.currentPortfolio.totalValue,
        totalValueAfter: newTotalValue,
        apyBefore: strategy.currentPortfolio.apy,
        apyAfter: strategy.currentPortfolio.apy + apyChange,
        riskScoreBefore: strategy.currentPortfolio.riskScore,
        riskScoreAfter: this.calculateNewRisk(strategy, liquidationRisk)
      },
      riskAssessment: {
        safeToExecute,
        warnings,
        maxSlippageExceeded: slippage > 0.01,
        liquidationRiskIncreased: liquidationRisk.increased
      },
      executionRecommended: safeToExecute && warnings.length === 0
    };
    
    this.simulations.push(result);
    
    console.log(`🧪 Simulation: ${strategy.action} on ${strategy.protocol}`);
    console.log(`   Safe to execute: ${result.executionRecommended ? '✅' : '❌'}`);
    console.log(`   Expected APY: ${result.portfolioImpact.apyAfter.toFixed(2)}%`);
    
    return result;
  }

  /**
   * Create judge-friendly demo snapshot
   */
  createDemoSnapshot(simulation: SimulationResult, reasoning: string): DemoSnapshot {
    return {
      title: `${simulation.action.toUpperCase()} Strategy Simulation`,
      timestamp: simulation.timestamp,
      scenario: `Execute ${simulation.action} on ${simulation.protocol}`,
      before: {
        portfolioValue: simulation.portfolioImpact.totalValueBefore,
        allocation: { 'Current': 100 },
        apy: simulation.portfolioImpact.apyBefore,
        riskLevel: simulation.riskAssessment.safeToExecute ? 'LOW' : 'HIGH'
      },
      action: {
        type: simulation.action,
        description: `${simulation.input.amount} ${simulation.input.asset} → ${simulation.output.asset}`,
        expectedOutcome: `${simulation.output.expectedAmount.toFixed(4)} ${simulation.output.asset} (${simulation.output.expectedValueUsd.toFixed(2)} USD)`
      },
      after: {
        portfolioValue: simulation.portfolioImpact.totalValueAfter,
        allocation: { 'Updated': 100 },
        apy: simulation.portfolioImpact.apyAfter,
        riskLevel: simulation.riskAssessment.safeToExecute ? 'LOW' : 'HIGH',
        valueChange: simulation.portfolioImpact.totalValueAfter - simulation.portfolioImpact.totalValueBefore,
        apyChange: simulation.portfolioImpact.apyAfter - simulation.portfolioImpact.apyBefore
      },
      reasoning
    };
  }

  /**
   * Compare simulated vs actual outcome
   */
  compareOutcome(
    simulationId: string,
    actualResult: {
      actualAmount: number;
      actualValueUsd: number;
      executionTimestamp: number;
    }
  ): {
    simulation: SimulationResult | null;
    accuracy: number;
    deviation: number;
    analysis: string;
  } {
    const simulation = this.simulations.find(s => s.id === simulationId);
    if (!simulation) {
      return {
        simulation: null,
        accuracy: 0,
        deviation: 0,
        analysis: 'Simulation not found'
      };
    }
    
    const expectedValue = simulation.output.expectedValueUsd;
    const actualValue = actualResult.actualValueUsd;
    const deviation = Math.abs((actualValue - expectedValue) / expectedValue * 100);
    const accuracy = Math.max(0, 100 - deviation);
    
    let analysis: string;
    if (deviation < 1) {
      analysis = '✅ Excellent accuracy - simulation matched reality';
    } else if (deviation < 5) {
      analysis = '✅ Good accuracy - within expected variance';
    } else {
      analysis = '⚠️ High deviation - review slippage assumptions';
    }
    
    return {
      simulation,
      accuracy,
      deviation,
      analysis
    };
  }

  /**
   * Get all simulations
   */
  getSimulations(): SimulationResult[] {
    return this.simulations;
  }

  /**
   * Clear simulation history
   */
  clearHistory(): void {
    this.simulations = [];
  }

  // Private helper methods
  private calculateFees(action: string, amount: number): number {
    const feeRates: Record<string, number> = {
      swap: 0.003,      // 0.3%
      deposit: 0.001,   // 0.1%
      withdraw: 0.001,  // 0.1%
      rebalance: 0.005, // 0.5%
      repay: 0.0005     // 0.05%
    };
    return amount * (feeRates[action] || 0.003);
  }

  private estimateApyChange(strategy: any): number {
    // Simplified APY estimation
    const protocolApys: Record<string, number> = {
      kamino: 8.2,
      marginfi: 7.5,
      solend: 6.8,
      marinade: 6.8,
      jito: 7.1
    };
    
    return (protocolApys[strategy.protocol] || 7.0) / 100 * 0.1; // Small adjustment
  }

  private async checkLiquidationRisk(strategy: any): Promise<{ increased: boolean }> {
    // Simplified check
    return { increased: strategy.action === 'withdraw' };
  }

  private calculateNewRisk(strategy: any, liquidationRisk: any): number {
    let baseScore = 50;
    if (strategy.action === 'rebalance') baseScore -= 5;
    if (liquidationRisk.increased) baseScore += 20;
    return Math.min(100, Math.max(0, baseScore));
  }
}

export default SimulationEngine;
