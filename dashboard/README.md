# Sentience AI Treasury Dashboard

A sleek, modern, cyberpunk-themed dashboard for the Sentience AI treasury agent. Built for the $100K hackathon with stunning visuals and real-time data visualization.

![Dashboard Preview](./preview.png)

## Features

### 1. Hero Section
- Animated AI brain logo with rotating glow
- Project branding with gradient text
- Key metrics: Total Value Locked, Daily Yield, Active Strategies
- Live status indicator with pulsing animation

### 2. Portfolio Overview Cards
- 5 asset cards (SOL, USDC, mSOL, JTO, BONK)
- Real-time price changes with trend indicators
- Balance tracking with allocation bars
- Hover lift animations with gradient backgrounds

### 3. Kamino Positions
- Lending position cards with protocol branding
- APY display with quick actions (Supply/Withdraw)
- Market indicators and health factors
- Total value locked summary

### 4. Yield Performance Chart
- Interactive area chart with Recharts
- Multi-series data (Total, SOL, USDC, mSOL, Kamino)
- Time range selector (7d, 30d, 90d, All)
- Custom glassmorphism tooltip
- Series toggle controls

### 5. Recent Transactions
- Live transaction feed with animated entries
- Status indicators (completed, pending, failed)
- Transaction type icons and colors
- Time-ago formatting
- Transaction hash previews

### 6. Strategy Status Panel
- 5 active strategy cards
- Status badges (active, paused, error)
- Allocation percentages and APY
- Protocol branding
- Last rebalance timestamps

### 7. Risk Metrics
- Health score with progress bar
- 24h volatility tracking
- Max drawdown indicator
- Sharpe ratio display
- Liquid assets ratio
- Concentration risk analysis

## Design System

### Colors
- **Background**: `#0a0a0f` (deep space black)
- **Primary**: `#00f5ff` (neon cyan)
- **Secondary**: `#a855f7` (purple)
- **Accent**: `#ec4899` (pink)
- **Success**: `#10b981` (emerald)
- **Warning**: `#f97316` (orange)

### Effects
- **Glassmorphism**: `backdrop-filter: blur(20px)` with translucent borders
- **Gradient Borders**: Multi-color animated gradients on cards
- **Neon Glows**: Box-shadow glows on interactive elements
- **Animated Background**: Particle system with floating elements
- **Grid Pattern**: Subtle overlay for depth

### Typography
- **Font**: Inter (Google Fonts)
- **Headers**: Bold, tracking-tight
- **Body**: Regular, gray-400
- **Mono**: For numbers and hashes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## File Structure

```
app/
├── components/
│   ├── HeroSection.tsx       # Landing hero with branding
│   ├── PortfolioCards.tsx    # Asset overview cards
│   ├── KaminoPositions.tsx   # Lending positions
│   ├── YieldChart.tsx        # Performance chart
│   ├── RecentTransactions.tsx # Activity feed
│   ├── StrategyStatus.tsx    # Strategy cards
│   └── RiskMetrics.tsx       # Risk dashboard
├── types.ts                  # TypeScript interfaces
├── mockApi.ts               # Mock data generation
├── utils.ts                 # Formatting utilities
├── page.tsx                 # Main dashboard page
├── layout.tsx               # Root layout with fonts
└── globals.css              # Global styles & animations
```

## Getting Started

### Prerequisites
- Node.js 22+
- npm or yarn

### Installation

```bash
cd /home/ec2-user/.openclaw/workspace/sentience/dashboard/my-app
npm install
```

### Development

```bash
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
# Output in /dist folder
```

### Serve Static Build

```bash
cd dist
python3 -m http.server 3456
# Open http://localhost:3456
```

## Mock API

The dashboard uses a mock API (`mockApi.ts`) that simulates:
- Real-time portfolio data
- Historical yield data (30 days)
- Recent transactions
- Strategy statuses
- Risk metrics

To wire up a real API, replace the `fetchDashboardData` function in `mockApi.ts` with actual API calls.

## Animation Details

### Page Load Sequence
1. Loading screen with spinning logo (1.5s)
2. Hero section fade-in with staggered metrics
3. Portfolio cards slide up with delay
4. Charts animate in
5. Remaining sections follow

### Continuous Animations
- Floating particles (20s loop, randomized)
- Pulsing status indicators
- Gradient background shift (15s loop)
- Chart tooltips on hover

### Hover Interactions
- Cards lift up 4px
- Border glow intensifies
- Background gradients appear
- Scale 1.02 transform

## Performance

- Static export for fast loading
- Code-splitting by component
- Optimized images (unoptimized for static)
- CSS animations (GPU accelerated)
- 30s data refresh interval

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile responsive

## License

Built for the Sentience AI hackathon project.

## Credits

- Design inspired by [Sidex Trading](https://devs.sidex.fun/trading)
- Icons by [Lucide](https://lucide.dev)
- Fonts by [Google Fonts](https://fonts.google.com)
