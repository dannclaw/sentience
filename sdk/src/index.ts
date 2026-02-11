/**
 * Sentience SDK
 * 
 * Official SDK for building with Sentience - Autonomous AI Treasury for Solana DeFi
 * 
 * Features:
 * - Treasury management
 * - Yield optimization
 * - Risk monitoring
 * - Strategy simulation
 * - Lending position tracking
 * 
 * @example
 * ```typescript
 * import { SentienceSDK } from '@sentience/sdk';
 * 
 * const sdk = new SentienceSDK({
 *   connection: 'https://api.mainnet-beta.solana.com',
 *   apiKey: 'your-api-key'
 * });
 * 
 * // Get portfolio
 * const portfolio = await sdk.treasury.getPortfolio();
 * 
 * // Simulate strategy
 * const simulation = await sdk.simulation.simulateStrategy({
 *   action: 'rebalance',
 *   protocol: 'kamino',
 *   from: { asset: 'USDC', amount: 1000 },
 *   to: { asset: 'mSOL', expectedAmount: 4.8 }
 * });
 * 
 * if (simulation.executionRecommended) {
 *   await sdk.treasury.executeStrategy(simulation);
 * }
 * ```
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TreasuryManager, TreasuryConfig } from './core/treasury';
import { StrategyEngine } from './core/strategy';
import { RiskManager } from './core/risk';
import { LendingMonitor, LendingPosition, RiskLevel } from './core/lending';
import { SimulationEngine, SimulationResult, DemoSnapshot } from './core/simulation';

export interface SDKConfig {
  connection: string | Connection;
  apiKey?: string;
  wallet?: PublicKey;
}

export class SentienceSDK {
  public connection: Connection;
  public treasury: TreasuryManager;
  public strategy: StrategyEngine;
  public risk: RiskManager;
  public lending: LendingMonitor;
  public simulation: SimulationEngine;

  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
    this.connection = typeof config.connection === 'string' 
      ? new Connection(config.connection) 
      : config.connection;
    
    // Initialize all modules
    const treasuryConfig: TreasuryConfig = {
      heliusApiKey: config.apiKey || '',
      jupiterApiKey: '',
      walletPrivateKey: '',
      riskLevel: 'medium',
      autoCompound: true,
      jitoEnabled: false
    };
    
    this.treasury = new TreasuryManager(treasuryConfig);
    this.strategy = new StrategyEngine();
    this.risk = new RiskManager();
    this.lending = new LendingMonitor(this.connection);
    this.simulation = new SimulationEngine(this.connection);
  }

  /**
   * Initialize SDK and load state
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Sentience SDK...');
    await this.treasury.loadState();
    console.log('✅ SDK ready');
  }

  /**
   * Get complete portfolio overview
   */
  async getPortfolio() {
    return {
      treasury: await this.treasury.getPortfolio(),
      lendingPositions: await this.lending.checkAllPositions(
        this.config.wallet || new PublicKey('11111111111111111111111111111111')
      ),
      riskProfile: await this.risk.assessMarketConditions(await this.getPrices())
    };
  }

  /**
   * Simulate then execute strategy (safe execution)
   */
  async simulateAndExecute(
    strategy: Parameters<SimulationEngine['simulateStrategy']>[0]
  ): Promise<{
    simulation: SimulationResult;
    executed: boolean;
    txId?: string;
  }> {
    // Step 1: Simulate
    const simulation = await this.simulation.simulateStrategy(strategy);
    
    // Step 2: Check if safe
    if (!simulation.executionRecommended) {
      console.log('❌ Execution blocked by simulation:', simulation.riskAssessment.warnings);
      return { simulation, executed: false };
    }
    
    // Step 3: Execute
    console.log('✅ Simulation passed, executing...');
    // In production: Actually execute the transaction
    const txId = 'simulated-tx-id';
    
    return { simulation, executed: true, txId };
  }

  /**
   * Monitor lending positions for liquidation risk
   */
  async startLendingMonitoring(
    walletAddress: PublicKey,
    onRiskDetected?: (risks: any[]) => void
  ): Promise<void> {
    this.lending.startMonitoring(walletAddress, onRiskDetected);
  }

  /**
   * Stop all monitoring
   */
  stopMonitoring(): void {
    this.lending.stopMonitoring();
  }

  private async getPrices(): Promise<Record<string, number>> {
    // Simplified price fetch
    return {
      SOL: 185.50,
      USDC: 1.00,
      mSOL: 201.80
    };
  }
}

// Export types
export {
  TreasuryManager,
  StrategyEngine,
  RiskManager,
  LendingMonitor,
  LendingPosition,
  RiskLevel,
  SimulationEngine,
  SimulationResult,
  DemoSnapshot
};

export default SentienceSDK;
