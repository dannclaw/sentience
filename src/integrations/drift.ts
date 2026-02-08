import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram } from '@solana/web3.js';
import axios from 'axios';

export interface DriftPosition {
  marketIndex: number;
  market: string;
  baseAssetAmount: number;
  quoteAssetAmount: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  liquidationPrice: number;
  leverage: number;
  marginRatio: number;
}

export interface SpotPosition {
  marketIndex: number;
  token: string;
  scaledBalance: number;
  openBids: number;
  openAsks: number;
  cumulativeDeposits: number;
}

export interface DriftMarketInfo {
  marketIndex: number;
  symbol: string;
  oracle: string;
  markPrice: number;
  fundingRate: number;
  volume24h: number;
  openInterest: number;
}

export class DriftIntegration {
  private readonly DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH');
  private readonly API_URL = 'https://mainnet-beta.api.drift.trade';

  constructor(private connection: Connection) {}

  async getMarkets(): Promise<DriftMarketInfo[]> {
    try {
      const response = await axios.get(`${this.API_URL}/markets`, { timeout: 10000 });
      return response.data.markets.map((market: any) => ({
        marketIndex: market.marketIndex,
        symbol: market.symbol,
        oracle: market.oracle,
        markPrice: market.markPrice,
        fundingRate: market.fundingRate,
        volume24h: market.volume24h,
        openInterest: market.openInterest,
      }));
    } catch (error) {
      console.error('Failed to fetch Drift markets', error);
      return [];
    }
  }

  async getPositions(wallet: PublicKey): Promise<Record<string, DriftPosition>> {
    try {
      const response = await axios.get(
        `${this.API_URL}/user/${wallet.toString()}/positions`,
        { timeout: 10000 }
      );

      const positions: Record<string, DriftPosition> = {};
      for (const perpPosition of response.data.perpPositions || []) {
        if (perpPosition.baseAssetAmount !== 0) {
          positions[perpPosition.market] = {
            marketIndex: perpPosition.marketIndex,
            market: perpPosition.market,
            baseAssetAmount: perpPosition.baseAssetAmount,
            quoteAssetAmount: perpPosition.quoteAssetAmount,
            entryPrice: perpPosition.entryPrice,
            markPrice: perpPosition.markPrice,
            unrealizedPnl: perpPosition.unrealizedPnl,
            realizedPnl: perpPosition.realizedPnl,
            liquidationPrice: perpPosition.liquidationPrice,
            leverage: perpPosition.leverage,
            marginRatio: perpPosition.marginRatio,
          };
        }
      }
      return positions;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No positions exist yet - return empty
        return {};
      }
      console.error(`Failed to fetch Drift positions for ${wallet.toString()}`, error.message);
      return {};
    }
  }

  async openPerpPosition(
    marketIndex: number,
    side: 'long' | 'short',
    size: number,
    wallet: Keypair,
    limitPrice?: number
  ): Promise<string> {
    console.log(`Opening ${side} position on market ${marketIndex}, size: ${size}`);
    const transaction = new Transaction();
    transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 }));
    
    // Placeholder for actual SDK implementation
    throw new Error('Install @drift-labs/sdk for production use');
  }

  async closePosition(marketIndex: number, wallet: Keypair, limitPrice?: number): Promise<{ signature: string; pnl: number }> {
    console.log(`Closing position on market ${marketIndex}`);
    throw new Error('Install @drift-labs/sdk for production use');
  }

  async depositCollateral(amount: number, token: string, wallet: Keypair): Promise<string> {
    console.log(`Depositing ${amount} ${token} as collateral`);
    throw new Error('Install @drift-labs/sdk for production use');
  }

  async withdrawCollateral(amount: number, token: string, wallet: Keypair): Promise<string> {
    console.log(`Withdrawing ${amount} ${token} collateral`);
    throw new Error('Install @drift-labs/sdk for production use');
  }

  async getMarketInfo(marketIndex: number): Promise<{
    markPrice: number;
    oraclePrice: number;
    fundingRate: number;
    volume24h: number;
    openInterest: number;
  }> {
    const markets = await this.getMarkets();
    const market = markets.find(m => m.marketIndex === marketIndex);
    if (!market) throw new Error(`Market ${marketIndex} not found`);
    return {
      markPrice: market.markPrice,
      oraclePrice: market.markPrice,
      fundingRate: market.fundingRate,
      volume24h: market.volume24h,
      openInterest: market.openInterest,
    };
  }
}
