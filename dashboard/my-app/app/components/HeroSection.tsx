'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity } from 'lucide-react';
import { formatCurrency } from '../utils';

interface HeroSectionProps {
  totalValue: number;
  dailyYield: number;
  activeStrategies: number;
}

export default function HeroSection({ totalValue, dailyYield, activeStrategies }: HeroSectionProps) {
  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-cyan)]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo and branding */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl gradient-border flex items-center justify-center glow-cyan">
                <Brain className="w-8 h-8 text-[var(--accent-cyan)]" />
              </div>
            </motion.div>
            
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
                  Sentience
                </span>
              </h1>
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                AI Treasury Agent
              </p>
            </div>
          </div>
          
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Autonomous DeFi yield optimization on Solana. 
            <span className="text-[var(--accent-cyan)]">Self-aware. Self-improving. Always on.</span>
          </motion.p>
          
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <MetricCard
              icon={<Sparkles className="w-5 h-5 text-[var(--accent-cyan)]" />}
              label="Total Value Locked"
              value={formatCurrency(totalValue)}
              delay={0.4}
            />
            
            <MetricCard
              icon={<Activity className="w-5 h-5 text-[var(--accent-purple)]" />}
              label="Daily Yield"
              value={formatCurrency(dailyYield)}
              subValue="+8.45% APY"
              delay={0.5}
            />
            
            <MetricCard
              icon={<Brain className="w-5 h-5 text-[var(--accent-pink)]" />}
              label="Active Strategies"
              value={activeStrategies.toString()}
              subValue="AI-Optimized"
              delay={0.6}
            />
          </div>
          
          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-gray-400">
              Agent Active • Monitoring <span className="text-emerald-400">24/7</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  delay 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-4 hover-lift gradient-border"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && (
        <p className="text-sm text-[var(--accent-cyan)]">{subValue}</p>
      )}
    </motion.div>
  );
}
