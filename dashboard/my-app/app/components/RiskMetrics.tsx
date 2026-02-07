'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Activity,
  Droplets,
  Target
} from 'lucide-react';
import { RiskMetrics as RiskMetricsType } from '../types';
import { formatCurrency, formatPercentage, getHealthScoreColor, getHealthScoreBg } from '../utils';

interface RiskMetricsProps {
  metrics: RiskMetricsType;
}

export default function RiskMetrics({ metrics }: RiskMetricsProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-6 gradient-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">Risk Metrics</h2>
                <p className="text-sm text-gray-400">Portfolio health monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Health Score</span>
              <div className={`text-3xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                {metrics.healthScore}
              </div>
            </div>
          </div>
          
          {/* Main metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Health Score Card */}
            
            <MetricCard
              icon={<Shield className="w-5 h-5" />}
              label="Health Score"
              value={metrics.healthScore.toString()}
              subValue={metrics.healthScore >= 80 ? 'Excellent' : metrics.healthScore >= 60 ? 'Good' : 'At Risk'}
              color={getHealthScoreBg(metrics.healthScore)}
              delay={0}
            >
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.healthScore}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full rounded-full ${getHealthScoreBg(metrics.healthScore)}`}
                  />
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Risk</span>
                  <span>Optimal</span>
                </div>
              </div>
            </MetricCard>
            
            {/* Volatility Card */}
            
            <MetricCard
              icon={<Activity className="w-5 h-5" />}
              label="24h Volatility"
              value={formatPercentage(metrics.volatility24h)}
              subValue="Low risk"
              color="bg-blue-500"
              delay={0.1}
            >
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(metrics.volatility24h * 10, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{metrics.volatility24h.toFixed(2)}%</span>
              </div>
            </MetricCard>
            
            {/* Max Drawdown Card */}
            
            <MetricCard
              icon={<TrendingDown className="w-5 h-5" />}
              label="Max Drawdown"
              value={formatPercentage(-metrics.maxDrawdown)}
              subValue="Peak to trough"
              color="bg-amber-500"
              delay={0.2}
            />
            
            {/* Sharpe Ratio Card */}
            
            <MetricCard
              icon={<Target className="w-5 h-5" />}
              label="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              subValue="Risk-adjusted returns"
              color="bg-purple-500"
              delay={0.3}
            />
            
            {/* Liquid Assets Card */}
            
            <MetricCard
              icon={<Droplets className="w-5 h-5" />}
              label="Liquid Assets"
              value={`${metrics.liquidAssetsRatio.toFixed(1)}%`}
              subValue="Quick exit capacity"
              color="bg-cyan-500"
              delay={0.4}
            >
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${metrics.liquidAssetsRatio}%` }}
                  />
                </div>
              </div>
            </MetricCard>
            
            {/* Concentration Risk Card */}
            
            <MetricCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Concentration Risk"
              value={`${metrics.concentrationRisk.toFixed(1)}%`}
              subValue={metrics.concentrationRisk > 40 ? 'High - Diversify' : 'Moderate'}
              color={metrics.concentrationRisk > 40 ? 'bg-rose-500' : 'bg-emerald-500'}
              delay={0.5}
            />
          </div>
          
          {/* TVL Footer */}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 glass rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Total Value Locked</p>
                <p className="text-xl font-bold text-white">{formatCurrency(metrics.totalValueLocked)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color,
  delay,
  children 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string;
  color: string;
  delay: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 hover-lift"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-20 flex items-center justify-center text-white`}>
          {icon}
        </div>
        
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{subValue}</p>
      </div>
      
      {children}
    </motion.div>
  );
}
