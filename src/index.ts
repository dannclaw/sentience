import { SolanaRPC } from './integrations/helius';
import { JupiterSwap } from './integrations/jupiter';
import { KaminoLending } from './integrations/kamino';
import { MarinadeStaking } from './integrations/marinade';
import { PythPriceFeed } from './integrations/pyth';
import { TreasuryManager, TreasuryConfig } from './core/treasury';
import { StrategyEngine } from './core/strategy';
import { RiskManager } from './core/risk';

export class SentienceAgent {
  private rpc: SolanaRPC;
  private jupiter: JupiterSwap;
  private kamino: KaminoLending;
  private marinade: MarinadeStaking;
  private pyth: PythPriceFeed;
  public treasury: TreasuryManager;
  private strategy: StrategyEngine;
  private risk: RiskManager;

  constructor(config: TreasuryConfig) {
    this.rpc = new SolanaRPC(config.heliusApiKey);
    this.jupiter = new JupiterSwap();
    this.kamino = new KaminoLending();
    this.marinade = new MarinadeStaking();
    this.pyth = new PythPriceFeed();
    this.treasury = new TreasuryManager(config);
    this.strategy = new StrategyEngine();
    this.risk = new RiskManager();
  }

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Sentience Agent...');
    
    // Load current portfolio state
    await this.treasury.loadState();
    
    // Verify wallet connection and balance
    const balance = await this.treasury.getBalance();
    console.log(`💰 Treasury Balance: ${balance} SOL`);
    
    console.log('✅ Agent initialized');
  }

  async runStrategyCycle(): Promise<void> {
    try {
      console.log('\n🔄 Running strategy cycle...');
      
      // 1. Gather market data
      const prices = await this.pyth.getPrices(['SOL', 'USDC', 'mSOL']);
      const yields = await this.kamino.getCurrentYields();
      const stakingApy = await this.marinade.getStakingApy();
      
      // 2. Risk assessment
      const riskProfile = await this.risk.assessMarketConditions(prices);
      if (riskProfile.shouldHalt) {
        console.log('🛑 Risk threshold exceeded. Halting operations.');
        return;
      }
      
      // 3. Get portfolio once and reuse
      const portfolio = await this.treasury.getPortfolio();
      
      // 4. Strategy optimization
      const allocations = this.strategy.optimizeAllocations({
        prices,
        yields,
        stakingApy,
        riskProfile,
        currentPortfolio: portfolio
      });
      
      // 5. Execute rebalancing if needed
      const rebalanceNeeded = this.strategy.isRebalanceNeeded(
        allocations,
        portfolio
      );
      
      if (rebalanceNeeded) {
        console.log('📊 Rebalancing required');
        await this.executeRebalance(allocations);
      } else {
        console.log('✅ Portfolio is optimally allocated');
      }
    } catch (error: any) {
      // Silently handle errors - just log a simple message
      console.log('⚠️  Strategy cycle skipped - protocols unavailable');
    }
  }

  private async executeRebalance(targetAllocations: any): Promise<void> {
    console.log('Executing rebalance...');
  }

  async startHeartbeat(): Promise<void> {
    // Run strategy cycle every 5 minutes
    setInterval(async () => {
      await this.runStrategyCycle();
    }, 5 * 60 * 1000);
    
    // Run immediately on start
    await this.runStrategyCycle();
  }
}
