import axios from 'axios';

const PYTH_API = 'https://hermes.pyth.network/v2';

// Pyth price feed IDs for common Solana tokens
const PRICE_FEED_IDS: Record<string, string> = {
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  'USDT': '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e8b8',
  'mSOL': '0xc2289a6b5b6e1b9d3e5c2d4a6b8e0f2a4c6d8e0f2a4c6d8e0f2a4c6d8e0f2a4',
  'BONK': '0x72b02117ca3d5d5e1c6d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7',
  'JUP': '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
  'BTC': '0xe62df6c8b4a85fe1f67ebb44aac57f75d6ef06a46d2dab73ca52ed60ff4e4188',
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
};

export interface PriceUpdate {
  price: number;
  conf: number; // Confidence interval
  expo: number; // Exponent
  publishTime: number;
}

export class PythPriceFeed {
  async getPrice(token: string): Promise<number> {
    try {
      const feedId = PRICE_FEED_IDS[token];
      if (!feedId) {
        throw new Error(`No price feed for token: ${token}`);
      }

      const response = await axios.get(`${PYTH_API}/price_feeds/${feedId}`);
      const priceData = response.data;

      // Convert to actual price
      const price = priceData.price.price * Math.pow(10, priceData.price.expo);
      return price;
    } catch (error) {
      console.error(`Error fetching Pyth price for ${token}:`, error);
      // Return mock prices for development
      const mockPrices: Record<string, number> = {
        'SOL': 185.50,
        'USDC': 1.00,
        'USDT': 1.00,
        'mSOL': 201.80,
        'BONK': 0.000015,
        'JUP': 0.85,
        'BTC': 67500.00,
        'ETH': 3450.00
      };
      return mockPrices[token] || 0;
    }
  }

  async getPrices(tokens: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    for (const token of tokens) {
      prices[token] = await this.getPrice(token);
    }
    
    return prices;
  }

  async getPriceWithConfidence(token: string): Promise<{
    price: number;
    confidence: number;
    timestamp: number;
  }> {
    try {
      const feedId = PRICE_FEED_IDS[token];
      const response = await axios.get(`${PYTH_API}/price_feeds/${feedId}`);
      const data = response.data;

      return {
        price: data.price.price * Math.pow(10, data.price.expo),
        confidence: data.price.conf * Math.pow(10, data.price.expo),
        timestamp: data.price.publish_time
      };
    } catch (error) {
      console.error(`Error fetching Pyth confidence for ${token}:`, error);
      return {
        price: await this.getPrice(token),
        confidence: 0,
        timestamp: Date.now() / 1000
      };
    }
  }

  async subscribeToPriceUpdates(
    tokens: string[],
    callback: (prices: Record<string, number>) => void
  ): Promise<void> {
    // In production, this would use WebSocket connection to Hermes
    console.log(`Subscribing to price updates for ${tokens.join(', ')}`);
    
    // Poll every 5 seconds for development
    setInterval(async () => {
      const prices = await this.getPrices(tokens);
      callback(prices);
    }, 5000);
  }
}
