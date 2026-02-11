'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { LogOut, Wallet, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomWalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch SOL balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / 1e9); // Convert lamports to SOL
      });
    }
  }, [connected, publicKey, connection]);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <WalletMultiButton
        className="!bg-cyan-400 !text-black !font-bold !px-6 !py-3 !rounded-xl !hover:bg-cyan-300 !transition-all !h-auto"
        startIcon={<Wallet className="w-5 h-5 mr-2" />}
      >
        Connect Wallet
      </WalletMultiButton>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold">
            {publicKey ? formatAddress(publicKey.toString()) : 'Connected'}
          </span>
          {balance !== null && (
            <span className="text-xs text-gray-500">{balance.toFixed(4)} SOL</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
          >
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
              <p className="text-sm font-mono break-all">{publicKey?.toString()}</p>
              {balance !== null && (
                <>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Balance</p>
                  <p className="text-sm font-bold text-cyan-400">{balance.toFixed(4)} SOL</p>
                </>
              )}
            </div>
            
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-2 text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
