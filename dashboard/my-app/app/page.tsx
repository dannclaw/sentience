'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Activity, 
  ArrowRight,
  Menu,
  X,
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data - replace with API calls
const portfolioData = {
  totalValue: 104250.50,
  change24h: 5.2,
  apy: 7.8,
  allocations: [
    { protocol: 'Kamino', asset: 'USDC', amount: 40000, apy: 8.2, color: '#00f5ff' },
    { protocol: 'Marinade', asset: 'mSOL', amount: 35000, apy: 6.8, color: '#a855f7' },
    { protocol: 'Jito', asset: 'JitoSOL', amount: 25000, apy: 7.1, color: '#ec4899' },
    { protocol: 'SOL', asset: 'SOL', amount: 4250, apy: 0, color: '#10b981' }
  ]
};

const yields = [
  { protocol: 'Kamino', apy: 8.2, tvl: '$100M', risk: 'Medium' },
  { protocol: 'Marinade', apy: 6.8, tvl: '$500M', risk: 'Low' },
  { protocol: 'Jito', apy: 7.1, tvl: '$200M', risk: 'Low' },
  { protocol: 'Marginfi', apy: 7.5, tvl: '$80M', risk: 'Medium' }
];

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-wider">SENTIENCE</span>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0a0a0f] pt-24 px-6"
          >
            <div className="flex flex-col gap-6 text-2xl font-light">
              {['Overview', 'Portfolio', 'Strategies', 'Analytics', 'Settings'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveSection(item.toLowerCase());
                    setIsMenuOpen(false);
                  }}
                  className="text-left hover:text-cyan-400 transition-colors py-2 border-b border-white/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-6">
              Autonomous Treasury Management
            </p>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-8">
              BUILD.
              <br />
              OPTIMIZE.
              <br />
              <span className="text-cyan-400">EARN.</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              The ultimate playground for DeFi yield optimization. Connect your wallet, 
              deploy strategies, and earn passive income while AI manages risk.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <StatCard
              label="Total Value Locked"
              value={`$${portfolioData.totalValue.toLocaleString()}`}
              change={`+${portfolioData.change24h}%`}
              icon={Wallet}
            />
            <StatCard
              label="Current APY"
              value={`${portfolioData.apy}%`}
              change="Average"
              icon={TrendingUp}
            />
            <StatCard
              label="Risk Score"
              value="Low"
              change="Protected"
              icon={Shield}
            />
          </motion.div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
            <span className="text-cyan-400 text-xs tracking-[0.3em] uppercase">Portfolio Allocation</span>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Allocation Cards */}
            <div className="space-y-4">
              {portfolioData.allocations.map((item, index) => (
                <motion.div
                  key={item.protocol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{item.protocol}</h3>
                        <p className="text-gray-500 text-sm">{item.asset}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">${item.amount.toLocaleString()}</p>
                      <p className="text-cyan-400 text-sm">{item.apy}% APY</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / portfolioData.totalValue) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Yield Opportunities */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Yield Opportunities</h3>
              {yields.map((yield_item, index) => (
                <motion.div
                  key={yield_item.protocol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-cyan-400/30 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">{yield_item.protocol}</h4>
                    <p className="text-gray-500 text-sm">TVL: {yield_item.tvl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold text-xl">{yield_item.apy}%</p>
                    <p className="text-gray-500 text-sm">{yield_item.risk} Risk</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Optimize?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Deploy autonomous strategies that adapt to market conditions. 
            Your AI treasury manager works 24/7.
          </p>
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors">
            Connect Wallet
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold tracking-wider">SENTIENCE</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built for the Colosseum Agent Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}

// Components
function StatCard({ label, value, change, icon: Icon }: { 
  label: string; 
  value: string; 
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
        <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
          {change}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
