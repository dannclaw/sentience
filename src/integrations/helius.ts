import { Connection, PublicKey } from '@solana/web3.js';

export class SolanaRPC {
  private connection: Connection;

  constructor(private apiKey: string) {
    // Use Helius RPC endpoint
    this.connection = new Connection(
      `https://devnet.helius-rpc.com/?api-key=${apiKey}`,
      'confirmed'
    );
  }

  async getBalance(address: string): Promise<number> {
    const pubKey = new PublicKey(address);
    const balance = await this.connection.getBalance(pubKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  async getTokenBalance(address: string, mint: string): Promise<number> {
    const owner = new PublicKey(address);
    const mintKey = new PublicKey(mint);
    
    // Get associated token account
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      owner,
      { mint: mintKey }
    );

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  }

  async getAccountInfo(address: string): Promise<any> {
    const pubKey = new PublicKey(address);
    return await this.connection.getAccountInfo(pubKey);
  }

  async sendTransaction(transaction: any): Promise<string> {
    // Send and confirm transaction
    const signature = await this.connection.sendTransaction(transaction, []);
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  onAccountChange(address: string, callback: (accountInfo: any) => void): number {
    const pubKey = new PublicKey(address);
    return this.connection.onAccountChange(pubKey, callback);
  }

  async subscribeToWebhooks(webhookUrl: string, addresses: string[]): Promise<void> {
    // Subscribe to Helius webhooks for real-time updates
    console.log(`Subscribing to webhooks for ${addresses.length} addresses`);
    // Implementation would use Helius webhook API
  }

  getConnection(): Connection {
    return this.connection;
  }
}
