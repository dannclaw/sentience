import axios from 'axios';

const JUPITER_API = 'https://quote-api.jup.ag/v6';

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

export class JupiterSwap {
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<SwapQuote> {
    try {
      const response = await axios.get(`${JUPITER_API}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: Math.floor(amount * 1e9), // Convert to lamports/smallest unit
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

  async executeSwap(
    quote: SwapQuote,
    userPublicKey: string
  ): Promise<SwapResult> {
    try {
      // Get swap transaction
      const swapResponse = await axios.post(`${JUPITER_API}/swap`, {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: 10000 // 0.00001 SOL priority fee
      });

      const { swapTransaction } = swapResponse.data;

      // In a real implementation, we would:
      // 1. Deserialize the transaction
      // 2. Sign it with the treasury keypair
      // 3. Send and confirm it

      console.log('Swap transaction prepared:', swapTransaction.slice(0, 50) + '...');

      return {
        signature: 'pending-implementation',
        inputAmount: quote.inAmount / 1e9,
        outputAmount: quote.outAmount / 1e9,
        fee: 0.0035 // 0.35% typical Jupiter fee
      };
    } catch (error) {
      console.error('Error executing Jupiter swap:', error);
      throw error;
    }
  }

  async getRouteInfo(inputMint: string, outputMint: string): Promise<any> {
    try {
      const response = await axios.get(`${JUPITER_API}/route-map`);
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
}
