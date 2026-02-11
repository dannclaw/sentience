import express, { Request, Response } from 'express';
import cors from 'cors';
import { Connection, PublicKey } from '@solana/web3.js';
import { SentienceSDK } from '../sdk/src/index';

/**
 * Sentience Backend API
 * 
 * REST API for dashboard integration.
 * Provides real-time data and strategy execution endpoints.
 */

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SDK
const connection = new Connection(process.env.SOLANA_RPC || 'https://api.devnet.solana.com');
let sdk: SentienceSDK | null = null;

async function initializeSDK() {
  sdk = new SentienceSDK({
    connection,
    apiKey: process.env.HELIUS_API_KEY
  });
  await sdk.initialize();
  console.log('✅ Backend API initialized');
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    sdk: sdk ? 'initialized' : 'not_ready'
  });
});

// Get complete portfolio
app.get('/api/portfolio', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const portfolio = await sdk.getPortfolio();
    res.json({
      success: true,
      data: portfolio,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lending positions
app.get('/api/lending/positions', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const wallet = req.query.wallet as string;
    if (!wallet) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }
    
    const positions = await sdk.lending.checkAllPositions(new PublicKey(wallet));
    res.json({
      success: true,
      data: positions,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulate strategy
app.post('/api/simulate', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const { action, protocol, from, to, currentPortfolio } = req.body;
    
    const simulation = await sdk.simulation.simulateStrategy({
      action,
      protocol,
      from,
      to,
      currentPortfolio
    });
    
    res.json({
      success: true,
      data: simulation,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute strategy (with simulation check)
app.post('/api/execute', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const strategy = req.body;
    const result = await sdk.simulateAndExecute(strategy);
    
    res.json({
      success: true,
      data: result,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get risk profile
app.get('/api/risk', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const prices = { SOL: 185.50, USDC: 1.00, mSOL: 201.80 };
    const riskProfile = await sdk.risk.assessMarketConditions(prices);
    
    res.json({
      success: true,
      data: riskProfile,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get yields
app.get('/api/yields', async (req: Request, res: Response) => {
  try {
    const yields = [
      { protocol: 'Kamino', asset: 'USDC', apy: 8.2, tvl: 100000000, risk: 'medium' },
      { protocol: 'Marinade', asset: 'mSOL', apy: 6.8, tvl: 500000000, risk: 'low' },
      { protocol: 'Jito', asset: 'JitoSOL', apy: 7.1, tvl: 200000000, risk: 'low' },
      { protocol: 'Marginfi', asset: 'USDC', apy: 7.5, tvl: 80000000, risk: 'medium' },
      { protocol: 'Solend', asset: 'SOL', apy: 5.2, tvl: 300000000, risk: 'low' }
    ];
    
    res.json({
      success: true,
      data: yields,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    if (!sdk) throw new Error('SDK not initialized');
    
    const transactions = [
      {
        id: 'tx-1',
        type: 'deposit',
        protocol: 'Kamino',
        amount: 1000,
        asset: 'USDC',
        timestamp: Date.now() - 86400000,
        status: 'confirmed',
        txHash: '5x...abc'
      },
      {
        id: 'tx-2',
        type: 'stake',
        protocol: 'Marinade',
        amount: 5,
        asset: 'SOL',
        timestamp: Date.now() - 172800000,
        status: 'confirmed',
        txHash: '3y...def'
      }
    ];
    
    res.json({
      success: true,
      data: transactions,
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;

initializeSDK().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on port ${PORT}`);
    console.log(`📊 Endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   GET  /api/portfolio`);
    console.log(`   GET  /api/lending/positions?wallet=...`);
    console.log(`   POST /api/simulate`);
    console.log(`   POST /api/execute`);
    console.log(`   GET  /api/risk`);
    console.log(`   GET  /api/yields`);
    console.log(`   GET  /api/transactions`);
  });
});

export default app;
