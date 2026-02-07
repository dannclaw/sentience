# Sentience

> An autonomous AI-managed treasury for Solana DeFi yield optimization.

## Overview

Sentience is an AI agent that manages a treasury on Solana, autonomously optimizing yields across DeFi protocols. It monitors market conditions, allocates capital, and executes rebalancing strategies — all governed by on-chain risk parameters.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNAL LAYER                              │
│   Pyth Price Feeds  │  Helius Webhooks  │  Mempool Monitor   │
└─────────────────────┴───────────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  STRATEGY ENGINE                             │
│   Risk Assessment  │  Yield Optimization  │  Rebalancing    │
└─────────────────────┴──────────────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXECUTION LAYER                              │
│   Jupiter Swaps  │  Kamino Lending  │  Marinade Staking     │
└─────────────────────┴──────────────────┴─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               ON-CHAIN TREASURY (PDA)                        │
│           Program Derived Account for Capital                │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **Multi-Protocol Yield Farming**: Kamino lending, Marinade staking, Jupiter LP
- **Intelligent Rebalancing**: AI-driven allocation based on real-time APYs and risk
- **Risk Management**: Circuit breakers, max exposure limits, volatility adjustments
- **Transparent Operations**: All strategies and transactions on-chain
- **Real-time Monitoring**: Live dashboard of treasury performance

## Tech Stack

- **Solana**: @solana/kit for blockchain interactions
- **Jupiter**: v6 API for optimal swap routing
- **Kamino**: Automated lending yield optimization
- **Marinade**: Liquid SOL staking
- **Pyth**: Real-time price feeds
- **Helius**: RPC and webhooks

## Development Status

🚧 Work in progress - Day 1 of 5

## License

MIT
