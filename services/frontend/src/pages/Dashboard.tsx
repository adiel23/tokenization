import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet, 
  Building2, 
  TrendingUp,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { cn, formatSats, formatPercentage, formatRelativeTime } from '@lib/utils';
import { Layout, SatoshiAmount } from '@components/specialized';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useWalletStore } from '../stores';
import type { TokenBalance, Transaction } from '../types';

// Mock data
const mockTokenBalances: TokenBalance[] = [
  { token_id: '1', asset_name: 'Downtown Office Building', asset_symbol: 'DOB', balance: 50, value_sats: 500000, change_24h: 2.3 },
  { token_id: '2', asset_name: 'Solar Farm Alpha', asset_symbol: 'SFA', balance: 120, value_sats: 360000, change_24h: -1.2 },
  { token_id: '3', asset_name: 'Art Collection Beta', asset_symbol: 'ACB', balance: 25, value_sats: 250000, change_24h: 5.7 },
];

const mockTransactions: Transaction[] = [
  { id: '1', wallet_id: '1', type: 'deposit', amount_sats: 1000000, fee_sats: 0, status: 'confirmed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', wallet_id: '1', type: 'trade', amount_sats: -500000, fee_sats: 1000, status: 'confirmed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', wallet_id: '1', type: 'yield', amount_sats: 15000, fee_sats: 0, status: 'confirmed', created_at: new Date(Date.now() - 172800000).toISOString() },
];

const mockOpenOrders = [
  { id: '1', token_symbol: 'DOB', side: 'sell', quantity: 10, price_sats: 10000, total_sats: 100000 },
  { id: '2', token_symbol: 'SFA', side: 'buy', quantity: 50, price_sats: 3000, total_sats: 150000 },
];

function BalanceCard() {
  // Mock values for demo
  const totalSats = 2000000 + mockTokenBalances.reduce((sum, t) => sum + t.value_sats, 0);
  const change24h = 5.2;

  return (
    <Card glow="bitcoin">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} className="text-accent-bitcoin" />
          Total Balance
        </CardTitle>
        <CardDescription>Combined BTC and token value</CardDescription>
      </CardHeader>
      <CardContent>
        <SatoshiAmount 
          amount={totalSats} 
          showFiat 
          size="xl" 
          highlight 
        />
        <div className="flex items-center gap-2 mt-2">
          <span className={cn(
            'flex items-center gap-1 text-sm font-medium',
            change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
          )}>
            {change24h >= 0 ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            {formatPercentage(change24h)}
          </span>
          <span className="text-foreground-secondary text-sm">24h change</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceBreakdownCard() {
  const onchain = 1500000;
  const lightning = 500000;
  const tokens = mockTokenBalances.reduce((sum, t) => sum + t.value_sats, 0);

  const total = onchain + lightning + tokens;
  const data = [
    { label: 'On-chain', value: onchain, color: 'bg-accent-bitcoin', percent: (onchain / total) * 100 },
    { label: 'Lightning', value: lightning, color: 'bg-accent-green', percent: (lightning / total) * 100 },
    { label: 'Tokens', value: tokens, color: 'bg-accent-blue', percent: (tokens / total) * 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4">
          {data.map((item) => (
            <div 
              key={item.label}
              className={cn(item.color, 'transition-all')}
              style={{ width: `${item.percent}%` }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', item.color)} />
                <span className="text-sm text-foreground-secondary">{item.label}</span>
              </div>
              <span className="font-mono text-sm">{formatSats(item.value)} sats</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioTable() {
  const tokens = mockTokenBalances; // Use mock data

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} className="text-accent-bitcoin" />
            Token Portfolio
          </CardTitle>
          <CardDescription>Your tokenized asset holdings</CardDescription>
        </div>
        <Link to="/assets">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Asset</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">Units</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">Value</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">24h</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.token_id} className="border-b border-border/50 hover:bg-background-elevated/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center">
                        <span className="text-accent-bitcoin font-bold text-xs">{token.asset_symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{token.asset_name}</p>
                        <p className="text-xs text-foreground-secondary">{token.asset_symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-sm">{token.balance}</td>
                  <td className="py-3 text-right">
                    <SatoshiAmount amount={token.value_sats} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <span className={cn(
                      'text-sm font-medium',
                      token.change_24h >= 0 ? 'text-accent-green' : 'text-accent-red'
                    )}>
                      {formatPercentage(token.change_24h)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed() {
  const txs = mockTransactions;

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="text-accent-green" size={16} />;
      case 'withdrawal': return <ArrowUpRight className="text-accent-red" size={16} />;
      case 'trade': return <Activity className="text-accent-bitcoin" size={16} />;
      case 'yield': return <Zap className="text-accent-bitcoin" size={16} />;
      default: return <Clock className="text-foreground-secondary" size={16} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'trade': return 'Trade';
      case 'yield': return 'Yield';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 5 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{getLabel(tx.type)}</p>
                  <p className="text-xs text-foreground-secondary">{formatRelativeTime(tx.created_at)}</p>
                </div>
              </div>
              <span className={cn(
                'font-mono text-sm',
                tx.amount_sats >= 0 ? 'text-accent-green' : 'text-foreground'
              )}>
                {tx.amount_sats >= 0 ? '+' : ''}{formatSats(Math.abs(tx.amount_sats))} sats
              </span>
            </div>
          ))}
        </div>
        <Link to="/wallet/history">
          <Button variant="ghost" fullWidth className="mt-4">
            View All History
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function OpenOrders() {
  const orders = mockOpenOrders;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Open Orders</CardTitle>
          <CardDescription>Active buy/sell orders</CardDescription>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" size="sm">Marketplace</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-foreground-secondary py-4">No open orders</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated">
                <div className="flex items-center gap-3">
                  <Badge variant={order.side === 'buy' ? 'success' : 'danger'}>
                    {order.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{order.token_symbol}</p>
                    <p className="text-xs text-foreground-secondary">{order.quantity} units @ {formatSats(order.price_sats)}</p>
                  </div>
                </div>
                <span className="font-mono text-sm">{formatSats(order.total_sats)} sats</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { setTokenBalances, setTransactions } = useWalletStore();

  useEffect(() => {
    // Load mock data
    setTokenBalances(mockTokenBalances);
    setTransactions(mockTransactions);
  }, [setTokenBalances, setTransactions]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-foreground-secondary">Welcome back to your portfolio</p>
          </div>
          <div className="flex gap-3">
            <Link to="/wallet/deposit">
              <Button variant="outline">Deposit</Button>
            </Link>
            <Link to="/assets/submit">
              <Button>Submit Asset</Button>
            </Link>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <BalanceCard />
          <BalanceBreakdownCard />
        </div>

        {/* Portfolio */}
        <PortfolioTable />

        {/* Activity & Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <OpenOrders />
        </div>
      </div>
    </Layout>
  );
}
