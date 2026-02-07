export interface Config {
  heliusApiKey: string;
  walletKey: string;
  rpcEndpoint: string;
  environment: 'devnet' | 'mainnet';
  riskParams: {
    maxPositionSize: number;
    maxVolatility: number;
    maxDrawdown: number;
    minLiquidity: number;
  };
  strategyParams: {
    rebalanceThreshold: number;
    targetAllocations: {
      sol: number;
      usdc: number;
      msol: number;
      kamino: number;
    };
  };
}

export function loadConfig(): Config {
  // Load from environment variables
  return {
    heliusApiKey: process.env.HELIUS_API_KEY || '',
    walletKey: process.env.WALLET_PRIVATE_KEY || '',
    rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
    environment: (process.env.SOLANA_ENV as 'devnet' | 'mainnet') || 'devnet',
    riskParams: {
      maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '0.5'),
      maxVolatility: parseFloat(process.env.MAX_VOLATILITY || '0.3'),
      maxDrawdown: parseFloat(process.env.MAX_DRAWDOWN || '0.2'),
      minLiquidity: parseFloat(process.env.MIN_LIQUIDITY || '1000')
    },
    strategyParams: {
      rebalanceThreshold: parseFloat(process.env.REBALANCE_THRESHOLD || '0.05'),
      targetAllocations: {
        sol: 0.20,
        usdc: 0.30,
        msol: 0.30,
        kamino: 0.20
      }
    }
  };
}

export function validateConfig(config: Config): void {
  if (!config.heliusApiKey) {
    throw new Error('HELIUS_API_KEY is required');
  }
  if (!config.walletKey) {
    throw new Error('WALLET_PRIVATE_KEY is required');
  }
}
