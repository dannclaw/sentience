'use client';

import { motion } from 'framer-motion';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Sprout, 
  Package, 
  Repeat,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatTimeAgo, formatNumber } from '../utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const transactionIcons: Record<Transaction['type'], React.ReactNode> = {
  deposit: <ArrowDownLeft className="w-5 h-5" />,
  withdraw: <ArrowUpRight className="w-5 h-5" />,
  swap: <Repeat className="w-5 h-5" />,
  stake: <Sprout className="w-5 h-5" />,
  harvest: <Package className="w-5 h-5" />,
  rebalance: <RefreshCw className="w-5 h-5" />,
};

const transactionColors: Record<Transaction['type'], string> = {
  deposit: 'bg-emerald-500/20 text-emerald-400',
  withdraw: 'bg-rose-500/20 text-rose-400',
  swap: 'bg-blue-500/20 text-blue-400',
  stake: 'bg-purple-500/20 text-purple-400',
  harvest: 'bg-amber-500/20 text-amber-400',
  rebalance: 'bg-cyan-500/20 text-cyan-400',
};

const transactionLabels: Record<Transaction['type'], string> = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  swap: 'Swap',
  stake: 'Stake',
  harvest: 'Harvest',
  rebalance: 'Rebalance',
};

const statusIcons: Record<Transaction['status'], React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  pending: <Clock className="w-4 h-4 text-amber-400" />,
  failed: <XCircle className="w-4 h-4 text-rose-400" />,
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-6 gradient-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <p className="text-sm text-gray-400">Latest transactions</p>
              </div>
            </div>
            
            <button className="px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              View All
            </button>
          </div>
          
          {/* Transaction list */}
          <div className="space-y-3">
            {transactions.slice(0, 6).map((tx, index) => (
              <TransactionItem key={tx.id} transaction={tx} index={index} />
            ))}
          </div>
          
          {/* Empty state */}
          
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TransactionItem({ transaction, index }: { transaction: Transaction; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${transactionColors[transaction.type]} flex items-center justify-center shrink-0`}>
        {transactionIcons[transaction.type]}
      </div>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{transactionLabels[transaction.type]}</span>
          <span className="text-gray-400">{transaction.asset}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{formatTimeAgo(transaction.timestamp)}</span>
          <span>•</span>
          <span className="font-mono text-xs">{transaction.txHash?.slice(0, 8)}...{transaction.txHash?.slice(-6)}</span>
        </div>
      </div>
      
      {/* Value */}
      <div className="text-right">
        <p className="font-bold text-white">{formatCurrency(transaction.valueUsd)}</p>
        <p className="text-sm text-gray-400">{formatNumber(transaction.amount)} {transaction.asset}</p>
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-2">
        {statusIcons[transaction.status]}
      </div>
      
      {/* External link */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4 text-gray-500" />
      </div>
    </motion.div>
  );
}
