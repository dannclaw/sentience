'use client';

import { motion } from 'framer-motion';
import { Landmark, TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { KaminoPosition } from '../types';
import { formatCurrency, formatPercentage, formatNumber } from '../utils';

interface KaminoPositionsProps {
  positions: KaminoPosition[];
}

export default function KaminoPositions({ positions }: KaminoPositionsProps) {
  const totalValue = positions.reduce((acc, p) => acc + p.valueUsd, 0);
  const weightedApy = positions.reduce((acc, p) => acc + (p.apy * p.valueUsd / totalValue), 0);
  
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Kamino Positions</h2>
              <p className="text-sm text-gray-400">Lending markets • {formatCurrency(totalValue)} TVL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">Avg APY:</span>
            <span className="text-lg font-bold text-emerald-400">{weightedApy.toFixed(2)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {positions.map((position, index) => (
            <PositionCard key={position.id} position={position} index={index} />
          ))}
          
          {/* Add Position CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: positions.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[var(--accent-cyan)]/30 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[var(--accent-cyan)]/10 transition-colors">
              <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--accent-cyan)] transition-colors" />
            </div>
            <p className="text-sm font-medium text-gray-300">Add Position</p>
            <p className="text-xs text-gray-500">Deposit to Kamino</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PositionCard({ position, index }: { position: KaminoPosition; index: number }) {
  const isLending = position.type === 'lend';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 hover-lift gradient-border relative overflow-hidden"
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${isLending ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isLending ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isLending ? 'Lending' : 'Borrowing'}
            </span>
            <span className="text-xs text-gray-400">{position.market}</span>
          </div>
          
          {position.healthFactor && (
            <div className="flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{position.healthFactor.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* Asset info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {position.asset.slice(0, 2)}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white">{formatCurrency(position.valueUsd)}</h3>
            <p className="text-sm text-gray-400">
              {formatNumber(position.amount)} {position.asset}
            </p>
          </div>
        </div>
        
        {/* APY */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-400">APY</span>
          </div>
          
          <span className="text-xl font-bold text-emerald-400">
            {formatPercentage(position.apy)}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors">
            <span className="flex items-center justify-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Supply
            </span>
          </button>
          
          <button className="flex-1 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors">
            <span className="flex items-center justify-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              Withdraw
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
