'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Zap,
  Cpu,
  Bot,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Wallet Context
interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  connect: () => {},
  disconnect: () => {}
});

// Mock data
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

const strategies = [
  { id: 'conservative', name: 'Conservative Yield', apy: 6.5, risk: 'Low', allocation: '40% USDC, 30% mSOL, 30% JitoSOL' },
  { id: 'balanced', name: 'Balanced Growth', apy: 8.2, risk: 'Medium', allocation: '25% Kamino, 35% Marinade, 25% Jito, 15% SOL' },
  { id: 'aggressive', name: 'Aggressive Alpha', apy: 12.5, risk: 'High', allocation: '50% JitoSOL, 30% Marginfi, 20% Kamino' }
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

// Wallet Provider Component
function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = () => {
    // In production: Use @solana/wallet-adapter
    // For now: Mock connection
    setConnected(true);
    setPublicKey('7xKx...8X2p');
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
  };

  return (
    <WalletContext.Provider value={{ connected, publicKey, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook for wallet
function useWallet() {
  return useContext(WalletContext);
}

// Main Dashboard Component
function DashboardContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState(agentTesters[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const { connected, publicKey, connect, disconnect } = useWallet();

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

  // Render different sections based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            {/* Hero Stats */}
            <section className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Value" value={`$${portfolioData.totalValue.toLocaleString()}`} change="+5.2%" changeType="positive" icon={Wallet} />
                <StatCard label="Average APY" value={`${portfolioData.apy}%`} change="Target: 8%" changeType="neutral" icon={TrendingUp} />
                <StatCard label="Risk Score" value="Low" change="Protected" changeType="positive" icon={Shield} />
              </div>
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
              {/* Agents Panel */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Bot className="w-5 h-5 text-cyan-400" /> Agent Testers</h2>
                  <span className="text-xs text-gray-500">{agentTesters.length} Active</span>
                </div>
                {agentTesters.map((agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAgent.id === agent.id ? 'bg-cyan-400/10 border-cyan-400/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-green-400 animate-pulse' : agent.status === 'monitoring' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                        <div><h4 className="font-semibold text-sm">{agent.name}</h4><p className="text-xs text-gray-500 mt-1">{agent.activity}</p></div>
                      </div>
                      <div className="text-right"><p className={`text-sm font-bold ${agent.profit.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>{agent.profit}</p><p className="text-[10px] text-gray-600">{agent.uptime}</p></div>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-6 p-4 bg-black/50 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500"><Terminal className="w-3 h-3" /><span>AGENT LOG: {selectedAgent.name.toUpperCase()}</span></div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-3 h-3" /><span>{selectedAgent.lastAction}</span></div>
                    <div className="text-gray-500">{selectedAgent.activity}</div>
                    <div className="text-cyan-400/60">&gt;_ Awaiting next block...</div>
                  </div>
                </div>
              </section>

              {/* Activity Feed */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Live Activity</h2>
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
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.status === 'success' ? 'bg-green-400' : activity.status === 'warning' ? 'bg-yellow-400' : 'bg-cyan-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Strategy Simulator */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Cpu className="w-5 h-5 text-cyan-400" /> Strategy Simulator</h2>
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
                        <input type="number" defaultValue="1000" className="flex-1 p-3 bg-black/50 border border-white/10 rounded-lg text-sm focus:border-cyan-400 focus:outline-none" />
                        <span className="text-sm text-gray-500">USDC</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSimulating(true)}
                      disabled={isSimulating || !connected}
                      className="w-full py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSimulating ? (
                        <> <RotateCcw className="w-4 h-4 animate-spin" /> Simulating... </>
                      ) : (
                        <> <Play className="w-4 h-4" /> Run Simulation </>
                      )}
                    </button>
                    
                    {!connected && (
                      <p className="text-xs text-center text-gray-500 mt-2">Connect wallet to simulate</p>
                    )}

                    {isSimulating && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2"><span>Testing scenarios...</span><span>{simulationProgress}%</span></div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-cyan-400" initial={{ width: 0 }} animate={{ width: `${simulationProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {!isSimulating && simulationProgress === 0 && (
                      <div className="mt-4 p-4 bg-black/30 rounded-lg">
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Expected APY</span><span className="text-cyan-400 font-bold">7.8%</span></div>
                        <div className="flex items-center justify-between text-sm mt-2"><span className="text-gray-500">Risk Level</span><span className="text-green-400 font-bold">Low</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Portfolio Allocation */}
            <section className="py-12 border-t border-white/5">
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
                    transition={{ delay: index * 0.1 }}
                    className="group p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{item.progress}% of portfolio</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        );

      case 'agents':
        return (
          <section className="py-8">
            <h2 className="text-3xl font-bold mb-8">Agent Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agentTesters.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${agent.status === 'running' ? 'bg-green-400 animate-pulse' : agent.status === 'monitoring' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      agent.status === 'running' ? 'bg-green-400/10 text-green-400' :
                      agent.status === 'monitoring' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Current Activity</span><span>{agent.activity}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Action</span><span className="text-green-400">{agent.lastAction}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Profit/Loss</span><span className={agent.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}>{agent.profit}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Uptime</span><span>{agent.uptime}</span></div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 py-2 bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors text-sm font-semibold">View Logs</button>
                    <button className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-sm">Configure</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case 'strategies':
        return (
          <section className="py-8">
            <h2 className="text-3xl font-bold mb-8">Strategy Library</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:border-cyan-400/30 transition-all"
                >
                  <h3 className="text-xl font-bold mb-2">{strategy.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400">{strategy.apy}%</p>
                      <p className="text-xs text-gray-500">Expected APY</p>
                    </div>
                    
                    <div className="h-10 w-px bg-white/10" />
                    
                    <div className="text-center">
                      <p className={`text-lg font-bold ${strategy.risk === 'Low' ? 'text-green-400' : strategy.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{strategy.risk}</p>
                      <p className="text-xs text-gray-500">Risk Level</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4">{strategy.allocation}</p>
                  
                  <button 
                    disabled={!connected}
                    className="w-full py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connected ? 'Deploy Strategy' : 'Connect Wallet'}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case 'analytics':
        return (
          <section className="py-8">
            <h2 className="text-3xl font-bold mb-8">Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Portfolio Performance</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  [Chart Placeholder - Connect to API]
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Yield Comparison</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  [Chart Placeholder - Connect to API]
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl md:col-span-2">
                <h3 className="text-lg font-bold mb-4">Risk Metrics</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Volatility (24h)', value: '3.45%', status: 'good' },
                    { label: 'Sharpe Ratio', value: '2.18', status: 'good' },
                    { label: 'Max Drawdown', value: '8.92%', status: 'warning' },
                    { label: 'Health Score', value: '87/100', status: 'good' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 bg-black/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                      <p className={`text-xl font-bold ${metric.status === 'good' ? 'text-green-400' : 'text-yellow-400'}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('overview')}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </motion.div>
            <div>
              <span className="text-xl font-bold tracking-wider block">SENTIENCE</span>
              <span className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase">AI Treasury</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'agents', label: 'Agents' },
              { id: 'strategies', label: 'Strategies' },
              { id: 'analytics', label: 'Analytics' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`text-sm transition-colors ${activeSection === item.id ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
            
            {connected ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white/5 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">{publicKey}</span>
                </div>
                <button onClick={disconnect} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={connect}
                className="px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
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
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'agents', label: 'Agents' },
                { id: 'strategies', label: 'Strategies' },
                { id: 'analytics', label: 'Analytics' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left py-2 border-b border-white/10 ${activeSection === item.id ? 'text-cyan-400' : 'text-white'}`}
                >
                  {item.label}
                </button>
              ))}
              
              {!connected ? (
                <button 
                  onClick={() => {
                    connect();
                    setIsMenuOpen(false);
                  }}
                  className="py-3 bg-cyan-400 text-black font-bold rounded-lg text-center text-lg"
                >
                  Connect Wallet
                </button>
              ) : (
                <button 
                  onClick={() => {
                    disconnect();
                    setIsMenuOpen(false);
                  }}
                  className="py-3 bg-red-400/20 text-red-400 font-bold rounded-lg text-center text-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Disconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-24 px-6 lg:px-12 max-w-7xl mx-auto">
        {renderSection()}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, change, changeType, icon: Icon }: { 
  label: string; 
  value: string; 
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group">
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

// Export main component with provider
export default function Dashboard() {
  return (
    <WalletProvider>
      <DashboardContent />
    </WalletProvider>
  );
}
