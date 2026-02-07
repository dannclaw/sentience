import { Connection, PublicKey } from '@solana/web3.js';
import { TreasuryConfig } from './types';

// Token mint addresses
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};

// Helius RPC configuration
export const HELIUS_CONFIG = {
  devnet: 'https://devnet.helius-rpc.com/?api-key=34a81e92-a934-4832-82dc-53117cac9d25',
  mainnet: 'https://mainnet.helius-rpc.com/?api-key=34a81e92-a934-4832-82dc-53117cac9d25',
};

// Load config from environment or use defaults
export function loadConfig(): TreasuryConfig {
  return {
    heliusApiKey: process.env.HELIUS_API_KEY || '34a81e92-a934-4832-82dc-53117cac9d25',
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY || '',
    rpcEndpoint: process.env.RPC_ENDPOINT || HELIUS_CONFIG.devnet,
    minSolBalance: 0.05,
    maxSlippageBps: 50,
  };
}

// Create Helius connection
export function createHeliusConnection(endpoint?: string): Connection {
  const url = endpoint || HELIUS_CONFIG.devnet;
  return new Connection(url, {
    commitment: 'confirmed',
    wsEndpoint: url.replace('https', 'wss'),
  });
}

// Verify Helius connection
export async function verifyHeliusConnection(connection?: Connection): Promise<{
  healthy: boolean;
  version: string;
  slot: number;
}> {
  const conn = connection || createHeliusConnection();
  
  try {
    const [health, version, slot] = await Promise.all([
      conn.getHealth(),
      conn.getVersion(),
      conn.getSlot(),
    ]);
    
    return {
      healthy: health === 'ok',
      version: version['solana-core'],
      slot,
    };
  } catch (error) {
    console.error('Helius connection failed:', error);
    return {
      healthy: false,
      version: 'unknown',
      slot: 0,
    };
  }
}
