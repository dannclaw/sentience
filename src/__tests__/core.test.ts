import { TreasuryManager } from '../core/treasury';
import { StrategyEngine } from '../core/strategy';
import { RiskManager } from '../core/risk';
import { StrategyAuditor } from '../core/audit';
import { SentienceAPI } from '../core/api';
import { JupiterSwap } from '../integrations/jupiter';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

// Mock implementations for testing
const mockConnection = {
  getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL
  getTokenAccountsByOwner: jest.fn().mockResolvedValue({ value: [] }),
} as unknown as Connection;

const mockWallet = Keypair.generate();

describe('Sentience Core Tests', () => {
  
  describe('TreasuryManager', () => {
    let treasury: TreasuryManager;

    beforeEach(() => {
      treasury = new TreasuryManager(mockConnection, mockWallet.publicKey);
    });

    test('should initialize treasury with zero balance', async () => {
      const state = await treasury.getState();
      expect(state).toBeDefined();
    });

    test('should get total value locked', async () => {
      const tvl = await treasury.getTVL();
      expect(typeof tvl).toBe('number');
      expect(tvl).toBeGreaterThanOrEqual(0);
    });

    test('should get current allocations', async () => {
      const allocations = await treasury.getAllocations();
      expect(allocations).toBeDefined();
      expect(Array.isArray(allocations)).toBe(true);
    });
  });

  describe('StrategyEngine', () => {
    let strategy: StrategyEngine;

    beforeEach(() => {
      strategy = new StrategyEngine({
        rebalanceThreshold: 0.05,
        minApyThreshold: 3.0,
      });
    });

    test('should analyze market opportunities', async () => {
      const opportunities = await strategy.analyzeOpportunities();
      expect(Array.isArray(opportunities)).toBe(true);
    });

    test('should select best strategy based on risk-adjusted returns', async () => {
      const mockOpportunities = [
        { protocol: 'Kamino', apy: 5.5, risk: 0.2, tvl: 1000000 },
        { protocol: 'Marinade', apy: 7.2, risk: 0.15, tvl: 5000000 },
      ];
      
      const selected = strategy.selectBestStrategy(mockOpportunities);
      expect(selected).toBeDefined();
      expect(selected.protocol).toBeDefined();
    });

    test('should calculate risk-adjusted returns', () => {
      const apy = 8.0;
      const volatility = 0.25;
      const sharpe = strategy.calculateRiskAdjustedReturn(apy, volatility);
      expect(sharpe).toBeGreaterThan(0);
    });
  });

  describe('RiskManager', () => {
    let riskManager: RiskManager;

    beforeEach(() => {
      riskManager = new RiskManager({
        maxPositionSize: 0.5,
        maxVolatility: 0.3,
        maxDrawdown: 0.2,
      });
    });

    test('should assess position risk', () => {
      const position = {
        size: 1000,
        volatility: 0.15,
        protocol: 'Kamino',
      };
      
      const assessment = riskManager.assessRisk(position);
      expect(assessment.passed).toBe(true);
      expect(assessment.volatility).toBeDefined();
    });

    test('should reject high volatility positions', () => {
      const position = {
        size: 1000,
        volatility: 0.5, // Too high
        protocol: 'RiskyProtocol',
      };
      
      const assessment = riskManager.assessRisk(position);
      expect(assessment.passed).toBe(false);
    });

    test('should check circuit breaker conditions', () => {
      const dailyReturn = -0.25; // 25% loss
      const shouldHalt = riskManager.checkCircuitBreaker(dailyReturn);
      expect(shouldHalt).toBe(true);
    });

    test('should allow normal operations', () => {
      const dailyReturn = -0.05; // 5% loss
      const shouldHalt = riskManager.checkCircuitBreaker(dailyReturn);
      expect(shouldHalt).toBe(false);
    });
  });

  describe('StrategyAuditor', () => {
    let auditor: StrategyAuditor;

    beforeEach(() => {
      auditor = new StrategyAuditor(mockConnection);
    });

    test('should commit strategy with hash', async () => {
      const strategy = {
        action: 'rebalance',
        from: 'USDC',
        to: 'mSOL',
        amount: 1000,
      };
      
      const riskAssessment = { passed: true, volatility: 0.15 };
      
      const commitment = await auditor.commitStrategy({
        strategy,
        riskAssessment,
        expectedApy: 7.5,
      });
      
      expect(commitment.id).toBeDefined();
      expect(commitment.hash).toBeDefined();
      expect(commitment.timestamp).toBeGreaterThan(0);
    });

    test('should reveal and verify commitment', async () => {
      const strategy = { action: 'hold' };
      const commitment = await auditor.commitStrategy({
        strategy,
        riskAssessment: { passed: true },
        expectedApy: 5.0,
      });
      
      const executionResult = { success: true, actualApy: 5.2 };
      const verified = await auditor.revealAndVerify(commitment.id, executionResult);
      
      expect(verified).toBe(true);
    });

    test('should detect tampered execution', async () => {
      const strategy = { action: 'rebalance', to: 'mSOL' };
      const commitment = await auditor.commitStrategy({
        strategy,
        riskAssessment: { passed: true },
        expectedApy: 7.0,
      });
      
      // Tampered result
      const tamperedResult = { success: true, actualApy: 99.9 };
      
      await expect(
        auditor.revealAndVerify(commitment.id, tamperedResult)
      ).rejects.toThrow();
    });
  });

  describe('SentienceAPI', () => {
    let api: SentienceAPI;

    beforeEach(() => {
      api = new SentienceAPI({
        treasuryWallet: mockWallet,
        connection: mockConnection,
      });
    });

    test('should get yield recommendation', async () => {
      const portfolio = [
        { asset: 'USDC', amount: 10000, currentApy: 0 },
        { asset: 'SOL', amount: 50, currentApy: 0 },
      ];
      
      const recommendation = await api.getRecommendation(portfolio);
      expect(recommendation).toBeDefined();
      expect(recommendation.strategies).toBeDefined();
    });

    test('should quote API pricing', () => {
      const basicQueryPrice = api.getQuote('basic_yield_query');
      expect(basicQueryPrice).toBe(0.001);
      
      const strategyPrice = api.getQuote('strategy_recommendation');
      expect(strategyPrice).toBe(0.01);
      
      const analysisPrice = api.getQuote('full_portfolio_analysis');
      expect(analysisPrice).toBe(0.05);
    });

    test('should process payment for API call', async () => {
      const payment = await api.processPayment(0.01, 'USDC');
      expect(payment).toBeDefined();
      expect(payment.amount).toBe(0.01);
      expect(payment.currency).toBe('USDC');
    });
  });
});

describe('Integration Tests', () => {
  test('full rebalance flow', async () => {
    // This would test the full flow in a real environment
    // For now, just verify components can be instantiated together
    const treasury = new TreasuryManager(mockConnection, mockWallet.publicKey);
    const strategy = new StrategyEngine({});
    const risk = new RiskManager({});
    
    expect(treasury).toBeDefined();
    expect(strategy).toBeDefined();
    expect(risk).toBeDefined();
  });
});
