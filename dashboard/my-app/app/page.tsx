'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardData } from './types';
import { apiClient } from './api';

// Components
import HeroSection from './components/HeroSection';
import PortfolioCards from './components/PortfolioCards';
import KaminoPositions from './components/KaminoPositions';
import YieldChart from './components/YieldChart';
import RecentTransactions from './components/RecentTransactions';
import StrategyStatus from './components/StrategyStatus';
import RiskMetrics from './components/RiskMetrics';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-[var(--accent-cyan)]">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="60"
              strokeDashoffset="20"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-2"
        >
          Sentience AI
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400"
        >
          Connecting to treasury API...
        </motion.p>
        
        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [8, 24, 8],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-1.5 bg-gradient-to-t from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Error component
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 glass-panel rounded-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-6 text-red-400">
          <WifiOff className="w-full h-full" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-gray-400 mb-6">Unable to connect to the treasury API</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const dashboardData = await apiClient.getDashboardData();
      setData(dashboardData);
      setIsConnected(true);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadData(true);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  if (loading && !data) {
    return <LoadingScreen />;
  }

  if (error && !data) {
    return <ErrorScreen onRetry={handleRefresh} />;
  }

  if (!data) {
    return <ErrorScreen onRetry={handleRefresh} />;
  }

  const dailyYield = data.yieldHistory.length > 1 
    ? data.yieldHistory[data.yieldHistory.length - 1].totalYield - data.yieldHistory[data.yieldHistory.length - 2].totalYield
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Connection Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-400"
                >
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </motion.div>
              ) : (
                <motion.div
                  key="disconnected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-yellow-400"
                >
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Using cached data</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <motion.div
                animate={loading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-[var(--accent-cyan)]" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <HeroSection 
          totalValue={data.riskMetrics.totalValueLocked}
          dailyYield={dailyYield}
          activeStrategies={data.strategies.filter(s => s.status === 'active').length}
        />
        
        {/* Portfolio Overview */}
        <PortfolioCards assets={data.portfolio} />
        
        {/* Kamino Positions */}
        <KaminoPositions positions={data.kaminoPositions} />
        
        {/* Yield Chart */}
        <YieldChart data={data.yieldHistory} />
        
        {/* Recent Transactions */}
        <RecentTransactions transactions={data.recentTransactions} />
        
        {/* Strategy Status */}
        <StrategyStatus strategies={data.strategies} />
        
        {/* Risk Metrics */}
        <RiskMetrics metrics={data.riskMetrics} />
        
        {/* Footer */}
        <footer className="py-8 px-4 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="text-[var(--accent-cyan)]">Sentience AI</span> • Built for Solana
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
