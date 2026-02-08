import axios from 'axios';

// Jupiter Ultra API (recommended) - managed execution
const JUPITER_ULTRA_API = 'https://api.jup.ag/ultra/v1';

// Legacy v6 API (still works but deprecated)
const JUPITER_V6_API = 'https://quote-api.jup.ag/v6';

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  otherAmountThreshold: number;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: number;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export interface SwapResult {
  signature: string;
  inputAmount: number;
  outputAmount: number;
  fee: number;
}

export interface UltraOrderRequest {
  inputMint: string;
  outputMint: string;
  amount: number;
  taker?: string;
}

export interface UltraOrderResponse {
  orderId: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
}

export class JupiterSwap {
  private useUltra: boolean;

  constructor(useUltra: boolean = true) {
    this.useUltra = useUltra;
  }

  // Legacy v6 API - get quote only
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<SwapQuote> {
    try {
      const response = await axios.get(`${JUPITER_V6_API}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: Math.floor(amount * 1e9),
          slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Jupiter quote:', error);
      throw error;
    }
  }

  // Ultra API - Get order (quote + execution data)
  async getUltraOrder(
    inputMint: string,
    outputMint: string,
    amount: number,
    taker?: string
  ): Promise<UltraOrderResponse> {
    try {
      const params: any = {
        inputMint,
        outputMint,
        amount: amount.toString(),
      };
      
      if (taker) {
        params.taker = taker;
      }

      const response = await axios.get(`${JUPITER_ULTRA_API}/order`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Ultra order:', error);
      throw error;
    }
  }

  // Ultra API - Execute swap (managed execution)
  async executeUltraSwap(
    orderId: string,
    signedTransaction: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${JUPITER_ULTRA_API}/execute`, {
        orderId,
        signedTransaction,
      });

      return response.data;
    } catch (error) {
      console.error('Error executing Ultra swap:', error);
      throw error;
    }
  }

  // Legacy v6 swap execution (requires manual transaction building)
  async executeSwap(
    quote: SwapQuote,
    userPublicKey: string
  ): Promise<SwapResult> {
    try {
      const swapResponse = await axios.post(`${JUPITER_V6_API}/swap`, {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: 10000
      });

      const { swapTransaction } = swapResponse.data;

      console.log('Swap transaction prepared:', swapTransaction.slice(0, 50) + '...');

      return {
        signature: 'pending-implementation',
        inputAmount: quote.inAmount / 1e9,
        outputAmount: quote.outAmount / 1e9,
        fee: 0.0035
      };
    } catch (error) {
      console.error('Error executing Jupiter swap:', error);
      throw error;
    }
  }

  async getRouteInfo(): Promise<any> {
    try {
      const response = await axios.get(`${JUPITER_V6_API}/route-map`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route info:', error);
      return null;
    }
  }

  // Token mint addresses on Solana
  static TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
  };

  // Ultra API endpoints for reference
  static ULTRA_ENDPOINTS = {
    ORDER: '/order',
    EXECUTE: '/execute',
    HOLDINGS: '/holdings',
    SEARCH: '/search',
    SHIELD: '/shield'
  };
}
