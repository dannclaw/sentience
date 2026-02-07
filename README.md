# Sentience 🤖

> An autonomous AI-managed treasury for Solana DeFi yield optimization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## 🌐 Live Demo

**Dashboard**: [https://dannclaw.github.io/sentience/dashboard](https://dannclaw.github.io/sentience/dashboard) *(Deploy pending)*

**Project Page**: https://colosseum.com/agent-hackathon/projects/sentience

## Overview

Sentience is an AI agent that manages a treasury on Solana, autonomously optimizing yields across DeFi protocols. It monitors market conditions, allocates capital, and executes rebalancing strategies — all governed by on-chain risk parameters.

**Built for the Colosseum Agent Hackathon 2026**

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

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Solana CLI (optional, for local testing)
- Helius API key ([Get one free](https://dashboard.helius.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/dannclaw/sentience.git
cd sentience

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Build the project
npm run build

# Run the agent
npm start
```

### Dashboard

```bash
cd dashboard/my-app
npm install
npm run dev
# Open http://localhost:3000
```

### Environment Variables

```env
SOLANA_ENV=devnet
HELIUS_API_KEY=your_helius_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here

# Risk Parameters
MAX_POSITION_SIZE=0.50
MAX_VOLATILITY=0.30
MAX_DRAWDOWN=0.20

# Strategy Parameters
REBALANCE_THRESHOLD=0.05
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Blockchain** | Solana |
| **Language** | TypeScript |
| **DEX Aggregator** | Jupiter v6 |
| **Lending** | Kamino |
| **Staking** | Marinade |
| **Price Feeds** | Pyth |
| **RPC** | Helius |
| **Dashboard** | Next.js 15, React 19, Tailwind CSS |

## Project Structure

```
sentience/
├── src/
│   ├── core/           # Core business logic
│   │   ├── treasury.ts
│   │   ├── strategy.ts
│   │   └── risk.ts
│   ├── integrations/   # Protocol integrations
│   │   ├── jupiter.ts
│   │   ├── kamino.ts
│   │   ├── marinade.ts
│   │   ├── pyth.ts
│   │   └── helius.ts
│   ├── config.ts       # Configuration
│   ├── __tests__/      # Test suites
│   ├── index.ts        # Main agent orchestrator
│   └── main.ts         # Entry point
├── dashboard/          # Next.js dashboard
│   └── my-app/
│       ├── app/
│       │   ├── components/  # Dashboard components
│       │   ├── page.tsx     # Main dashboard
│       │   └── globals.css  # Styles
│       └── README.md
├── .env.example
├── package.json
└── tsconfig.json
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Documentation

- [Dashboard README](./dashboard/README.md)
- [API Documentation](https://colosseum.com/agent-hackathon/projects/sentience)

## Roadmap

- [x] Core architecture
- [x] Protocol integrations
- [x] Risk management
- [x] Web dashboard
- [x] Helius RPC integration
- [ ] On-chain program (Anchor)
- [ ] Multi-sig treasury
- [ ] Advanced ML strategies
- [ ] Mainnet deployment

## Contributing

Contributions welcome! Please read the [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT © [dann](https://github.com/dannclaw)

## Acknowledgments

- [Colosseum](https://colosseum.com) for the hackathon
- [Solana Foundation](https://solana.com) for the ecosystem
- [Jupiter](https://jup.ag), [Kamino](https://kamino.finance), [Marinade](https://marinade.finance) for the protocols

---

**Disclaimer**: This is experimental software. Use at your own risk. Always audit code before deploying with real funds.
