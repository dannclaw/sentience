import express from 'express';
import cors from 'cors';
import { TreasuryManager } from './treasury';
import { SentienceAPI } from './api';

export function createAPIServer(treasury: TreasuryManager, api: SentienceAPI) {
  const app = express();
  
  // CORS for dashboard
  app.use(cors({
    origin: process.env.DASHBOARD_URL || 'http://localhost:3000',
    credentials: true,
  }));
  
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Get portfolio data
  app.get('/api/portfolio', async (req, res) => {
    try {
      const portfolio = await treasury.getPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
  });

  // Get yields
  app.get('/api/yields', async (req, res) => {
    try {
      const query = {
        asset: req.query.asset as string,
        minApy: req.query.minApy ? parseFloat(req.query.minApy as string) : undefined,
      };
      const data = await api.getYields(query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch yields' });
    }
  });

  // Get transactions
  app.get('/api/transactions', async (req, res) => {
    try {
      const transactions = await treasury.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.json([]);
    }
  });

  // Get strategies
  app.get('/api/strategies', async (req, res) => {
    try {
      const strategies = [
        {
          id: 'strat-1',
          name: 'Conservative Yield',
          description: 'Low-risk lending on Kamino with USDC',
          status: 'active',
          allocation: 30,
          currentApy: 8.45,
          totalValue: 150000,
          lastRebalance: Date.now() - 2 * 60 * 60 * 1000,
          protocol: 'Kamino',
        },
        {
          id: 'strat-2',
          name: 'Liquid Staking',
          description: 'mSOL staking with Marinade',
          status: 'active',
          allocation: 25,
          currentApy: 6.82,
          totalValue: 125000,
          lastRebalance: Date.now() - 24 * 60 * 60 * 1000,
          protocol: 'Marinade',
        },
        {
          id: 'strat-3',
          name: 'Jito MEV Rewards',
          description: 'JitoSOL staking for MEV rewards',
          status: 'active',
          allocation: 20,
          currentApy: 7.15,
          totalValue: 100000,
          lastRebalance: Date.now() - 12 * 60 * 60 * 1000,
          protocol: 'Jito',
        },
      ];
      res.json(strategies);
    } catch (error) {
      res.json([]);
    }
  });

  // Get risk metrics
  app.get('/api/risk', async (req, res) => {
    try {
      const portfolio = await treasury.getPortfolio();
      res.json({
        totalValueLocked: portfolio.totalValue,
        volatility24h: 3.45,
        sharpeRatio: 2.18,
        maxDrawdown: 8.92,
        healthScore: 87,
        liquidAssetsRatio: 45.2,
        concentrationRisk: 32.5,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risk metrics' });
    }
  });

  // Get Kamino positions
  app.get('/api/positions/kamino', async (req, res) => {
    try {
      const positions = await treasury.getKaminoPositions();
      res.json(positions);
    } catch (error) {
      res.json([]);
    }
  });

  // Get yield history
  app.get('/api/yields/history', async (req, res) => {
    try {
      const history = await treasury.getYieldHistory();
      res.json(history);
    } catch (error) {
      res.json([]);
    }
  });

  // Execute swap
  app.post('/api/swap', async (req, res) => {
    try {
      const { from, to, amount } = req.query;
      const result = await treasury.swap(
        from as string,
        to as string,
        parseFloat(amount as string)
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Swap failed' });
    }
  });

  // Execute deposit
  app.post('/api/deposit', async (req, res) => {
    try {
      const { protocol, token, amount } = req.query;
      const result = await treasury.depositToProtocol(
        protocol as any,
        token as string,
        parseFloat(amount as string)
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Deposit failed' });
    }
  });

  // Execute rebalance
  app.post('/api/rebalance', async (req, res) => {
    try {
      await treasury.checkAndRebalance();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Rebalance failed' });
    }
  });

  return app;
}
