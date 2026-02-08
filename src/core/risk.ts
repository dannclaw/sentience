export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface RiskLimits {
  maxPositionSize: number; // Max % in single asset
  maxVolatility: number;   // Max portfolio volatility
  maxDrawdown: number;     // Max drawdown before halt
  minLiquidity: number;    // Min liquidity requirement
}

export class RiskManager {
  private limits: RiskLimits = {
    maxPositionSize: 0.50,
    maxVolatility: 0.30,
    maxDrawdown: 0.20,
    minLiquidity: 1000
  };

  private priceHistory: Map<string, number[]> = new Map();
  private readonly HISTORY_LENGTH = 100;

  constructor(riskLevel?: 'conservative' | 'moderate' | 'aggressive') {
    if (riskLevel) {
      switch (riskLevel) {
        case 'conservative':
          this.limits = {
            maxPositionSize: 0.30,
            maxVolatility: 0.20,
            maxDrawdown: 0.10,
            minLiquidity: 5000
          };
          break;
        case 'aggressive':
          this.limits = {
            maxPositionSize: 0.70,
            maxVolatility: 0.50,
            maxDrawdown: 0.30,
            minLiquidity: 500
          };
          break;
        default: // moderate uses defaults
          break;
      }
    }
  }

  assessMarketConditions(prices: Record<string, number>): {
    volatility: number;
    shouldHalt: boolean;
    maxDrawdown: number;
  } {
    // Update price history
    Object.entries(prices).forEach(([token, price]) => {
      if (!this.priceHistory.has(token)) {
        this.priceHistory.set(token, []);
      }
      const history = this.priceHistory.get(token)!;
      history.push(price);
      if (history.length > this.HISTORY_LENGTH) {
        history.shift();
      }
    });

    // Calculate volatility (standard deviation of returns)
    const volatility = this.calculateVolatility();
    
    // Calculate max drawdown
    const maxDrawdown = this.calculateMaxDrawdown();

    // Check circuit breakers
    const shouldHalt = volatility > this.limits.maxVolatility || 
                       maxDrawdown > this.limits.maxDrawdown;

    return {
      volatility,
      shouldHalt,
      maxDrawdown
    };
  }

  private calculateVolatility(): number {
    let totalVolatility = 0;
    let count = 0;

    this.priceHistory.forEach((prices, token) => {
      if (prices.length < 2) return;

      // Calculate returns
      const returns: number[] = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }

      // Calculate standard deviation
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);

      totalVolatility += stdDev;
      count++;
    });

    return count > 0 ? totalVolatility / count : 0;
  }

  private calculateMaxDrawdown(): number {
    let maxDrawdown = 0;

    this.priceHistory.forEach((prices) => {
      if (prices.length < 2) return;

      let peak = prices[0];
      for (const price of prices) {
        if (price > peak) {
          peak = price;
        }
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    });

    return maxDrawdown;
  }

  checkPositionSize(positionValue: number, portfolioValue: number): boolean {
    return (positionValue / portfolioValue) <= this.limits.maxPositionSize;
  }

  checkLiquidity(poolLiquidity: number): boolean {
    return poolLiquidity >= this.limits.minLiquidity;
  }

  getRiskLimits(): RiskLimits {
    return { ...this.limits };
  }

  updateRiskLimits(newLimits: Partial<RiskLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
  }

  // Validate swap before execution
  validateSwap(amount: number, inputMint: string, portfolio: any): boolean {
    // Check if swap amount is within position size limits
    const positionValue = amount * (portfolio.prices[inputMint] || 1);
    return this.checkPositionSize(positionValue, portfolio.totalValue);
  }

  // Validate deposit before execution
  validateDeposit(amount: number, protocol: string, portfolio: any): boolean {
    // Check protocol concentration risk
    const depositValue = amount;
    return this.checkPositionSize(depositValue, portfolio.totalValue);
  }
}
