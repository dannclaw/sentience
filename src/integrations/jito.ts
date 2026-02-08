import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';

export interface BundleResult {
  bundleId: string;
  signatures: string[];
  tipAmount: number;
  landingSlot?: number;
}

export class JitoMev {
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
      const serializedTxs = transactions.map(tx => 
        Buffer.from(tx.serialize()).toString('base64')
      );

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
      console.log(`Bundle sent: ${bundleId}`);

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
      console.error('Bundle submission failed', error);
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
      return [
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
      ];
    }
  }

  async getApy(): Promise<number> {
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
        console.warn('Bundle status check failed', error);
      }
    }

    return { landed: false };
  }
}
