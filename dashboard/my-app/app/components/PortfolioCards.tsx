'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Coins, Droplets, Zap } from 'lucide-react';
import { PortfolioAsset } from '../types';
import { formatCurrency, formatNumber, formatPercentage, getChangeColor, getChangeBgColor } from '../utils';

interface PortfolioCardsProps {
  assets: PortfolioAsset[];
}

const assetIcons: Record<string, React.ReactNode> = {
  SOL: <Zap className="w-6 h-6" />,
  USDC: <Coins className="w-6 h-6" />,
  mSOL: <Droplets className="w-6 h-6" />,
  JTO: <Wallet className="w-6 h-6" />,
  BONK: <Coins className="w-6 h-6" />,
};

const assetColors: Record<string, string> = {
  SOL: 'from-violet-500 to-purple-600',
  USDC: 'from-emerald-500 to-teal-600',
  mSOL: "from-cyan-500 to-blue-600",
  JTO: 'from-amber-500 to-orange-600',
  BONK: 'from-pink-500 to-rose-600',
};

export default function PortfolioCards({ assets }: PortfolioCardsProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--accent-cyan)]" />
            Portfolio Overview
          </h2>
          <span className="text-sm text-gray-400">
            {assets.length} Assets
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {assets.map((asset, index) => (
            <AssetCard key={asset.symbol} asset={asset} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AssetCard({ asset, index }: { asset: PortfolioAsset; index: number }) {
  const isPositive = asset.priceChange24h >= 0;
  const colorClass = assetColors[asset.symbol] || 'from-gray-500 to-gray-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group"
    >
      <div className="glass rounded-2xl p-5 overflow-hidden hover-lift">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Top row: Icon and change */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
            {assetIcons[asset.symbol] || <Coins className="w-6 h-6" />}
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getChangeBgColor(asset.priceChange24h)}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
            <span className={`text-xs font-medium ${getChangeColor(asset.priceChange24h)}`}>
              {formatPercentage(asset.priceChange24h)}
            </span>
          </div>
        </div>
        
        {/* Asset name and balance */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white">{asset.symbol}</h3>
          <p className="text-sm text-gray-400">{asset.name}</p>
        </div>
        
        {/* Value and allocation */}
        <div className="space-y-1">
          <p className="text-xl font-bold text-white">{formatCurrency(asset.valueUsd)}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatNumber(asset.balance, asset.symbol === 'BONK' ? 0 : 2)} {asset.symbol}
            </span>
            <span className="text-xs text-[var(--accent-cyan)]">
              {asset.allocation.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Allocation bar */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${asset.allocation}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
          />
        </div>
        
        {/* Price */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-sm font-medium text-gray-300">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
