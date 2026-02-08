import { Injectable, Logger } from '@nestjs/common';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  ComputeBudgetProgram
} from '@solana/web3.js';
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

@Injectable()
export class DriftIntegration {
  private readonly logger = new Logger(DriftIntegration.name);
  private readonly DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH');
  private readonly API_URL = 'https://mainnet-beta.api.drift.trade';

  constructor(private connection: Connection) {}

  /**
   * Get all available perpetual markets
   */
  async getMarkets(): Promise<DriftMarketInfo[]> {
    try {
      const response = await axios.get(`${this.API_URL}/markets`, {
        timeout: 10000
      });

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
      this.logger.error('Failed to fetch Drift markets', error);
      return [];
    }
  }

  /**
   * Get user's perpetual positions
   */
  async getPositions(wallet: PublicKey): Promise<Record<string, DriftPosition>> {
    try {
      // Fetch user account from Drift
      const response = await axios.get(
        `${this.API_URL}/user/${wallet.toString()}/positions`,
        { timeout: 10000 }
      );

      const positions: Record<string, DriftPosition> = {};
      const data = response.data;

      for (const perpPosition of data.perpPositions || []) {
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
    } catch (error) {
      this.logger.error(`Failed to fetch Drift positions for ${wallet.toString()}`, error);
      return {};
    }
  }

  /**
   * Get user's spot (token) positions
   */
  async getSpotPositions(wallet: PublicKey): Promise<Record<string, SpotPosition>> {
    try {
      const response = await axios.get(
        `${this.API_URL}/user/${wallet.toString()}/spotPositions`,
        { timeout: 10000 }
      );

      const positions: Record<string, SpotPosition> = {};

      for (const spotPosition of response.data.spotPositions || []) {
        positions[spotPosition.token] = {
          marketIndex: spotPosition.marketIndex,
          token: spotPosition.token,
          scaledBalance: spotPosition.scaledBalance,
          openBids: spotPosition.openBids,
          openAsks: spotPosition.openAsks,
          cumulativeDeposits: spotPosition.cumulativeDeposits,
        };
      }

      return positions;
    } catch (error) {
      this.logger.error(`Failed to fetch spot positions`, error);
      return {};
    }
  }

  /**
   * Open a perpetual position
   */
  async openPerpPosition(
    marketIndex: number,
    side: 'long' | 'short',
    size: number,
    wallet: Keypair,
    limitPrice?: number
  ): Promise<string> {
    try {
      this.logger.log(`Opening ${side} position on market ${marketIndex}, size: ${size}`);

      const transaction = new Transaction();

      // Add priority fee for faster execution
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 10000,
        })
      );

      // Build open position instruction
      const openPositionInstruction = await this.buildOpenPositionInstruction(
        wallet.publicKey,
        marketIndex,
        side,
        size,
        limitPrice
      );

      transaction.add(openPositionInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      this.logger.log(`Position opened: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Failed to open position`, error);
      throw error;
    }
  }

  /**
   * Close a perpetual position
   */
  async closePosition(
    marketIndex: number,
    wallet: Keypair,
    limitPrice?: number
  ): Promise<{ signature: string; pnl: number }> {
    try {
      this.logger.log(`Closing position on market ${marketIndex}`);

      const transaction = new Transaction();

      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 10000,
        })
      );

      const closePositionInstruction = await this.buildClosePositionInstruction(
        wallet.publicKey,
        marketIndex,
        limitPrice
      );

      transaction.add(closePositionInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      // Get realized PnL from transaction
      const pnl = await this.getRealizedPnlFromTransaction(signature);

      this.logger.log(`Position closed: ${signature}, PnL: ${pnl}`);
      return { signature, pnl };

    } catch (error) {
      this.logger.error(`Failed to close position`, error);
      throw error;
    }
  }

  /**
   * Deposit collateral
   */
  async depositCollateral(
    amount: number,
    token: string,
    wallet: Keypair
  ): Promise<string> {
    try {
      this.logger.log(`Depositing ${amount} ${token} as collateral`);

      const transaction = new Transaction();

      const depositInstruction = await this.buildDepositCollateralInstruction(
        wallet.publicKey,
        token,
        amount
      );

      transaction.add(depositInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
        }
      );

      this.logger.log(`Collateral deposited: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Failed to deposit collateral`, error);
      throw error;
    }
  }

  /**
   * Withdraw collateral
   */
  async withdrawCollateral(
    amount: number,
    token: string,
    wallet: Keypair
  ): Promise<string> {
    try {
      this.logger.log(`Withdrawing ${amount} ${token} collateral`);

      const transaction = new Transaction();

      const withdrawInstruction = await this.buildWithdrawCollateralInstruction(
        wallet.publicKey,
        token,
        amount
      );

      transaction.add(withdrawInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
        }
      );

      this.logger.log(`Collateral withdrawn: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Failed to withdraw collateral`, error);
      throw error;
    }
  }

  /**
   * Get market info (price, funding, etc.)
   */
  async getMarketInfo(marketIndex: number): Promise<{
    markPrice: number;
    oraclePrice: number;
    fundingRate: number;
    volume24h: number;
    openInterest: number;
  }> {
    try {
      const markets = await this.getMarkets();
      const market = markets.find(m => m.marketIndex === marketIndex);

      if (!market) {
        throw new Error(`Market ${marketIndex} not found`);
      }

      return {
        markPrice: market.markPrice,
        oraclePrice: market.markPrice, // Would fetch from oracle
        fundingRate: market.fundingRate,
        volume24h: market.volume24h,
        openInterest: market.openInterest,
      };
    } catch (error) {
      this.logger.error(`Failed to get market info`, error);
      throw error;
    }
  }

  /**
   * Get user account info (collateral, margin, etc.)
   */
  async getUserAccountInfo(wallet: PublicKey): Promise<{
    totalCollateral: number;
    freeCollateral: number;
    marginRatio: number;
    buyingPower: number;
  }> {
    try {
      const response = await axios.get(
        `${this.API_URL}/user/${wallet.toString()}/account`,
        { timeout: 10000 }
      );

      const data = response.data;
      return {
        totalCollateral: data.totalCollateral,
        freeCollateral: data.freeCollateral,
        marginRatio: data.marginRatio,
        buyingPower: data.buyingPower,
      };
    } catch (error) {
      this.logger.error(`Failed to get user account info`, error);
      return {
        totalCollateral: 0,
        freeCollateral: 0,
        marginRatio: 0,
        buyingPower: 0,
      };
    }
  }

  // Helper methods
  private async buildOpenPositionInstruction(
    owner: PublicKey,
    marketIndex: number,
    side: 'long' | 'short',
    size: number,
    limitPrice?: number
  ): Promise<any> {
    throw new Error('Install @drift-labs/sdk for production use');
  }

  private async buildClosePositionInstruction(
    owner: PublicKey,
    marketIndex: number,
    limitPrice?: number
  ): Promise<any> {
    throw new Error('Install @drift-labs/sdk for production use');
  }

  private async buildDepositCollateralInstruction(
    owner: PublicKey,
    token: string,
    amount: number
  ): Promise<any> {
    throw new Error('Install @drift-labs/sdk for production use');
  }

  private async buildWithdrawCollateralInstruction(
    owner: PublicKey,
    token: string,
    amount: number
  ): Promise<any> {
    throw new Error('Install @drift-labs/sdk for production use');
  }

  private async getRealizedPnlFromTransaction(signature: string): Promise<number> {
    try {
      const tx = await this.connection.getTransaction(signature);
      // Parse transaction logs for PnL
      return 0;
    } catch {
      return 0;
    }
  }
}
