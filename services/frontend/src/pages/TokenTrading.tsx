import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  TrendingUp, 
  TrendingDown,
  Clock,
  Activity,
  Wallet,
  BarChart3
} from 'lucide-react';
import { cn, formatSats, formatNumber } from '@lib/utils';
import { 
  Layout, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge,
  PriceChart,
  OrderBookDepth,
  Input
} from '@components';
import type { OrderBook, PricePoint, Order } from '@types';

// Mock data
const mockOrderBook: OrderBook = {
  bids: [
    { price: 49500, quantity: 50, total: 2475000, order_count: 3 },
    { price: 49000, quantity: 75, total: 3675000, order_count: 5 },
    { price: 48500, quantity: 100, total: 4850000, order_count: 4 },
    { price: 48000, quantity: 120, total: 5760000, order_count: 6 },
    { price: 47500, quantity: 200, total: 9500000, order_count: 8 },
    { price: 47000, quantity: 150, total: 7050000, order_count: 5 },
    { price: 46500, quantity: 80, total: 3720000, order_count: 3 },
    { price: 46000, quantity: 100, total: 4600000, order_count: 4 },
  ],
  asks: [
    { price: 50500, quantity: 30, total: 1515000, order_count: 2 },
    { price: 51000, quantity: 45, total: 2295000, order_count: 3 },
    { price: 51500, quantity: 60, total: 3090000, order_count: 4 },
    { price: 52000, quantity: 80, total: 4160000, order_count: 5 },
    { price: 52500, quantity: 100, total: 5250000, order_count: 6 },
    { price: 53000, quantity: 70, total: 3710000, order_count: 4 },
    { price: 53500, quantity: 50, total: 2675000, order_count: 3 },
    { price: 54000, quantity: 40, total: 2160000, order_count: 2 },
  ],
  spread: 1000,
  last_price: 50000,
};

const mockPriceHistory: PricePoint[] = Array.from({ length: 100 }, (_, i) => {
  const basePrice = 48000;
  const randomChange = (Math.random() - 0.5) * 5000;
  const price = basePrice + randomChange + (i * 200);
  return {
    timestamp: Date.now() - (100 - i) * 3600000,
    open: price - Math.random() * 200,
    high: price + Math.random() * 300,
    low: price - Math.random() * 300,
    close: price,
    volume: Math.floor(Math.random() * 10000),
  };
});

const mockTrades = [
  { time: '14:32:05', price: 50000, quantity: 5, type: 'buy' },
  { time: '14:31:42', price: 49950, quantity: 12, type: 'sell' },
  { time: '14:31:18', price: 49950, quantity: 3, type: 'buy' },
  { time: '14:30:55', price: 49900, quantity: 8, type: 'sell' },
  { time: '14:30:31', price: 49900, quantity: 15, type: 'buy' },
  { time: '14:30:08', price: 49850, quantity: 6, type: 'sell' },
  { time: '14:29:45', price: 49850, quantity: 10, type: 'buy' },
  { time: '14:29:22', price: 49800, quantity: 4, type: 'sell' },
];

const mockOpenOrders: Order[] = [
  { id: '1', token_id: '1', user_id: '1', side: 'sell', type: 'limit', quantity: 10, price_sats: 51000, status: 'open', filled_quantity: 0, created_at: new Date().toISOString() },
];

export function TokenTrading() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');

  // Calculate total
  const total = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const prc = orderType === 'market' 
      ? (orderSide === 'buy' ? mockOrderBook.asks[0].price : mockOrderBook.bids[0].price)
      : (parseFloat(price) || 0);
    return qty * prc;
  }, [quantity, price, orderType, orderSide]);

  const currentPrice = mockOrderBook.last_price;
  const change24h = 2.3;
  const high24h = 52500;
  const low24h = 47500;
  const volume24h = 12500000;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back & Token Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
                Marketplace
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold">Downtown Office Building</h1>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{formatSats(currentPrice)} sats</span>
                <span className={cn(
                  'text-sm',
                  change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
                )}>
                  {change24h >= 0 ? '+' : ''}{change24h}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-foreground-secondary">24h High: </span>
              <span className="font-mono">{formatSats(high24h)}</span>
            </div>
            <div>
              <span className="text-foreground-secondary">24h Low: </span>
              <span className="font-mono">{formatSats(low24h)}</span>
            </div>
            <div>
              <span className="text-foreground-secondary">24h Vol: </span>
              <span className="font-mono">{formatSats(volume24h)}</span>
            </div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Chart & Order Book */}
          <div className="xl:col-span-2 space-y-6">
            {/* Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Price Chart
                </CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('candles')}
                    className={cn(
                      'px-3 py-1 rounded text-sm',
                      chartType === 'candles' ? 'bg-accent-bitcoin text-background' : 'bg-background-elevated'
                    )}
                  >
                    Candles
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={cn(
                      'px-3 py-1 rounded text-sm',
                      chartType === 'line' ? 'bg-accent-bitcoin text-background' : 'bg-background-elevated'
                    )}
                  >
                    Line
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <PriceChart data={mockPriceHistory} type={chartType} height={350} />
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card>
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderBookDepth orderBook={mockOrderBook} maxRows={8} />
              </CardContent>
            </Card>
          </div>

          {/* Order Form & Recent Trades */}
          <div className="space-y-6">
            {/* Order Form */}
            <Card>
              <CardHeader>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderSide('buy')}
                    className={cn(
                      'flex-1 py-2 rounded font-medium transition-colors',
                      orderSide === 'buy' 
                        ? 'bg-accent-green text-background' 
                        : 'bg-background-elevated text-foreground'
                    )}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderSide('sell')}
                    className={cn(
                      'flex-1 py-2 rounded font-medium transition-colors',
                      orderSide === 'sell' 
                        ? 'bg-accent-red text-background' 
                        : 'bg-background-elevated text-foreground'
                    )}
                  >
                    Sell
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType('limit')}
                    className={cn(
                      'flex-1 py-1.5 rounded text-sm',
                      orderType === 'limit' ? 'bg-accent-bitcoin/20 text-accent-bitcoin' : 'bg-background-elevated'
                    )}
                  >
                    Limit
                  </button>
                  <button
                    onClick={() => setOrderType('market')}
                    className={cn(
                      'flex-1 py-1.5 rounded text-sm',
                      orderType === 'market' ? 'bg-accent-bitcoin/20 text-accent-bitcoin' : 'bg-background-elevated'
                    )}
                  >
                    Market
                  </button>
                </div>

                {/* Price Input */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-xs text-foreground-secondary mb-1">
                      Price (sats)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-background-elevated border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-secondary">
                        sats
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity Input */}
                <div>
                  <label className="block text-xs text-foreground-secondary mb-1">
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-background-elevated border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-secondary">
                      units
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-3 rounded-lg bg-background-elevated">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground-secondary">Total</span>
                    <span className="font-mono">{formatSats(total)} sats</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-secondary">Fee (0.5%)</span>
                    <span className="font-mono">{formatSats(total * 0.005)} sats</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  fullWidth
                  size="lg"
                  variant={orderSide === 'buy' ? 'default' : 'danger'}
                >
                  {orderSide === 'buy' ? 'Buy' : 'Sell'} DOB
                </Button>

                {/* Balance */}
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Available</span>
                  <span className="font-mono">2,000,000 sats</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {mockTrades.map((trade, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-foreground-secondary text-xs font-mono">{trade.time}</span>
                      <span className={cn(
                        'font-mono',
                        trade.type === 'buy' ? 'text-accent-green' : 'text-accent-red'
                      )}>
                        {formatSats(trade.price)}
                      </span>
                      <span className="font-mono">{trade.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">My Open Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {mockOpenOrders.length === 0 ? (
                  <p className="text-sm text-foreground-secondary text-center py-4">
                    No open orders
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mockOpenOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-2 rounded bg-background-elevated text-sm">
                        <Badge variant={order.side === 'buy' ? 'success' : 'danger'} size="sm">
                          {order.side.toUpperCase()}
                        </Badge>
                        <span className="font-mono">{order.quantity} @ {formatSats(order.price_sats)}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-accent-red">
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
