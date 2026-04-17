# RWA Tokenization Platform - Frontend

Web application and PWA for the RWA Tokenization Platform on Bitcoin.

## Design Aesthetic

**Mempool.space-inspired**: Dark, technical, Bitcoin-native aesthetic with:
- Deep black backgrounds (`#0a0a0f`)
- Subtle Bitcoin orange accents (`#f7931a`)
- Monospace typography for data display
- Glassmorphism cards with subtle borders
- Real-time data visualizations

## Stack

- **Framework**: React 18 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Custom CSS
- **Build**: Vite 5
- **State**: Zustand (global) + React Query (server state)
- **Routing**: React Router v6
- **Charts**: Lightweight Charts (TradingView) + Recharts
- **PWA**: Workbox

## Project Structure

```
src/
├── components/
│   ├── ui/               # Base UI components (Button, Card, Input, Badge)
│   └── specialized/      # Domain-specific components (SatoshiAmount, AIScoreGauge, etc.)
├── pages/                # Route components
├── stores/               # Zustand stores (auth, wallet, trade, notifications)
├── hooks/                # Custom React hooks (WebSocket, auth, auto-logout)
├── lib/                  # Utilities and helpers
├── types/                # TypeScript type definitions
└── App.tsx               # Main app with routing
```

## Key Components

### Specialized Components
- `SatoshiAmount` - Bitcoin amount formatting with fiat conversion
- `BitcoinAddress` - Address display with QR code and copy
- `LightningInvoice` - BOLT11 invoice display with QR
- `AIScoreGauge` - Circular gauge for AI evaluation scores
- `EscrowStatusTracker` - Multi-step progress for escrow status
- `PriceChart` - Candlestick/line charts with Lightweight Charts
- `OrderBookDepth` - Visual depth chart for trading

### Pages
- `/` - Landing page with animated node background
- `/auth/login` - Authentication
- `/auth/register` - Registration wizard
- `/dashboard` - Portfolio overview
- `/wallet` - Wallet management
- `/assets` - Tokenized asset browser
- `/assets/submit` - Asset submission wizard
- `/marketplace` - Trading interface
- `/education` - Course catalog
- `/admin` - Admin dashboard

## Getting Started

### Quick Start (Frontend Only)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Full Stack (Backend + Frontend)

#### Option 1: Using the start script (Recommended)

```bash
# Start both backend and frontend
./start-dev.sh

# Or start individually:
./start-dev.sh backend    # Start only backend
./start-dev.sh frontend   # Start only frontend
./start-dev.sh stop       # Stop all services
./start-dev.sh health     # Check service health
```

#### Option 2: Manual Docker Compose

```bash
# 1. Start backend services (from infra directory)
cd ../../infra
cp .env.local.example .env.local
docker compose -f docker-compose.local.yml up -d

# 2. Wait for services to be ready (~30 seconds)
curl http://localhost:8000/health

# 3. Start frontend (from this directory)
cd services/frontend
npm install
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Gateway (API) | http://localhost:8000 |
| Health Check | http://localhost:8000/health |

### Building for Production

```bash
npm run build
```

The build output will be in `dist/` directory.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=wss://localhost:8000/ws
```

## Reference

See [frontend-spec.md](../../specs/frontend-spec.md) for full UI/UX specification.
