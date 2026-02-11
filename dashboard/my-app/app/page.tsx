'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Zap,
  Cpu,
  Bot,
  Clock,
  BarChart3,
  Menu,
  X,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock agent testers data
const agentTesters = [
  { 
    id: 'agent-1', 
    name: 'Alpha Trader', 
    status: 'running', 
    activity: 'Scanning yields...',
    lastAction: 'Rebalanced Kamino',
    profit: '+2.4%',
    uptime: '12h 34m'
  },
  { 
    id: 'agent-2', 
    name: 'Risk Guardian', 
    status: 'monitoring', 
    activity: 'Checking LTV ratios...',
    lastAction: 'Health factor: 1.85',
    profit: '0%',
    uptime: '24h 12m'
  },
  { 
    id: 'agent-3', 
    name: 'Yield Hunter', 
    status: 'simulating', 
    activity: 'Testing strategy...',
    lastAction: 'Sim complete: 8.2% APY',
    profit: '+5.1%',
    uptime: '6h 45m'
  }
];

const activities = [
  { id: 1, type: 'rebalance', message: 'Rebalanced $4,200 from Solend to Kamino', time: '2m ago', status: 'success' },
  { id: 2, type: 'alert', message: 'High volatility detected on SOL', time: '15m ago', status: 'warning' },
  { id: 3, type: 'deposit', message: 'Deposited $1,000 USDC to Marginfi', time: '1h ago', status: 'success' },
  { id: 4, type: 'simulate', message: 'Strategy simulation: 7.8% APY expected', time: '2h ago', status: 'info' },
  { id: 5, type: 'harvest', message: 'Harvested $45 rewards from Marinade', time: '3h ago', status: 'success' }
];

const portfolioData = {
  totalValue: 104250.50,
  change24h: 5.2,
  apy: 7.8,
  allocations: [
    { protocol: 'Kamino', asset: 'USDC', amount: 40000, apy: 8.2, color: '#00f5ff', progress: 38 },
    { protocol: 'Marinade', asset: 'mSOL', amount: 35000, apy: 6.8, color: '#a855f7', progress: 34 },
    { protocol: 'Jito', asset: 'JitoSOL', amount: 25000, apy: 7.1, color: '#ec4899', progress: 24 },
    { protocol: 'SOL', asset: 'SOL', amount: 4250, apy: 0, color: '#10b981', progress: 4 }
  ]
};

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agentTesters[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setSimulationProgress(prev => {
          if (prev >= 100) {
            setIsSimulating(false);
            return 0;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center"
            >
              <Zap className="w-5 h-5 text-black" />
            </motion.div>
            <div>
              <span className="text-xl font-bold tracking-wider block">SENTIENCE</span>
              <span className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase">AI Treasury</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Overview', 'Agents', 'Strategies', 'Analytics'].map((item) => (
              <button key={item} className="text-sm text-gray-400 hover:text-white transition-colors">
                {item}
              </button>
            ))}
            <button className="px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-lg hover:bg-cyan-300 transition-colors">
              Connect Wallet
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
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
            className="fixed inset-0 z-40 bg-[#0a0a0f] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-light">
              {['Overview', 'Agents', 'Strategies', 'Analytics'].map((item) => (
                <button
                  key={item}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left hover:text-cyan-400 transition-colors py-2 border-b border-white/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* Hero Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Value"
              value={`$${portfolioData.totalValue.toLocaleString()}`}
              change="+5.2%"
              changeType="positive"
              icon={Wallet}
            />
            <StatCard
              label="Average APY"
              value={`${portfolioData.apy}%`}
              change="Target: 8%"
              changeType="neutral"
              icon={TrendingUp}
            />
            <StatCard
              label="Risk Score"
              value="Low"
              change="Protected"
              changeType="positive"
              icon={Shield}
            />
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          
          {/* Agent Testers Panel */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                Agent Testers
              </h2>
              <span className="text-xs text-gray-500">{agentTesters.length} Active</span>
            </div>

            {agentTesters.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAgent.id === agent.id 
                    ? 'bg-cyan-400/10 border-cyan-400/30' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'running' ? 'bg-green-400 animate-pulse' :
                      agent.status === 'monitoring' ? 'bg-blue-400' :
                      'bg-yellow-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-sm">{agent.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{agent.activity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${agent.profit.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                      {agent.profit}
                    </p>
                    <p className="text-[10px] text-gray-600">{agent.uptime}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Selected Agent Terminal */}
            <div className="mt-6 p-4 bg-black/50 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <Terminal className="w-3 h-3" />
                <span>AGENT LOG: {selectedAgent.name.toUpperCase()}</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{selectedAgent.lastAction}</span>
                </div>
                <div className="text-gray-500">{selectedAgent.activity}</div>
                <div className="text-cyan-400/60">&gt;_ Awaiting next block...</div>
              </div>
            </div>
          </motion.section>

          {/* Activity Feed */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Activity
              </h2>
              <span className="text-xs text-gray-500">Real-time</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-400' :
                    activity.status === 'warning' ? 'bg-yellow-400' :
                    'bg-cyan-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Strategy Simulator */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Strategy Simulator
              </h2>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Strategy</label>
                  <select className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-lg text-sm focus:border-cyan-400 focus:outline-none">
                    <option>Conservative Yield</option>
                    <option>Balanced Growth</option>
                    <option>Aggressive Alpha</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="number" 
                      defaultValue="1000"
                      className="flex-1 p-3 bg-black/50 border border-white/10 rounded-lg text-sm focus:border-cyan-400 focus:outline-none"
                    />
                    <span className="text-sm text-gray-500">USDC</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSimulating(true)}
                  disabled={isSimulating}
                  className="w-full py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Simulation
                    </>
                  )}
                </button>

                {isSimulating && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Testing scenarios...</span>
                      <span>{simulationProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isSimulating && simulationProgress === 0 && (
                  <div className="mt-4 p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expected APY</span>
                      <span className="text-cyan-400 font-bold">7.8%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">Risk Level</span>
                      <span className="text-green-400 font-bold">Low</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>

        {/* Portfolio Allocation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="py-12 border-t border-white/5"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
            <span className="text-cyan-400 text-xs tracking-[0.3em] uppercase">Portfolio Allocation</span>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolioData.allocations.map((item, index) => (
              <motion.div
                key={item.protocol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <h3 className="font-semibold">{item.protocol}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                
                <p className="text-2xl font-bold mb-1">${item.amount.toLocaleString()}</p>
                <p className="text-sm text-cyan-400 mb-4">{item.apy}% APY</p>
                
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.progress}% of portfolio</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="py-12 text-center border-t border-white/5"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="text-cyan-400">Deploy?</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Connect your wallet and let AI agents optimize your DeFi yields 24/7.
          </p>
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all hover:scale-105">
            Connect Wallet
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.section>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, changeType, icon: Icon }: { 
  label: string; 
  value: string; 
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          changeType === 'positive' ? 'bg-green-400/10 text-green-400' :
          changeType === 'negative' ? 'bg-red-400/10 text-red-400' :
          'bg-white/10 text-gray-400'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
