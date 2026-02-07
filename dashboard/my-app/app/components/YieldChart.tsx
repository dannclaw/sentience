'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Calendar, Filter } from 'lucide-react';
import { YieldDataPoint } from '../types';
import { formatCurrency } from '../utils';

interface YieldChartProps {
  data: YieldDataPoint[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function YieldChart({ data }: YieldChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedSeries, setSelectedSeries] = useState<Record<string, boolean>>({
    totalYield: true,
    solYield: false,
    usdcYield: false,
    msolYield: false,
    kaminoYield: false,
  });
  
  const filteredData = data.slice(-30);
  
  const totalYield = data[data.length - 1]?.totalYield || 0;
  const yieldGrowth = data.length > 1 
    ? ((data[data.length - 1].totalYield - data[0].totalYield) / data[0].totalYield) * 100 
    : 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-strong p-4 rounded-xl border border-white/10">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const seriesConfig = [
    { key: 'totalYield', name: 'Total Yield', color: '#00f5ff', gradient: ['#00f5ff', '#00f5ff20'] },
    { key: 'solYield', name: 'SOL Yield', color: '#a855f7', gradient: ['#a855f7', '#a855f720'] },
    { key: 'usdcYield', name: 'USDC Yield', color: '#10b981', gradient: ['#10b981', '#10b98120'] },
    { key: 'msolYield', name: 'mSOL Yield', color: '#ec4899', gradient: ['#ec4899', '#ec489920'] },
    { key: 'kaminoYield', name: 'Kamino Yield', color: '#f97316', gradient: ['#f97316', '#f9731620'] },
  ];
  
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-6 gradient-border">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">Yield Performance</h2>
                <p className="text-sm text-gray-400">Cumulative returns over time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-white">{formatCurrency(totalYield)}</p>
                <p className={`text-sm ${yieldGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {yieldGrowth >= 0 ? '+' : ''}{yieldGrowth.toFixed(2)}%
                </p>
              </div>
              
              {/* Time range selector */}
              <div className="flex items-center gap-1 p-1 glass rounded-xl">
                {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range 
                        ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range === 'all' ? 'All' : range}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Series toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            {seriesConfig.map((series) => (
              <button
                key={series.key}
                onClick={() => setSelectedSeries(prev => ({ ...prev, [series.key]: !prev[series.key] }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedSeries[series.key] 
                    ? 'glass-strong' 
                    : 'glass opacity-50'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-gray-300">{series.name}</span>
              </button>
            ))}
          </div>
          
          {/* Chart */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {seriesConfig.map((series) => (
                    <linearGradient key={series.key} id={`gradient-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={series.gradient[0]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={series.gradient[1]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {selectedSeries.totalYield && (
                  <Area
                    type="monotone"
                    dataKey="totalYield"
                    name="Total Yield"
                    stroke="#00f5ff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-totalYield)"
                  />
                )}
                
                {selectedSeries.solYield && (
                  <Area
                    type="monotone"
                    dataKey="solYield"
                    name="SOL Yield"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-solYield)"
                  />
                )}
                
                {selectedSeries.usdcYield && (
                  <Area
                    type="monotone"
                    dataKey="usdcYield"
                    name="USDC Yield"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-usdcYield)"
                  />
                )}
                
                {selectedSeries.msolYield && (
                  <Area
                    type="monotone"
                    dataKey="msolYield"
                    name="mSOL Yield"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-msolYield)"
                  />
                )}
                
                {selectedSeries.kaminoYield && (
                  <Area
                    type="monotone"
                    dataKey="kaminoYield"
                    name="Kamino Yield"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-kaminoYield)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
