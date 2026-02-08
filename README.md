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

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
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
# Edit .env with your API keys (see Configuration below)

# Build the project
npm run build

# Run tests to verify everything works
npm test
```

### Configuration

Edit `.env` file:

```env
# Solana Configuration
SOLANA_ENV=devnet
HELIUS_API_KEY=your_helius_api_key_here

# Wallet (for devnet testing)
WALLET_PRIVATE_KEY=your_base58_private_key_here

# Risk Parameters
MAX_POSITION_SIZE=0.50
MAX_VOLATILITY=0.30
MAX_DRAWDOWN=0.20

# Strategy Parameters
REBALANCE_THRESHOLD=0.05
MIN_APY_THRESHOLD=3.0

# API Features
ENABLE_AUDIT_API=true
API_PORT=3000
```

### Running the Agent

```bash
# Start the main agent
npm start

# Or run specific components
npm run demo        # Run feature demo
npm run dashboard   # Start dashboard only
```

### Running the Dashboard

```bash
cd dashboard/my-app
npm install
npm run dev
# Open http://localhost:3000
```

## Testing

### Run All Tests

```bash
# Run the test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/__tests__/
├── core.test.ts           # Core logic tests (Treasury, Strategy, Risk)
├── integrations.test.ts   # Protocol integration tests
├── audit.test.ts          # Verifiable auditing tests
└── api.test.ts            # Paid API tests
```

### Manual Testing

```bash
# Test Jupiter swap integration
npm run test:manual:jupiter

# Test Kamino lending integration  
npm run test:manual:kamino

# Test full rebalance flow
npm run test:manual:rebalance
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNAL LAYER                              │
│   Pyth Price Feeds  │  Helius Webhooks  │  Mempool Monitor   │
└─────────────────────┴───────────────────┴─────────────────────┘
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
- **Verifiable Auditing**: SHA-256 commitments for every decision
- **Paid Intelligence API**: Other agents pay USDC for yield intelligence

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Blockchain** | Solana |
| **Language** | TypeScript |
| **DEX Aggregator** | Jupiter Ultra API |
| **Lending** | Kamino |
| **Staking** | Marinade |
| **Price Feeds** | Pyth |
| **RPC** | Helius |
| **Dashboard** | Next.js 15, React 19, Tailwind CSS |

## Project Structure

```
sentience/
├── src/
│   ├── core/              # Core business logic
│   │   ├── treasury.ts    # Treasury management
│   │   ├── strategy.ts    # Strategy engine
│   │   ├── risk.ts        # Risk manager
│   │   ├── audit.ts       # Verifiable auditing
│   │   └── api.ts         # Paid API service
│   ├── integrations/      # Protocol integrations
│   │   ├── jupiter.ts     # Jupiter DEX (Ultra API)
│   │   ├── kamino.ts      # Kamino lending
│   │   ├── marinade.ts    # Marinade staking
│   │   ├── pyth.ts        # Pyth price feeds
│   │   └── helius.ts      # Helius RPC
│   ├── __tests__/         # Test suites
│   ├── config.ts          # Configuration
│   ├── demo-features.ts   # Feature demos
│   ├── index.ts           # Main agent orchestrator
│   └── main.ts            # Entry point
├── dashboard/             # Next.js dashboard
│   └── my-app/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SOLANA_ENV` | `devnet` or `mainnet` | Yes |
| `HELIUS_API_KEY` | Helius RPC API key | Yes |
| `WALLET_PRIVATE_KEY` | Treasury wallet private key | Yes (for execution) |
| `MAX_POSITION_SIZE` | Max % of treasury per position | No (default: 0.5) |
| `MAX_VOLATILITY` | Max volatility threshold | No (default: 0.3) |
| `MAX_DRAWDOWN` | Max drawdown before halt | No (default: 0.2) |
| `API_PORT` | Port for API server | No (default: 3000) |

## Demo

```bash
# Run all feature demos
npm run demo

# This will demonstrate:
# 1. Treasury initialization
# 2. Strategy commitment and execution
# 3. Risk assessment flow
# 4. Verifiable auditing (commit → reveal → verify)
# 5. Paid API endpoints
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the main agent |
| `npm run build` | Compile TypeScript |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run demo` | Run feature demonstrations |
| `npm run dashboard` | Start dashboard dev server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Clean build artifacts |

## Roadmap

- [x] Core architecture
- [x] Protocol integrations (Jupiter, Kamino, Marinade)
- [x] Risk management
- [x] Web dashboard
- [x] Helius RPC integration
- [x] Verifiable auditing (SHA-256 commitments)
- [x] Paid Intelligence API
- [ ] On-chain program (Anchor)
- [ ] Multi-sig treasury
- [ ] Advanced ML strategies
- [ ] Mainnet deployment

## Troubleshooting

### Common Issues

**1. Helius API errors**
```
Error: 401 Unauthorized
```
- Check your `HELIUS_API_KEY` is valid
- Verify you're using the correct environment (devnet/mainnet)

**2. Build errors**
```
Cannot find module '@solana/web3.js'
```
- Run `npm install` again
- Delete `node_modules` and reinstall

**3. Test failures**
```
Jest: Test suite failed to run
```
- Run `npm run build` first
- Check TypeScript compiles: `npx tsc --noEmit`

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
