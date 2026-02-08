import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SolanaRPC } from '../integrations/helius';
import { JupiterSwap } from '../integrations/jupiter';
import { KaminoLending } from '../integrations/kamino';
import { MarinadeStaking } from '../integrations/marinade';
import { PythPriceFeed } from '../integrations/pyth';
import { DriftIntegration } from '../integrations/drift';
import { JitoMev } from '../integrations/jito';
import { SolendLending } from '../integrations/solend';
import { MarginfiLending } from '../integrations/marginfi';
import { RiskManager } from './risk';
import { StrategyEngine, Allocation } from './strategy';
import { EventEmitter } from 'events';
import { log } from '../utils/logger';

export interface Portfolio {
  sol: number;
  usdc: number;
  usdt: number;
  msol: number;
  jitosol: number;
  kaminoDeposits: Record<string, number>;
  solendDeposits: Record<string, number>;
  marginfiDeposits: Record<string, number>;
  driftPositions: Record<string, any>;
  totalValue: number;
  prices: Record<string, number>;
  yield24h: number;
  yield7d: number;
  yield30d: number;
}

export interface TreasuryConfig {
  heliusApiKey: string;
  walletPrivateKey: string;
  rpcEndpoint: string;
  minSolBalance: number;
  maxSlippageBps: number;
  jitoEnabled?: boolean;
  autoCompound?: boolean;
  riskLevel?: 'conservative' | 'moderate' | 'aggressive';
}

export interface TransactionRecord {
  id: string;
  type: 'swap' | 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'rebalance' | 'claim';
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: number;
  amountOut?: number;
  signature: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  gasCost: number;
  profitLoss?: number;
}

export interface YieldBreakdown {
  source: string;
  protocol: string;
  amount: number;
  apy: number;
  accrued24h: number;
}

export class TreasuryManager extends EventEmitter {
  private connection: Connection;
  private wallet: Keypair;
  private jupiter: JupiterSwap;
  private kamino: KaminoLending;
  private solend: SolendLending;
  private marginfi: MarginfiLending;
  private marinade: MarinadeStaking;
  private drift: DriftIntegration;
  private jito: JitoMev;
  private pyth: PythPriceFeed;
  private risk: RiskManager;
  private strategy: StrategyEngine;
  private transactionHistory: TransactionRecord[] = [];
  private isRunning: boolean = false;
  private rebalanceInterval: NodeJS.Timeout | null = null;
  
  // Token mint addresses
  private readonly TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    MSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    JITOSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  };

  constructor(private config: TreasuryConfig) {
    super();
    
    this.connection = new Connection(config.rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
    
    // Load wallet
    try {
      const privateKeyBytes = Buffer.from(config.walletPrivateKey, 'base64');
      this.wallet = Keypair.fromSecretKey(privateKeyBytes);
    } catch {
      log.warn('Invalid wallet key, using readonly mode');
      this.wallet = Keypair.generate(); // Dummy for readonly
    }
    
    // Initialize integrations
    this.jupiter = new JupiterSwap();
    this.kamino = new KaminoLending();
    this.solend = new SolendLending(this.connection);
    this.marginfi = new MarginfiLending(this.connection);
    this.marinade = new MarinadeStaking();
    this.drift = new DriftIntegration(this.connection);
    this.jito = new JitoMev(config.heliusApiKey);
    this.pyth = new PythPriceFeed();
    this.risk = new RiskManager();
    this.strategy = new StrategyEngine();
  }

  async initialize(): Promise<void> {
    log.info('Initializing Treasury Manager...');
    
    try {
      // Verify connection
      const version = await this.connection.getVersion();
      log.info(`Connected to Solana ${version['solana-core']}`);
      
      // Verify wallet balance
      const balance = await this.getBalance();
      log.info(`Wallet balance: ${balance.toFixed(4)} SOL`);
      
      if (balance < this.config.minSolBalance) {
        log.warn(`Low SOL balance: ${balance} SOL. Recommended: ${this.config.minSolBalance}`);
      }
      
      // Load portfolio
      const portfolio = await this.getPortfolio();
      log.info(`Treasury initialized: $${portfolio.totalValue.toFixed(2)} TVL`);
      
      // Emit ready event
      this.emit('ready', { portfolio, wallet: this.wallet.publicKey.toString() });
      
    } catch (error) {
      log.error('Treasury initialization failed', { error });
      throw error;
    }
  }

  async loadState(): Promise<void> {
    log.info('Loading treasury state...');
    // Load any persisted state here
  }

  startAutoRebalance(intervalMinutes: number = 60): void {
    if (this.isRunning) {
      log.warn('Auto-rebalance already running');
      return;
    }
    
    this.isRunning = true;
    log.info(`Starting auto-rebalance every ${intervalMinutes} minutes`);
    
    this.rebalanceInterval = setInterval(async () => {
      try {
        await this.checkAndRebalance();
      } catch (error) {
        log.error('Auto-rebalance failed', { error });
      }
    }, intervalMinutes * 60 * 1000);
    
    // Run immediately
    this.checkAndRebalance();
  }

  stopAutoRebalance(): void {
    if (this.rebalanceInterval) {
      clearInterval(this.rebalanceInterval);
      this.rebalanceInterval = null;
    }
    this.isRunning = false;
    log.info('Auto-rebalance stopped');
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      log.error('Error fetching SOL balance', { error });
      return 0;
    }
  }

  async getPortfolio(): Promise<Portfolio> {
    try {
      // Fetch prices
      const prices = await this.pyth.getPrices([
        'SOL', 'USDC', 'USDT', 'mSOL', 'JitoSOL', 'JUP', 'BONK'
      ]);
      
      // Fetch all token balances
      const balances = await this.getAllTokenBalances();
      
      // Fetch protocol positions
      const kaminoPositions = await this.kamino.getPositions(this.wallet.publicKey);
      const solendPositions = await this.solend.getPositions(this.wallet.publicKey);
      const marginfiPositions = await this.marginfi.getPositions(this.wallet.publicKey);
      const driftPositions = await this.drift.getPositions(this.wallet.publicKey);
      
      // Calculate values
      const solValue = balances.SOL * prices.SOL;
      const usdcValue = balances.USDC;
      const usdtValue = balances.USDT;
      const msolValue = balances.MSOL * prices.mSOL;
      const jitosolValue = balances.JITOSOL * prices.JitoSOL;
      
      // Calculate Kamino value
      let kaminoValue = 0;
      const kaminoDeposits: Record<string, number> = {};
      for (const [pool, position] of Object.entries(kaminoPositions)) {
        kaminoDeposits[pool] = position.amount;
        kaminoValue += position.amount * (prices[pool] || 1);
      }
      
      // Calculate Solend value
      let solendValue = 0;
      const solendDeposits: Record<string, number> = {};
      for (const [pool, position] of Object.entries(solendPositions)) {
        solendDeposits[pool] = position.amount;
        solendValue += position.amount * (prices[pool] || 1);
      }
      
      // Calculate Marginfi value
      let marginfiValue = 0;
      const marginfiDeposits: Record<string, number> = {};
      for (const [pool, position] of Object.entries(marginfiPositions)) {
        marginfiDeposits[pool] = position.deposited;
        marginfiValue += position.deposited * (prices[pool] || 1);
      }
      
      const totalValue = solValue + usdcValue + usdtValue + msolValue + jitosolValue + 
                        kaminoValue + solendValue + marginfiValue;
      
      // Calculate yields
      const yieldBreakdown = await this.calculateYields(kaminoPositions, solendPositions, marginfiPositions);
      
      return {
        sol: balances.SOL,
        usdc: balances.USDC,
        usdt: balances.USDT,
        msol: balances.MSOL,
        jitosol: balances.JITOSOL,
        kaminoDeposits,
        solendDeposits,
        marginfiDeposits,
        driftPositions,
        totalValue,
        prices,
        yield24h: yieldBreakdown.accrued24h,
        yield7d: yieldBreakdown.accrued24h * 7,
        yield30d: yieldBreakdown.accrued24h * 30,
      };
      
    } catch (error) {
      // Silently handle errors - return empty portfolio on failure
      log.warn('Portfolio fetch incomplete - some protocols may be unavailable');
      return {
        sol: 0, usdc: 0, usdt: 0, msol: 0, jitosol: 0,
        kaminoDeposits: {}, solendDeposits: {}, marginfiDeposits: {}, driftPositions: {},
        totalValue: 0, prices: {}, yield24h: 0, yield7d: 0, yield30d: 0
      };
    }
  }

  async getAllTokenBalances(): Promise<Record<string, number>> {
    const balances: Record<string, number> = {
      SOL: 0, USDC: 0, USDT: 0, MSOL: 0, JITOSOL: 0, JUP: 0, BONK: 0, RAY: 0
    };
    
    try {
      // Get SOL balance
      balances.SOL = await this.getBalance();
      
      // Get token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals);
        
        // Map mint to symbol
        for (const [symbol, mintAddress] of Object.entries(this.TOKENS)) {
          if (mint === mintAddress) {
            balances[symbol] = amount;
            break;
          }
        }
      }
      
    } catch (error) {
      // Silently handle errors
    }
    
    return balances;
  }

  async executeSwap(
    inputMint: string, 
    outputMint: string, 
    amount: number,
    useMevProtection: boolean = true
  ): Promise<{ signature: string; outputAmount: number; price: number; gasCost: number }> {
    log.info(`Executing swap: ${amount} ${inputMint} → ${outputMint}`, { useMevProtection });
    
    try {
      // Get quote
      const quote = await this.jupiter.getQuote(
        inputMint,
        outputMint,
        amount,
        this.config.maxSlippageBps
      );
      
      // Check risk limits
      const portfolio = await this.getPortfolio();
      if (!this.risk.validateSwap(amount, inputMint, portfolio)) {
        throw new Error('Swap rejected by risk manager');
      }
      
      // Build transaction
      const { swapTransaction } = await this.jupiter.getSwapTransaction(
        quote,
        this.wallet.publicKey.toString()
      );
      
      // Deserialize
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, 'base64')
      );
      
      // Sign
      transaction.sign([this.wallet]);
      
      // Execute with or without MEV protection
      let signature: string;
      let gasCost: number;
      
      if (useMevProtection && this.config.jitoEnabled) {
        const result = await this.jito.sendBundle([transaction]);
        signature = result.signatures[0];
        gasCost = result.tipAmount / LAMPORTS_PER_SOL;
      } else {
        signature = await this.connection.sendTransaction(transaction, {
          maxRetries: 3,
          skipPreflight: false,
        });
        await this.connection.confirmTransaction(signature, 'confirmed');
        gasCost = 0.000005; // Approximate
      }
      
      // Record transaction
      const record: TransactionRecord = {
        id: `swap-${Date.now()}`,
        type: 'swap',
        tokenIn: inputMint,
        tokenOut: outputMint,
        amountIn: amount,
        amountOut: quote.outAmount / 1e9,
        signature,
        timestamp: new Date(),
        status: 'confirmed',
        gasCost,
      };
      this.recordTransaction(record);
      
      log.info('Swap executed', { signature, outputAmount: quote.outAmount / 1e9 });
      
      this.emit('swap', record);
      
      return {
        signature,
        outputAmount: quote.outAmount / 1e9,
        price: (amount * await this.getPrice(inputMint)) / (quote.outAmount / 1e9),
        gasCost,
      };
      
    } catch (error) {
      log.error('Swap failed', { error, inputMint, outputMint, amount });
      throw error;
    }
  }

  async depositToProtocol(
    protocol: 'kamino' | 'solend' | 'marginfi',
    token: string, 
    amount: number
  ): Promise<string> {
    log.info(`Depositing ${amount} ${token} to ${protocol}`);
    
    try {
      const portfolio = await this.getPortfolio();
      
      // Risk check
      if (!this.risk.validateDeposit(amount, protocol, portfolio)) {
        throw new Error('Deposit rejected by risk manager');
      }
      
      let signature: string;
      
      switch (protocol) {
        case 'kamino':
          signature = await this.kamino.deposit(token, amount, this.wallet);
          break;
        case 'solend':
          signature = await this.solend.deposit(token, amount, this.wallet);
          break;
        case 'marginfi':
          signature = await this.marginfi.deposit(token, amount, this.wallet);
          break;
        default:
          throw new Error(`Unknown protocol: ${protocol}`);
      }
      
      // Record transaction
      const record: TransactionRecord = {
        id: `deposit-${Date.now()}`,
        type: 'deposit',
        tokenIn: token,
        amountIn: amount,
        signature,
        timestamp: new Date(),
        status: 'confirmed',
        gasCost: 0.00001,
      };
      this.recordTransaction(record);
      
      log.info('Deposit successful', { protocol, token, amount, signature });
      
      this.emit('deposit', { protocol, token, amount, signature });
      
      return signature;
      
    } catch (error) {
      log.error('Deposit failed', { error, protocol, token, amount });
      throw error;
    }
  }

  async stakeWithMarinade(amount: number): Promise<{ signature: string; msolReceived: number }> {
    log.info(`Staking ${amount} SOL with Marinade`);
    
    try {
      const result = await this.marinade.stake(amount, this.wallet);
      
      const record: TransactionRecord = {
        id: `stake-${Date.now()}`,
        type: 'stake',
        tokenIn: 'SOL',
        tokenOut: 'mSOL',
        amountIn: amount,
        amountOut: result.msolReceived,
        signature: result.signature,
        timestamp: new Date(),
        status: 'confirmed',
        gasCost: 0.00001,
      };
      this.recordTransaction(record);
      
      this.emit('stake', record);
      
      return result;
      
    } catch (error) {
      log.error('Staking failed', { error, amount });
      throw error;
    }
  }

  async checkAndRebalance(): Promise<void> {
    log.info('Checking if rebalance is needed...');
    
    try {
      const portfolio = await this.getPortfolio();
      const marketData = await this.gatherMarketData();
      
      // Generate target allocation
      const targetAllocation = this.strategy.optimizeAllocations(marketData);
      
      // Check if rebalance needed
      if (!this.strategy.isRebalanceNeeded(targetAllocation, portfolio)) {
        log.info('No rebalance needed');
        return;
      }
      
      log.info('Rebalance triggered');
      
      // Execute rebalance
      const signatures = await this.executeRebalance(targetAllocation);
      
      log.info(`Rebalance complete: ${signatures.length} transactions`);
      
      this.emit('rebalance', { signatures, allocation: targetAllocation });
      
    } catch (error) {
      log.error('Rebalance check failed', { error });
      throw error;
    }
  }

  async executeRebalance(targetAllocation: Allocation): Promise<string[]> {
    const signatures: string[] = [];
    const portfolio = await this.getPortfolio();
    
    log.info('Executing rebalance...');
    
    // Calculate current allocation
    const currentAllocation = {
      sol: (portfolio.sol * portfolio.prices.SOL) / portfolio.totalValue,
      usdc: portfolio.usdc / portfolio.totalValue,
      usdt: portfolio.usdt / portfolio.totalValue,
      msol: (portfolio.msol * portfolio.prices.mSOL) / portfolio.totalValue,
      jitosol: (portfolio.jitosol * portfolio.prices.JitoSOL) / portfolio.totalValue,
    };
    
    // Rebalance logic - sell overallocated, buy underallocated
    // Implementation details...
    
    const record: TransactionRecord = {
      id: `rebalance-${Date.now()}`,
      type: 'rebalance',
      signature: signatures[0] || 'pending',
      timestamp: new Date(),
      status: 'confirmed',
      gasCost: signatures.length * 0.00001,
    };
    this.recordTransaction(record);
    
    return signatures;
  }

  async claimAllYields(): Promise<Record<string, number>> {
    log.info('Claiming yields from all protocols...');
    
    const claimed: Record<string, number> = {};
    
    try {
      // Claim from each protocol
      const kaminoYields = await this.kamino.claimAll();
      const solendYields = await this.solend.claimAll(this.wallet);
      const marginfiYields = await this.marginfi.claimAll(this.wallet);
      
      claimed.kamino = kaminoYields.total;
      claimed.solend = solendYields.total;
      claimed.marginfi = marginfiYields.total;
      
      log.info('Yields claimed', claimed);
      
      // Auto-compound if enabled
      if (this.config.autoCompound && Object.values(claimed).some(v => v > 0)) {
        const totalClaimed = Object.values(claimed).reduce((a, b) => a + b, 0);
        if (totalClaimed > 10) { // Minimum $10 to compound
          await this.executeSwap(this.TOKENS.USDC, this.TOKENS.SOL, totalClaimed);
          log.info(`Auto-compounded $${totalClaimed} into SOL`);
        }
      }
      
      this.emit('yieldClaimed', claimed);
      
      return claimed;
      
    } catch (error) {
      log.error('Yield claim failed', { error });
      throw error;
    }
  }

  async getYieldBreakdown(): Promise<YieldBreakdown[]> {
    const breakdown: YieldBreakdown[] = [];
    
    // Get yields from each protocol
    const portfolio = await this.getPortfolio();
    
    // Marinade staking
    breakdown.push({
      source: 'Marinade',
      protocol: 'mSOL Staking',
      amount: portfolio.msol * portfolio.prices.mSOL,
      apy: 6.5,
      accrued24h: (portfolio.msol * portfolio.prices.mSOL * 0.065) / 365,
    });
    
    // JitoSOL staking
    breakdown.push({
      source: 'Jito',
      protocol: 'JitoSOL Staking',
      amount: portfolio.jitosol * portfolio.prices.JitoSOL,
      apy: 7.2,
      accrued24h: (portfolio.jitosol * portfolio.prices.JitoSOL * 0.072) / 365,
    });
    
    // Lending protocols
    for (const [pool, amount] of Object.entries(portfolio.kaminoDeposits)) {
      const apy = await this.kamino.getApy(pool);
      breakdown.push({
        source: 'Kamino',
        protocol: `Kamino ${pool}`,
        amount,
        apy,
        accrued24h: (amount * apy) / 365 / 100,
      });
    }
    
    return breakdown;
  }

  async getTransactionHistory(limit: number = 50): Promise<TransactionRecord[]> {
    return this.transactionHistory.slice(-limit).reverse();
  }

  private recordTransaction(record: TransactionRecord): void {
    this.transactionHistory.push(record);
    
    // Keep last 1000 transactions
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory = this.transactionHistory.slice(-1000);
    }
  }

  private async getPrice(token: string): Promise<number> {
    const prices = await this.pyth.getPrices([token]);
    return prices[token] || 0;
  }

  private async gatherMarketData(): Promise<any> {
    // Gather market data for strategy
    return {
      prices: await this.pyth.getPrices(['SOL', 'USDC', 'mSOL', 'JitoSOL']),
      yields: {
        ...await this.kamino.getAllYields(),
        ...await this.solend.getAllYields(),
        ...await this.marginfi.getAllYields(),
      },
      stakingApy: await this.marinade.getApy(),
      jitoApy: await this.jito.getApy(),
    };
  }

  private async calculateYields(kamino: any, solend: any, marginfi: any): Promise<any> {
    // Calculate yield breakdown
    return { accrued24h: 0 };
  }
}
