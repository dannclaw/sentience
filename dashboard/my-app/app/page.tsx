'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardData } from './types';
import { fetchDashboardData } from './mockApi';

// Components
import HeroSection from './components/HeroSection';
import PortfolioCards from './components/PortfolioCards';
import KaminoPositions from './components/KaminoPositions';
import YieldChart from './components/YieldChart';
import RecentTransactions from './components/RecentTransactions';
import StrategyStatus from './components/StrategyStatus';
import RiskMetrics from './components/RiskMetrics';

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
          Initializing treasury dashboard...
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

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        // Add a small delay for the loading animation
        setTimeout(() => setLoading(false), 1500);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(async () => {
      const freshData = await fetchDashboardData();
      setData(freshData);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading || !data) {
    return <LoadingScreen />;
  }
  
  const dailyYield = data.yieldHistory.length > 1 
    ? data.yieldHistory[data.yieldHistory.length - 1].totalYield - data.yieldHistory[data.yieldHistory.length - 2].totalYield
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      { /* Hero Section */ }
      <HeroSection 
        totalValue={data.riskMetrics.totalValueLocked}
        dailyYield={dailyYield}
        activeStrategies={data.strategies.filter(s => s.status === 'active').length}
      />
      
      { /* Portfolio Overview */ }
      <PortfolioCards assets={data.portfolio} />
      
      { /* Kamino Positions */ }
      <KaminoPositions positions={data.kaminoPositions} />
      
      { /* Yield Chart */ }
      <YieldChart data={data.yieldHistory} />
      
      { /* Recent Transactions */ }
      <RecentTransactions transactions={data.recentTransactions} />
      
      { /* Strategy Status */ }
      <StrategyStatus strategies={data.strategies} />
      
      { /* Risk Metrics */ }
      <RiskMetrics metrics={data.riskMetrics} />
      
      { /* Footer */ }
      <footer className="py-8 px-4 text-center">
        <p className="text-sm text-gray-500">
          Powered by <span className="text-[var(--accent-cyan)]">Sentience AI</span> • Built for Solana
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      </footer>
    </motion.div>
  );
}
