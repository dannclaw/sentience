import { Portfolio } from './treasury';

export interface MarketData {
  prices: Record<string, number>;
  yields: Record<string, number>;
  stakingApy: number;
  riskProfile: RiskProfile;
  currentPortfolio: Portfolio;
}

export interface RiskProfile {
  volatility: number;
  shouldHalt: boolean;
  maxDrawdown: number;
}

export interface Allocation {
  sol: number;
  usdc: number;
  msol: number;
  kamino: Record<string, number>;
  timestamp: number;
}

export class StrategyEngine {
  private readonly REBALANCE_THRESHOLD = 0.05; // 5% drift triggers rebalance
  private readonly TARGET_SOL_ALLOCATION = 0.20; // 20% SOL
  private readonly TARGET_USDC_ALLOCATION = 0.30; // 30% USDC
  private readonly TARGET_MSOL_ALLOCATION = 0.30; // 30% mSOL (staking)
  private readonly TARGET_KAMINO_ALLOCATION = 0.20; // 20% Kamino lending

  optimizeAllocations(data: MarketData): Allocation {
    // Dynamic allocation based on market conditions
    let targetSol = this.TARGET_SOL_ALLOCATION;
    let targetUsdc = this.TARGET_USDC_ALLOCATION;
    let targetMsol = this.TARGET_MSOL_ALLOCATION;
    let targetKamino = this.TARGET_KAMINO_ALLOCATION;

    // Adjust based on market conditions
    const { prices, yields, stakingApy, riskProfile } = data;

    // If staking APY is high, increase mSOL allocation
    if (stakingApy > 5.0) {
      targetMsol += 0.05;
      targetSol -= 0.05;
    }

    // If Kamino yields are attractive, shift more there
    const avgKaminoYield = Object.values(yields).reduce((a, b) => a + b, 0) / Object.values(yields).length;
    if (avgKaminoYield > 8.0) {
      targetKamino += 0.05;
      targetUsdc -= 0.05;
    }

    // Risk-off: Increase USDC, decrease volatile assets
    if (riskProfile.volatility > 0.5) {
      targetUsdc += 0.10;
      targetSol -= 0.05;
      targetMsol -= 0.05;
    }

    // Normalize to ensure sum = 1
    const total = targetSol + targetUsdc + targetMsol + targetKamino;
    targetSol /= total;
    targetUsdc /= total;
    targetMsol /= total;
    targetKamino /= total;

    // Build Kamino allocations across different pools
    const kaminoAllocations: Record<string, number> = {};
    const kaminoPools = Object.keys(yields).sort((a, b) => yields[b] - yields[a]);
    const topPools = kaminoPools.slice(0, 3); // Top 3 pools by APY
    
    topPools.forEach((pool, index) => {
      const weight = [0.5, 0.3, 0.2][index] || 0;
      kaminoAllocations[pool] = targetKamino * weight;
    });

    return {
      sol: targetSol,
      usdc: targetUsdc,
      msol: targetMsol,
      kamino: kaminoAllocations,
      timestamp: Date.now()
    };
  }

  isRebalanceNeeded(target: Allocation, current: Portfolio): boolean {
    const currentTotal = current.totalValue || 1;
    
    const solDrift = Math.abs((current.sol * current.prices?.['SOL'] || 0) / currentTotal - target.sol);
    const usdcDrift = Math.abs(current.usdc / currentTotal - target.usdc);
    const msolDrift = Math.abs((current.msol * current.prices?.['mSOL'] || 0) / currentTotal - target.msol);
    
    return solDrift > this.REBALANCE_THRESHOLD || 
           usdcDrift > this.REBALANCE_THRESHOLD || 
           msolDrift > this.REBALANCE_THRESHOLD;
  }

  calculateExpectedReturn(allocation: Allocation, yields: Record<string, number>, stakingApy: number): number {
    let expectedReturn = 0;
    
    // SOL has no yield (just price appreciation)
    expectedReturn += allocation.sol * 0;
    
    // USDC in Kamino
    const avgKaminoYield = Object.values(yields).reduce((a, b) => a + b, 0) / Object.values(yields).length || 5;
    expectedReturn += allocation.usdc * (avgKaminoYield / 100);
    
    // mSOL staking yield
    expectedReturn += allocation.msol * (stakingApy / 100);
    
    // Kamino lending yield
    let kaminoReturn = 0;
    Object.entries(allocation.kamino).forEach(([pool, weight]) => {
      kaminoReturn += weight * ((yields[pool] || 0) / 100);
    });
    expectedReturn += kaminoReturn;
    
    return expectedReturn * 100; // Return as percentage
  }
}
