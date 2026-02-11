import { Connection, PublicKey } from '@solana/web3.js';

/**
 * Lending Position Monitor
 * 
 * Tracks lending positions across Solana protocols (Kamino, Marginfi, Solend)
 * Computes LTV, health factors, and liquidation risk in real-time.
 * 
 * Inspired by DeFi Risk Guardian - monitors for liquidation risk
 */

export interface LendingPosition {
  protocol: 'kamino' | 'marginfi' | 'solend';
  market: string;           // e.g., "SOL-USDC"
  deposited: {
    asset: string;
    amount: number;
    valueUsd: number;
  };
  borrowed: {
    asset: string;
    amount: number;
    valueUsd: number;
  };
  ltv: number;              // Loan-to-Value ratio (0-1)
  maxLtv: number;           // Maximum allowed LTV (0-1)
  liquidationThreshold: number;
  healthFactor: number;     // >1 = safe, <1 = liquidatable
  riskLevel: RiskLevel;
}

export enum RiskLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface LiquidationRisk {
  position: LendingPosition;
  riskLevel: RiskLevel;
  bufferUntilLiquidation: number;  // USD buffer
  recommendedAction: string;
}

export class LendingMonitor {
  private connection: Connection;
  private positions: Map<string, LendingPosition> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Start monitoring lending positions
   * Polls every 30 seconds for updates
   */
  startMonitoring(walletAddress: PublicKey, callback?: (risks: LiquidationRisk[]) => void): void {
    console.log(`🔍 LendingMonitor: Started monitoring ${walletAddress.toString().slice(0, 8)}...`);
    
    this.checkInterval = setInterval(async () => {
      const risks = await this.checkAllPositions(walletAddress);
      
      // Alert on WARNING or CRITICAL
      const alerts = risks.filter(r => r.riskLevel !== RiskLevel.SAFE);
      if (alerts.length > 0) {
        console.log(`⚠️ LendingMonitor: ${alerts.length} positions at risk`);
        alerts.forEach(a => this.alertRisk(a));
      }
      
      if (callback) callback(risks);
    }, 30000); // 30 second poll
  }

  /**
   * Check all lending positions for a wallet
   */
  async checkAllPositions(walletAddress: PublicKey): Promise<LiquidationRisk[]> {
    const risks: LiquidationRisk[] = [];
    
    // Check Kamino positions
    const kaminoPositions = await this.fetchKaminoPositions(walletAddress);
    for (const pos of kaminoPositions) {
      risks.push(this.assessRisk(pos));
    }
    
    // Check Marginfi positions
    const marginfiPositions = await this.fetchMarginfiPositions(walletAddress);
    for (const pos of marginfiPositions) {
      risks.push(this.assessRisk(pos));
    }
    
    // Check Solend positions
    const solendPositions = await this.fetchSolendPositions(walletAddress);
    for (const pos of solendPositions) {
      risks.push(this.assessRisk(pos));
    }
    
    return risks;
  }

  /**
   * Assess liquidation risk for a single position
   */
  private assessRisk(position: LendingPosition): LiquidationRisk {
    let riskLevel: RiskLevel;
    let recommendedAction: string;
    
    // Calculate buffer until liquidation
    const bufferUntilLiquidation = position.deposited.valueUsd * position.liquidationThreshold 
                                   - position.borrowed.valueUsd;
    
    // Determine risk level
    if (position.healthFactor >= 1.2) {
      riskLevel = RiskLevel.SAFE;
      recommendedAction = 'No action needed';
    } else if (position.healthFactor >= 1.1) {
      riskLevel = RiskLevel.WARNING;
      recommendedAction = `Consider repaying ${(bufferUntilLiquidation * 0.1).toFixed(2)} USD`;
    } else {
      riskLevel = RiskLevel.CRITICAL;
      recommendedAction = `URGENT: Repay ${(bufferUntilLiquidation + 10).toFixed(2)} USD immediately`;
    }
    
    return {
      position,
      riskLevel,
      bufferUntilLiquidation,
      recommendedAction
    };
  }

  /**
   * Simulate a repay action
   * Returns new health factor after repay
   */
  simulateRepay(position: LendingPosition, repayAmount: number): {
    newHealthFactor: number;
    newLtv: number;
    safe: boolean;
  } {
    const newBorrowed = Math.max(0, position.borrowed.valueUsd - repayAmount);
    const newLtv = newBorrowed / position.deposited.valueUsd;
    const newHealthFactor = position.liquidationThreshold / newLtv;
    
    return {
      newHealthFactor,
      newLtv,
      safe: newHealthFactor >= 1.2
    };
  }

  /**
   * Fetch Kamino lending positions
   */
  private async fetchKaminoPositions(walletAddress: PublicKey): Promise<LendingPosition[]> {
    // In production: Query Kamino SDK/RPC
    // For now: Return mock data for testing
    return [{
      protocol: 'kamino',
      market: 'SOL-USDC',
      deposited: { asset: 'SOL', amount: 100, valueUsd: 18550 },
      borrowed: { asset: 'USDC', amount: 8000, valueUsd: 8000 },
      ltv: 0.431,
      maxLtv: 0.75,
      liquidationThreshold: 0.80,
      healthFactor: 1.855,
      riskLevel: RiskLevel.SAFE
    }];
  }

  /**
   * Fetch Marginfi positions
   */
  private async fetchMarginfiPositions(walletAddress: PublicKey): Promise<LendingPosition[]> {
    // In production: Query Marginfi SDK
    return []; // Mock: No positions
  }

  /**
   * Fetch Solend positions
   */
  private async fetchSolendPositions(walletAddress: PublicKey): Promise<LendingPosition[]> {
    // In production: Query Solend SDK
    return []; // Mock: No positions
  }

  /**
   * Alert on risky positions
   */
  private alertRisk(risk: LiquidationRisk): void {
    const emoji = risk.riskLevel === RiskLevel.CRITICAL ? '🚨' : '⚠️';
    console.log(`${emoji} ${risk.riskLevel}: ${risk.position.protocol} ${risk.position.market}`);
    console.log(`   Health Factor: ${risk.position.healthFactor.toFixed(2)}`);
    console.log(`   Action: ${risk.recommendedAction}`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🔍 LendingMonitor: Stopped monitoring');
    }
  }
}

export default LendingMonitor;
