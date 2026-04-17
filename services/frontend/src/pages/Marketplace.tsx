import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react';
import { cn, formatSats, formatPercentage, formatNumber } from '@lib/utils';
import { Layout, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@components';
import type { Token, Asset } from '@types';

// Mock data
interface MarketToken extends Token {
  asset: Asset;
  change24h: number;
  volume24h: number;
}

const mockMarketTokens: MarketToken[] = [
  {
    id: '1',
    asset_id: '1',
    total_supply: 1000,
    unit_price_sats: 50000,
    market_cap_sats: 50000000,
    minted_at: new Date().toISOString(),
    asset_group_key: 'key1',
    asset: {
      id: '1',
      name: 'Downtown Office Building',
      description: 'Prime commercial real estate',
      category: 'real_estate',
      status: 'tokenized',
      submitted_by: 'user1',
      submitted_at: new Date().toISOString(),
      estimated_value_sats: 50000000,
      supporting_documents: [],
      ai_evaluation: { score: 85, risk_level: 'low', projected_roi_percent: 12.5, summary: 'Strong asset', evaluated_at: new Date().toISOString() },
      token: { id: '1', asset_id: '1', total_supply: 1000, unit_price_sats: 50000, market_cap_sats: 50000000, minted_at: new Date().toISOString(), asset_group_key: 'key1' },
    },
    change24h: 2.3,
    volume24h: 2500000,
  },
  {
    id: '2',
    asset_id: '2',
    total_supply: 2000,
    unit_price_sats: 15000,
    market_cap_sats: 30000000,
    minted_at: new Date().toISOString(),
    asset_group_key: 'key2',
    asset: {
      id: '2',
      name: 'Solar Farm Alpha',
      description: '100MW solar installation',
      category: 'energy',
      status: 'tokenized',
      submitted_by: 'user2',
      submitted_at: new Date().toISOString(),
      estimated_value_sats: 30000000,
      supporting_documents: [],
      ai_evaluation: { score: 78, risk_level: 'medium', projected_roi_percent: 9.2, summary: 'Renewable energy growth', evaluated_at: new Date().toISOString() },
      token: { id: '2', asset_id: '2', total_supply: 2000, unit_price_sats: 15000, market_cap_sats: 30000000, minted_at: new Date().toISOString(), asset_group_key: 'key2' },
    },
    change24h: -1.2,
    volume24h: 1200000,
  },
  {
    id: '3',
    asset_id: '3',
    total_supply: 500,
    unit_price_sats: 30000,
    market_cap_sats: 15000000,
    minted_at: new Date().toISOString(),
    asset_group_key: 'key3',
    asset: {
      id: '3',
      name: 'Art Collection Beta',
      description: 'Curated contemporary art',
      category: 'art',
      status: 'tokenized',
      submitted_by: 'user3',
      submitted_at: new Date().toISOString(),
      estimated_value_sats: 15000000,
      supporting_documents: [],
      ai_evaluation: { score: 72, risk_level: 'medium', projected_roi_percent: 15.8, summary: 'High appreciation potential', evaluated_at: new Date().toISOString() },
      token: { id: '3', asset_id: '3', total_supply: 500, unit_price_sats: 30000, market_cap_sats: 15000000, minted_at: new Date().toISOString(), asset_group_key: 'key3' },
    },
    change24h: 5.7,
    volume24h: 800000,
  },
];

function MarketOverview() {
  const totalVolume = mockMarketTokens.reduce((sum, t) => sum + t.volume24h, 0);
  const totalMarketCap = mockMarketTokens.reduce((sum, t) => sum + t.market_cap_sats, 0);
  const avgChange = mockMarketTokens.reduce((sum, t) => sum + t.change24h, 0) / mockMarketTokens.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">24h Volume</p>
          <p className="font-mono font-medium">{formatSats(totalVolume)} sats</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Market Cap</p>
          <p className="font-mono font-medium">{formatSats(totalMarketCap)} sats</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Tokens</p>
          <p className="font-mono font-medium">{mockMarketTokens.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Avg Change (24h)</p>
          <p className={cn(
            'font-mono font-medium',
            avgChange >= 0 ? 'text-accent-green' : 'text-accent-red'
          )}>
            {formatPercentage(avgChange)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TokenRow({ token }: { token: MarketToken }) {
  return (
    <Link to={`/marketplace/${token.id}`}>
      <div className="flex items-center justify-between p-4 rounded-lg bg-background-surface hover:bg-background-elevated transition-colors group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
            <Activity className="text-accent-bitcoin" size={24} />
          </div>
          <div>
            <h3 className="font-medium group-hover:text-accent-bitcoin transition-colors">
              {token.asset.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" size="sm">
                {token.asset.category.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-foreground-secondary">
                AI Score: {token.asset.ai_evaluation?.score}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden md:block">
            <p className="font-mono font-medium">{formatSats(token.unit_price_sats)} sats</p>
            <p className="text-xs text-foreground-secondary">per unit</p>
          </div>

          <div className="text-right hidden sm:block">
            <p className="font-mono text-sm">{formatSats(token.market_cap_sats)}</p>
            <p className="text-xs text-foreground-secondary">market cap</p>
          </div>

          <div className={cn(
            'flex items-center gap-1',
            token.change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
          )}>
            {token.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-medium">{formatPercentage(token.change24h)}</span>
          </div>

          <ArrowRight size={18} className="text-foreground-secondary group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('volume');

  const filteredTokens = useMemo(() => {
    let tokens = [...mockMarketTokens];
    
    if (searchQuery) {
      tokens = tokens.filter(t => 
        t.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.asset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'price':
        tokens.sort((a, b) => b.unit_price_sats - a.unit_price_sats);
        break;
      case 'change':
        tokens.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'volume':
        tokens.sort((a, b) => b.volume24h - a.volume24h);
        break;
    }

    return tokens;
  }, [searchQuery, sortBy]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-foreground-secondary">Trade tokenized real-world assets</p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-accent-bitcoin" />
            <span className="text-sm text-foreground-secondary">Live market data</span>
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
              >
                <option value="volume">Sort by Volume</option>
                <option value="price">Sort by Price</option>
                <option value="change">Sort by 24h Change</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Token List */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Available Tokens</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredTokens.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground-secondary">No tokens found</p>
                </div>
              ) : (
                filteredTokens.map(token => (
                  <TokenRow key={token.id} token={token} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
