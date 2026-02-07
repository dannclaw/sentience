'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  Zap, 
  Settings2,
  ChevronRight,
  Timer
} from 'lucide-react';
import { Strategy } from '../types';
import { formatCurrency, formatTimeAgo, formatPercentage } from '../utils';

interface StrategyStatusProps {
  strategies: Strategy[];
}

const statusConfig: Record<Strategy['status'], { icon: React.ReactNode; color: string; label: string }> = {
  active: { 
    icon: <Play className="w-4 h-4" />, 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    label: 'Active'
  },
  paused: { 
    icon: <Pause className="w-4 h-4" />, 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'Paused'
  },
  error: { 
    icon: <AlertTriangle className="w-4 h-4" />, 
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    label: 'Error'
  },
};

const protocolColors: Record<string, string> = {
  'Kamino': 'from-purple-500 to-pink-600',
  'Marinade': 'from-cyan-500 to-blue-600',
  'Jito': 'from-amber-500 to-orange-600',
  'Multiple': 'from-emerald-500 to-teal-600',
  'Orca': 'from-pink-500 to-rose-600',
};

export default function StrategyStatus({ strategies }: StrategyStatusProps) {
  const activeCount = strategies.filter(s => s.status === 'active').length;
  const totalApy = strategies.reduce((acc, s) => acc + (s.currentApy * s.allocation / 100), 0);
  
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-6 gradient-border">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">Active Strategies</h2>
                <p className="text-sm text-gray-400">{activeCount}/{strategies.length} strategies running</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Blended APY</p>
                <p className="text-2xl font-bold text-emerald-400">{formatPercentage(totalApy)}</p>
              </div>
              
              <button className="p-3 glass rounded-xl hover:bg-white/10 transition-colors">
                <Settings2 className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Strategy cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy, index) => (
              <StrategyCard key={strategy.id} strategy={strategy} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StrategyCard({ strategy, index }: { strategy: Strategy; index: number }) {
  const status = statusConfig[strategy.status];
  const protocolColor = protocolColors[strategy.protocol] || 'from-gray-500 to-gray-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group glass rounded-2xl p-5 hover-lift cursor-pointer relative overflow-hidden"
    >
      {/* Protocol badge */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${protocolColor} text-white`}>
        {strategy.protocol}
      </div>
      
      <div className="relative">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border mb-4 ${status.color}`}>
          {status.icon}
          {status.label}
        </div>
        
        {/* Name and description */}
        <h3 className="text-lg font-bold text-white mb-1">{strategy.name}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{strategy.description}</p>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Allocation</p>
            <p className="text-lg font-bold text-white">{strategy.allocation}%</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Current APY</p>
            <p className="text-lg font-bold text-emerald-400">{formatPercentage(strategy.currentApy)}</p>
          </div>
        </div>
        
        {/* Value and rebalance */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <p className="text-xs text-gray-500">Value Deployed</p>
            <p className="font-medium text-white">{formatCurrency(strategy.totalValue)}</p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Timer className="w-3 h-3" />
            {formatTimeAgo(strategy.lastRebalance)}
          </div>
        </div>
        
        {/* Hover action */}
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-[var(--accent-cyan)]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
