import { Connection, Cluster, clusterApiUrl } from '@solana/web3.js';

// Environment detection
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV !== 'production',
};

// Network configuration
export const NETWORK: Cluster = (process.env.SOLANA_NETWORK as Cluster) || 'devnet';

// Token mint addresses
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: ENV.IS_PROD 
    ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
  USDT: ENV.IS_PROD
    ? 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    : 'BQcdHdAQW1hczDbBi9hHgXc8MRewIwbXUM1NBQdBQ8YQ',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};

// RPC Endpoints
export const RPC_ENDPOINTS = {
  devnet: process.env.HELIUS_DEVNET_RPC || 'https://api.devnet.solana.com',
  mainnet: process.env.HELIUS_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
  current: ENV.IS_PROD 
    ? (process.env.HELIUS_MAINNET_RPC || clusterApiUrl('mainnet-beta'))
    : (process.env.HELIUS_DEVNET_RPC || clusterApiUrl('devnet')),
};

// Jupiter API
export const JUPITER_CONFIG = {
  v6: 'https://quote-api.jup.ag/v6',
  ultra: ENV.IS_PROD 
    ? 'https://api.jup.ag/ultra/v1'
    : 'https://api.jup.ag/ultra/v1', // Same endpoint, different behavior
};

// Protocol Addresses
export const PROTOCOLS = {
  kamino: {
    lending: ENV.IS_PROD
      ? '7u3HeHxYDLhnCoErrtycNakbVF1uPQDc6gZQG73G2P3'
      : '7u3HeHxYDLhnCoErrtycNakbVF1uPQDc6gZQG73G2P3',
  },
  marinade: {
    staking: ENV.IS_PROD
      ? 'MarBmsSgKXdrN1EZqChw7Pe1fRc4AMNb42zC7SPkW2X'
      : 'MarBmsSgKXdrN1EZqChw7Pe1fRc4AMNb42zC7SPkW2X',
  },
};

// Treasury Configuration
export interface TreasuryConfig {
  heliusApiKey: string;
  walletPrivateKey: string;
  rpcEndpoint: string;
  network: Cluster;
  minSolBalance: number;
  maxSlippageBps: number;
  jitoEnabled?: boolean;
  autoCompound?: boolean;
  riskLevel?: 'conservative' | 'moderate' | 'aggressive';
  riskParams: {
    maxPositionSize: number;
    maxVolatility: number;
    maxDrawdown: number;
    rebalanceThreshold: number;
    minApyThreshold: number;
  };
  apiConfig: {
    port: number;
    corsOrigins: string[];
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
}

// Load configuration based on environment
export function loadConfig(): TreasuryConfig {
  const isProd = ENV.IS_PROD;
  
  return {
    heliusApiKey: process.env.HELIUS_API_KEY || '',
    walletPrivateKey: isProd 
      ? (process.env.WALLET_PRIVATE_KEY || '')
      : (process.env.WALLET_PRIVATE_KEY_DEV || process.env.WALLET_PRIVATE_KEY || ''),
    rpcEndpoint: RPC_ENDPOINTS.current,
    network: NETWORK,
    minSolBalance: parseFloat(process.env.MIN_SOL_BALANCE || '0.05'),
    maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || '50'),
    riskParams: {
      maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '0.5'),
      maxVolatility: parseFloat(process.env.MAX_VOLATILITY || '0.3'),
      maxDrawdown: parseFloat(process.env.MAX_DRAWDOWN || '0.2'),
      rebalanceThreshold: parseFloat(process.env.REBALANCE_THRESHOLD || '0.05'),
      minApyThreshold: parseFloat(process.env.MIN_APY_THRESHOLD || '3.0'),
    },
    apiConfig: {
      port: parseInt(process.env.API_PORT || '3000'),
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 min
    },
  };
}

// Validate configuration
export function validateConfig(config: TreasuryConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.heliusApiKey) {
    errors.push('HELIUS_API_KEY is required');
  }

  if (!config.walletPrivateKey) {
    errors.push('WALLET_PRIVATE_KEY is required');
  }

  if (ENV.IS_PROD) {
    if (config.network !== 'mainnet-beta') {
      errors.push('Production must use mainnet-beta');
    }
    if (config.rpcEndpoint.includes('devnet')) {
      errors.push('Production cannot use devnet RPC');
    }
  }

  if (config.riskParams.maxPositionSize <= 0 || config.riskParams.maxPositionSize > 1) {
    errors.push('MAX_POSITION_SIZE must be between 0 and 1');
  }

  return { valid: errors.length === 0, errors };
}

// Create connection with retry logic
export async function createConnection(endpoint?: string, retries = 3): Promise<Connection> {
  const url = endpoint || RPC_ENDPOINTS.current;
  const connection = new Connection(url, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });

  // Verify connection
  for (let i = 0; i < retries; i++) {
    try {
      const slot = await connection.getSlot();
      console.log(`✅ Connected to ${NETWORK} at slot ${slot}`);
      return connection;
    } catch (error) {
      console.warn(`Connection attempt ${i + 1}/${retries} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }

  throw new Error('Failed to establish connection');
}

// Health check
export async function checkHealth(connection: Connection): Promise<{
  healthy: boolean;
  slot: number;
  blockTime: number | null;
  latency: number;
}> {
  const start = Date.now();
  
  try {
    const [slot, blockTime] = await Promise.all([
      connection.getSlot(),
      connection.getBlockTime(await connection.getSlot()),
    ]);
    
    return {
      healthy: true,
      slot,
      blockTime,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      slot: 0,
      blockTime: null,
      latency: Date.now() - start,
    };
  }
}

// Export environment helpers - these are already exported above
// No need for duplicate exports
