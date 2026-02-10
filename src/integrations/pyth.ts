/**
 * Pyth Price Feed - Development Version
 * 
 * Returns mock prices for development/testing.
 * No API calls = no errors.
 * 
 * In production, integrate with real Pyth Hermes API.
 */

export interface PriceUpdate {
  price: number;
  conf: number;
  expo: number;
  publishTime: number;
}

export class PythPriceFeed {
  // Mock prices for development
  private mockPrices: Record<string, number> = {
    'SOL': 185.50,
    'USDC': 1.00,
    'USDT': 1.00,
    'mSOL': 201.80,
    'JitoSOL': 186.20,
    'BONK': 0.000015,
    'JUP': 0.85,
    'BTC': 67500.00,
    'ETH': 3450.00
  };

  /**
   * Get price for a token
   * Returns mock price (no API call)
   */
  async getPrice(token: string): Promise<number> {
    return this.mockPrices[token] || 0;
  }

  /**
   * Get prices for multiple tokens
   */
  async getPrices(tokens: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    for (const token of tokens) {
      prices[token] = this.mockPrices[token] || 0;
    }
    
    return prices;
  }

  /**
   * Get price with confidence interval
   */
  async getPriceWithConfidence(token: string): Promise<{
    price: number;
    confidence: number;
    timestamp: number;
  }> {
    const price = this.mockPrices[token] || 0;
    
    return {
      price,
      confidence: price * 0.001,
      timestamp: Date.now() / 1000
    };
  }

  /**
   * Subscribe to price updates
   * Polls every 5 seconds with mock data
   */
  async subscribeToPriceUpdates(
    tokens: string[],
    callback: (prices: Record<string, number>) => void
  ): Promise<void> {
    setInterval(async () => {
      const prices = await this.getPrices(tokens);
      callback(prices);
    }, 5000);
  }
}

export default PythPriceFeed;
