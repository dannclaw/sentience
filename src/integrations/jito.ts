import { Injectable, Logger } from '@nestjs/common';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';

export interface BundleResult {
  bundleId: string;
  signatures: string[];
  tipAmount: number;
  landingSlot?: number;
}

@Injectable()
export class JitoMev {
  private readonly logger = new Logger(JitoMev.name);
  private readonly jitoEndpoints = [
    'https://mainnet.block-engine.jito.wtf/api/v1',
    'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1',
    'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1',
  ];

  constructor(private apiKey?: string) {}

  async sendBundle(
    transactions: VersionedTransaction[],
    tipLamports: number = 10000
  ): Promise<BundleResult> {
    try {
      // Serialize transactions
      const serializedTxs = transactions.map(tx => 
        Buffer.from(tx.serialize()).toString('base64')
      );

      // Send to Jito
      const response = await axios.post(
        `${this.jitoEndpoints[0]}/bundles`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'sendBundle',
          params: [serializedTxs],
        },
        { timeout: 30000 }
      );

      const bundleId = response.data.result;
      
      this.logger.log(`Bundle sent: ${bundleId}`);

      // Wait for confirmation
      const status = await this.waitForBundleConfirmation(bundleId);

      return {
        bundleId,
        signatures: transactions.map(tx => 
          Buffer.from(tx.signatures[0]).toString('base64')
        ),
        tipAmount: tipLamports,
        landingSlot: status.landingSlot,
      };

    } catch (error) {
      this.logger.error('Bundle submission failed', error);
      throw error;
    }
  }

  async getTipAccounts(): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.jitoEndpoints[0]}/bundles`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTipAccounts',
          params: [],
        }
      );

      return response.data.result || [];
    } catch {
      // Fallback tip accounts
      return [
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
      ];
    }
  }

  async getApy(): Promise<number> {
    // JitoSOL staking APY
    return 7.2;
  }

  private async waitForBundleConfirmation(
    bundleId: string,
    timeout: number = 60000
  ): Promise<{ landed: boolean; landingSlot?: number }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.post(
          `${this.jitoEndpoints[0]}/bundles`,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getBundleStatuses',
            params: [[bundleId]],
          }
        );

        const status = response.data.result?.value?.[0];
        
        if (status?.confirmation_status === 'confirmed') {
          return { landed: true, landingSlot: status.slot };
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        this.logger.warn('Bundle status check failed', error);
      }
    }

    return { landed: false };
  }
}
