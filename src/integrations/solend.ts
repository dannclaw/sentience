import { Injectable, Logger } from '@nestjs/common';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  NATIVE_MINT
} from '@solana/spl-token';
import axios from 'axios';

export interface LendingPosition {
  token: string;
  amount: number;
  apy: number;
  accruedInterest: number;
  mint: string;
}

export interface SolendMarket {
  address: string;
  token: string;
  mint: string;
  totalSupply: number;
  totalBorrow: number;
  supplyApy: number;
  borrowApy: number;
  ltv: number;
}

@Injectable()
export class SolendLending {
  private readonly logger = new Logger(SolendLending.name);
  private readonly SOLEND_PROGRAM_ID = new PublicKey('So1endDqUFYhgRNLLP2UEsG1SMAD75s4h9G9tqyx9mf');
  private readonly API_URL = 'https://api.solend.fi';

  constructor(private connection: Connection) {}

  /**
   * Fetch all available Solend markets (lending pools)
   */
  async getMarkets(): Promise<SolendMarket[]> {
    try {
      const response = await axios.get(`${this.API_URL}/v1/markets/configs?scope=all&deployment=production`);
      const markets = response.data;
      
      return markets.map((market: any) => ({
        address: market.address,
        token: market.symbol,
        mint: market.mint,
        totalSupply: market.totalSupply,
        totalBorrow: market.totalBorrow,
        supplyApy: market.supplyApy,
        borrowApy: market.borrowApy,
        ltv: market.loanToValueRatio,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Solend markets', error);
      return [];
    }
  }

  /**
   * Get user's lending positions from Solend
   */
  async getPositions(wallet: PublicKey): Promise<Record<string, LendingPosition>> {
    try {
      // Fetch obligation data from Solend API
      const response = await axios.get(
        `${this.API_URL}/v1/user/${wallet.toString()}/obligation`,
        { timeout: 10000 }
      );

      const obligations = response.data.obligations || [];
      const positions: Record<string, LendingPosition> = {};

      for (const obligation of obligations) {
        for (const deposit of obligation.deposits || []) {
          positions[deposit.mint] = {
            token: deposit.symbol,
            mint: deposit.mint,
            amount: deposit.amount,
            apy: deposit.apy,
            accruedInterest: deposit.accruedInterest || 0,
          };
        }
      }

      return positions;
    } catch (error) {
      this.logger.error(`Failed to fetch Solend positions for ${wallet.toString()}`, error);
      return {};
    }
  }

  /**
   * Deposit tokens to Solend lending pool
   */
  async deposit(
    token: string,
    amount: number,
    wallet: Keypair
  ): Promise<string> {
    try {
      this.logger.log(`Depositing ${amount} ${token} to Solend`);

      // Get market info
      const markets = await this.getMarkets();
      const market = markets.find(m => m.token === token);
      
      if (!market) {
        throw new Error(`Market not found for token: ${token}`);
      }

      // Get token mint
      const mint = new PublicKey(market.mint);
      
      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      // Build deposit transaction using Solend SDK approach
      const transaction = new Transaction();

      // Add deposit instruction
      // Note: In production, use @solendprotocol/solend-sdk for proper instruction building
      // This is a simplified version showing the pattern
      const depositInstruction = await this.buildDepositInstruction(
        wallet.publicKey,
        userTokenAccount,
        mint,
        amount
      );
      
      transaction.add(depositInstruction);

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      this.logger.log(`Deposit successful: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Deposit failed for ${token}`, error);
      throw error;
    }
  }

  /**
   * Withdraw tokens from Solend lending pool
   */
  async withdraw(
    token: string,
    amount: number,
    wallet: Keypair
  ): Promise<string> {
    try {
      this.logger.log(`Withdrawing ${amount} ${token} from Solend`);

      const markets = await this.getMarkets();
      const market = markets.find(m => m.token === token);
      
      if (!market) {
        throw new Error(`Market not found for token: ${token}`);
      }

      const mint = new PublicKey(market.mint);
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      const transaction = new Transaction();
      
      const withdrawInstruction = await this.buildWithdrawInstruction(
        wallet.publicKey,
        userTokenAccount,
        mint,
        amount
      );
      
      transaction.add(withdrawInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      this.logger.log(`Withdrawal successful: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Withdrawal failed for ${token}`, error);
      throw error;
    }
  }

  /**
   * Borrow tokens from Solend
   */
  async borrow(
    token: string,
    amount: number,
    wallet: Keypair
  ): Promise<string> {
    try {
      this.logger.log(`Borrowing ${amount} ${token} from Solend`);

      const markets = await this.getMarkets();
      const market = markets.find(m => m.token === token);
      
      if (!market) {
        throw new Error(`Market not found for token: ${token}`);
      }

      const mint = new PublicKey(market.mint);
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      // Ensure token account exists
      const accountInfo = await this.connection.getAccountInfo(userTokenAccount);
      const transaction = new Transaction();

      if (!accountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            userTokenAccount,
            wallet.publicKey,
            mint
          )
        );
      }

      const borrowInstruction = await this.buildBorrowInstruction(
        wallet.publicKey,
        userTokenAccount,
        mint,
        amount
      );
      
      transaction.add(borrowInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      this.logger.log(`Borrow successful: ${signature}`);
      return signature;

    } catch (error) {
      this.logger.error(`Borrow failed for ${token}`, error);
      throw error;
    }
  }

  /**
   * Get current APYs for all markets
   */
  async getAllYields(): Promise<Record<string, number>> {
    try {
      const markets = await this.getMarkets();
      const yields: Record<string, number> = {};
      
      for (const market of markets) {
        yields[market.token] = market.supplyApy;
      }
      
      return yields;
    } catch (error) {
      this.logger.error('Failed to fetch yields', error);
      // Return fallback values
      return {
        USDC: 8.5,
        SOL: 4.2,
        USDT: 7.8,
      };
    }
  }

  async getApy(pool: string): Promise<number> {
    try {
      const markets = await this.getMarkets();
      const market = markets.find(m => m.token === pool);
      return market?.supplyApy || 5.0;
    } catch {
      const apys: Record<string, number> = {
        USDC: 8.5,
        SOL: 4.2,
        USDT: 7.8,
      };
      return apys[pool] || 5.0;
    }
  }

  /**
   * Claim all accumulated rewards
   */
  async claimAll(wallet: Keypair): Promise<{ total: number; breakdown: any[] }> {
    try {
      this.logger.log('Claiming all Solend rewards');

      // Build claim rewards transaction
      const transaction = new Transaction();
      
      const claimInstruction = await this.buildClaimRewardsInstruction(
        wallet.publicKey
      );
      
      transaction.add(claimInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
        }
      );

      this.logger.log(`Rewards claimed: ${signature}`);

      return { 
        total: 0, // Would calculate from transaction result
        breakdown: [],
        signature
      };

    } catch (error) {
      this.logger.error('Failed to claim rewards', error);
      return { total: 0, breakdown: [] };
    }
  }

  // Helper methods for building instructions
  private async buildDepositInstruction(
    owner: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey,
    amount: number
  ): Promise<any> {
    // In production: use @solendprotocol/solend-sdk
    // For now, return placeholder that would be replaced with actual SDK call
    throw new Error('Install @solendprotocol/solend-sdk for production use');
  }

  private async buildWithdrawInstruction(
    owner: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey,
    amount: number
  ): Promise<any> {
    throw new Error('Install @solendprotocol/solend-sdk for production use');
  }

  private async buildBorrowInstruction(
    owner: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey,
    amount: number
  ): Promise<any> {
    throw new Error('Install @solendprotocol/solend-sdk for production use');
  }

  private async buildClaimRewardsInstruction(
    owner: PublicKey
  ): Promise<any> {
    throw new Error('Install @solendprotocol/solend-sdk for production use');
  }
}
