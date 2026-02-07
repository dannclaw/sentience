import { describe, it, expect, beforeEach } from '@jest/globals';
import { TreasuryManager, TreasuryConfig } from '../core/treasury';
import { RiskManager } from '../core/risk';
import { StrategyEngine } from '../core/strategy';

describe('Sentience Core Modules', () => {
  describe('TreasuryManager', () => {
    let treasury: TreasuryManager;
    
    beforeEach(() => {
      const config: TreasuryConfig = {
        heliusApiKey: 'test-api-key',
        walletPrivateKey: 'test-key',
        rpcEndpoint: 'https://api.devnet.solana.com',
        minSolBalance: 0.1,
        maxSlippageBps: 50
      };
      treasury = new TreasuryManager(config);
    });
    
    it('should initialize successfully', async () => {
      await expect(treasury.initialize()).resolves.not.toThrow();
    });
    
    it('should get portfolio', async () => {
      const portfolio = await treasury.getPortfolio();
      expect(portfolio).toHaveProperty('sol');
      expect(portfolio).toHaveProperty('usdc');
      expect(portfolio).toHaveProperty('msol');
      expect(portfolio).toHaveProperty('totalValue');
    });
    
    it('should get balance', async () => {
      const balance = await treasury.getBalance();
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('RiskManager', () => {
    let riskManager: RiskManager;
    
    beforeEach(() => {
      riskManager = new RiskManager();
    });
    
    it('should assess market conditions', () => {
      const prices = {
        'SOL': 185.50,
        'USDC': 1.00,
        'mSOL': 201.80
      };
      
      const assessment = riskManager.assessMarketConditions(prices);
      
      expect(assessment).toHaveProperty('volatility');
      expect(assessment).toHaveProperty('shouldHalt');
      expect(assessment).toHaveProperty('maxDrawdown');
      expect(typeof assessment.volatility).toBe('number');
      expect(typeof assessment.shouldHalt).toBe('boolean');
    });
    
    it('should check position size limits', () => {
      const isValid = riskManager.checkPositionSize(40000, 100000);
      expect(typeof isValid).toBe('boolean');
    });
    
    it('should return risk limits', () => {
      const limits = riskManager.getRiskLimits();
      expect(limits).toHaveProperty('maxPositionSize');
      expect(limits).toHaveProperty('maxVolatility');
      expect(limits).toHaveProperty('maxDrawdown');
    });
  });
  
  describe('StrategyEngine', () => {
    let strategyEngine: StrategyEngine;
    
    beforeEach(() => {
      strategyEngine = new StrategyEngine();
    });
    
    it('should optimize allocations', () => {
      const marketData = {
        prices: {
          'SOL': 185.50,
          'USDC': 1.00,
          'mSOL': 201.80
        },
        yields: {
          'USDC': 8.5,
          'USDT': 7.8
        },
        stakingApy: 6.8,
        riskProfile: {
          volatility: 0.2,
          shouldHalt: false,
          maxDrawdown: 0.05
        },
        currentPortfolio: {
          sol: 10,
          usdc: 1000,
          msol: 5,
          kaminoDeposits: {},
          totalValue: 5000,
          prices: {
            'SOL': 185.50,
            'USDC': 1.00,
            'mSOL': 201.80
          }
        }
      };
      
      const allocation = strategyEngine.optimizeAllocations(marketData);
      
      expect(allocation).toHaveProperty('sol');
      expect(allocation).toHaveProperty('usdc');
      expect(allocation).toHaveProperty('msol');
      expect(allocation).toHaveProperty('kamino');
      expect(allocation).toHaveProperty('timestamp');
      
      // Check allocations sum to ~1
      const total = allocation.sol + allocation.usdc + allocation.msol + 
        Object.values(allocation.kamino).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1, 1);
    });
    
    it('should calculate expected return', () => {
      const allocation = {
        sol: 0.2,
        usdc: 0.3,
        msol: 0.3,
        kamino: { 'USDC': 0.2 },
        timestamp: Date.now()
      };
      
      const yields = { 'USDC': 8.5 };
      const stakingApy = 6.8;
      
      const expectedReturn = strategyEngine.calculateExpectedReturn(
        allocation,
        yields,
        stakingApy
      );
      
      expect(typeof expectedReturn).toBe('number');
      expect(expectedReturn).toBeGreaterThan(0);
    });
  });
});
