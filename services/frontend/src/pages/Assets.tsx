import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Plus
} from 'lucide-react';
import { cn, formatSats, formatPercentage } from '@lib/utils';
import { Layout, AIScoreGauge } from '@components/specialized';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import type { Asset } from '../types';

// Mock data
const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Downtown Office Building',
    description: 'Prime commercial real estate in the financial district',
    category: 'real_estate',
    status: 'tokenized',
    submitted_by: 'user1',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 50000000,
    supporting_documents: [],
    ai_evaluation: { score: 85, risk_level: 'low', projected_roi_percent: 12.5, summary: 'Strong asset with consistent rental income', evaluated_at: new Date().toISOString() },
    token: { id: '1', asset_id: '1', total_supply: 1000, unit_price_sats: 50000, market_cap_sats: 50000000, minted_at: new Date().toISOString(), asset_group_key: 'key1' },
  },
  {
    id: '2',
    name: 'Solar Farm Alpha',
    description: '100MW solar energy installation in Arizona',
    category: 'energy',
    status: 'tokenized',
    submitted_by: 'user2',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 30000000,
    supporting_documents: [],
    ai_evaluation: { score: 78, risk_level: 'medium', projected_roi_percent: 9.2, summary: 'Growing demand for renewable energy', evaluated_at: new Date().toISOString() },
    token: { id: '2', asset_id: '2', total_supply: 2000, unit_price_sats: 15000, market_cap_sats: 30000000, minted_at: new Date().toISOString(), asset_group_key: 'key2' },
  },
  {
    id: '3',
    name: 'Contemporary Art Collection',
    description: 'Curated collection of modern digital and physical art',
    category: 'art',
    status: 'tokenized',
    submitted_by: 'user3',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 15000000,
    supporting_documents: [],
    ai_evaluation: { score: 72, risk_level: 'medium', projected_roi_percent: 15.8, summary: 'High volatility but strong appreciation potential', evaluated_at: new Date().toISOString() },
    token: { id: '3', asset_id: '3', total_supply: 500, unit_price_sats: 30000, market_cap_sats: 15000000, minted_at: new Date().toISOString(), asset_group_key: 'key3' },
  },
  {
    id: '4',
    name: 'Agricultural Land - Iowa',
    description: '500 acres of prime farmland with modern irrigation',
    category: 'agriculture',
    status: 'approved',
    submitted_by: 'user4',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 25000000,
    supporting_documents: [],
    ai_evaluation: { score: 88, risk_level: 'low', projected_roi_percent: 7.5, summary: 'Stable agricultural asset with consistent yields', evaluated_at: new Date().toISOString() },
  },
  {
    id: '5',
    name: 'Gold Reserves - Nevada',
    description: 'Physical gold bullion stored in secure vaults',
    category: 'commodities',
    status: 'evaluating',
    submitted_by: 'user5',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 80000000,
    supporting_documents: [],
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'energy', label: 'Energy' },
  { value: 'art', label: 'Art' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'infrastructure', label: 'Infrastructure' },
];

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'tokenized', label: 'Tokenized' },
  { value: 'approved', label: 'Approved' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'submitted', label: 'Submitted' },
];

function AssetCard({ asset }: { asset: Asset }) {
  const change24h = Math.random() * 20 - 10; // Mock 24h change
  const isTokenized = asset.status === 'tokenized';
  
  return (
    <Link to={`/assets/${asset.id}`}>
      <Card className="h-full hover:border-accent-bitcoin/30 transition-all group">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
              <Building2 className="text-accent-bitcoin" size={24} />
            </div>
            <Badge 
              variant={isTokenized ? 'success' : asset.status === 'approved' ? 'warning' : 'secondary'}
            >
              {asset.status}
            </Badge>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-bitcoin transition-colors">
            {asset.name}
          </h3>
          <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">
            {asset.description}
          </p>

          {/* AI Score if available */}
          {asset.ai_evaluation && (
            <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-background-elevated">
              <AIScoreGauge score={asset.ai_evaluation.score} size="sm" showLabel={false} />
              <div>
                <p className="text-xs text-foreground-secondary">AI Score</p>
                <p className="text-sm font-medium">{asset.ai_evaluation.risk_level} risk</p>
              </div>
            </div>
          )}

          {/* Price & Change */}
          {isTokenized && asset.token && (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-foreground-secondary mb-1">Price per unit</p>
                <p className="font-mono font-medium">{formatSats(asset.token.unit_price_sats)} sats</p>
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm',
                change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
              )}>
                {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPercentage(change24h)}
              </div>
            </div>
          )}

          {/* Pending state */}
          {!isTokenized && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-secondary">Est. Value</span>
              <span className="font-mono">{formatSats(asset.estimated_value_sats)} sats</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function Assets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const tokenizedCount = mockAssets.filter(a => a.status === 'tokenized').length;
  const totalValue = mockAssets.reduce((sum, a) => sum + (a.token?.market_cap_sats || a.estimated_value_sats), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assets</h1>
            <p className="text-foreground-secondary">
              Browse {tokenizedCount} tokenized assets worth {formatSats(totalValue)} sats
            </p>
          </div>
          <Link to="/assets/submit">
            <Button leftIcon={<Plus size={18} />}>
              Submit Asset
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" size={18} />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-background-elevated border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Grid */}
        {filteredAssets.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="mx-auto h-12 w-12 text-foreground-secondary/50" />
            <h3 className="mt-4 text-lg font-medium">No assets found</h3>
            <p className="text-foreground-secondary">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
