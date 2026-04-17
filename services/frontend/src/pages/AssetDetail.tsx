import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn, formatSats, formatPercentage, formatDate } from '@lib/utils';
import { Layout, AIScoreGauge, Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components';
import type { Asset } from '@types';

// Mock data
const mockAssets: Record<string, Asset> = {
  '1': {
    id: '1',
    name: 'Downtown Office Building',
    description: 'Prime commercial real estate in the financial district. This 45-story Class A office building features modern amenities, LEED Gold certification, and a diverse tenant mix including tech companies and financial institutions.',
    category: 'real_estate',
    status: 'tokenized',
    submitted_by: 'user1',
    submitted_at: new Date().toISOString(),
    estimated_value_sats: 50000000,
    supporting_documents: [
      { id: '1', name: 'Property Appraisal 2024', url: '#', type: 'pdf' },
      { id: '2', name: 'Lease Agreements', url: '#', type: 'pdf' },
      { id: '3', name: 'Financial Statements', url: '#', type: 'pdf' },
    ],
    ai_evaluation: { 
      score: 85, 
      risk_level: 'low', 
      projected_roi_percent: 12.5, 
      summary: 'Strong asset with consistent rental income and low vacancy rates. Prime location in growing financial district with excellent transportation links.', 
      evaluated_at: new Date().toISOString() 
    },
    token: { 
      id: '1', 
      asset_id: '1', 
      total_supply: 1000, 
      unit_price_sats: 50000, 
      market_cap_sats: 50000000, 
      minted_at: new Date().toISOString(), 
      asset_group_key: 'key1' 
    },
  },
};

export function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const asset = id ? mockAssets[id] : null;
  const change24h = 2.3; // Mock data

  if (!asset) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Asset not found</h1>
          <Link to="/assets">
            <Button>Back to Assets</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isTokenized = asset.status === 'tokenized';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back button */}
        <Link to="/assets">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Back to Assets
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center shrink-0">
              <Building2 className="text-accent-bitcoin" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{asset.name}</h1>
                <Badge 
                  variant={isTokenized ? 'success' : asset.status === 'approved' ? 'warning' : 'secondary'}
                >
                  {asset.status}
                </Badge>
              </div>
              <p className="text-foreground-secondary max-w-2xl">{asset.description}</p>
            </div>
          </div>

          {isTokenized && (
            <div className="flex flex-col items-end">
              <p className="font-mono text-3xl font-bold">{formatSats(asset.token!.unit_price_sats)}</p>
              <p className="text-foreground-secondary">sats per unit</p>
              <div className={cn(
                'flex items-center gap-1 mt-2',
                change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
              )}>
                {change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-medium">{formatPercentage(change24h)}</span>
                <span className="text-foreground-secondary">24h</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis */}
            {asset.ai_evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={20} className="text-accent-bitcoin" />
                    AI Evaluation
                  </CardTitle>
                  <CardDescription>Automated asset analysis and risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-6">
                      <AIScoreGauge score={asset.ai_evaluation.score} size="md" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-foreground-secondary">Risk Level</p>
                          <p className={cn(
                            'font-medium capitalize',
                            asset.ai_evaluation.risk_level === 'low' ? 'text-accent-green' :
                            asset.ai_evaluation.risk_level === 'medium' ? 'text-accent-bitcoin' :
                            'text-accent-red'
                          )}>
                            {asset.ai_evaluation.risk_level}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-foreground-secondary">Projected ROI</p>
                          <p className="font-medium text-accent-green">+{asset.ai_evaluation.projected_roi_percent}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background-elevated rounded-lg p-4">
                      <p className="text-sm text-foreground-secondary mb-2">Analysis Summary</p>
                      <p className="text-sm">{asset.ai_evaluation.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Token Info */}
            {isTokenized && asset.token && (
              <Card>
                <CardHeader>
                  <CardTitle>Token Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-background-elevated rounded-lg">
                      <p className="text-xs text-foreground-secondary mb-1">Total Supply</p>
                      <p className="font-mono font-medium">{asset.token.total_supply.toLocaleString()} units</p>
                    </div>
                    <div className="p-4 bg-background-elevated rounded-lg">
                      <p className="text-xs text-foreground-secondary mb-1">Market Cap</p>
                      <p className="font-mono font-medium">{formatSats(asset.token.market_cap_sats)} sats</p>
                    </div>
                    <div className="p-4 bg-background-elevated rounded-lg">
                      <p className="text-xs text-foreground-secondary mb-1">Minted</p>
                      <p className="font-mono font-medium">{formatDate(asset.token.minted_at, false)}</p>
                    </div>
                    <div className="p-4 bg-background-elevated rounded-lg">
                      <p className="text-xs text-foreground-secondary mb-1">Asset Group</p>
                      <p className="font-mono text-xs truncate">{asset.token.asset_group_key}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {asset.supporting_documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {asset.supporting_documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-elevated/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-foreground-secondary" />
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant="secondary" size="sm">.{doc.type}</Badge>
                        </div>
                        <ArrowRight size={16} className="text-foreground-secondary group-hover:text-foreground" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card glow="bitcoin">
              <CardContent className="p-6">
                {isTokenized ? (
                  <>
                    <p className="text-foreground-secondary mb-4">Trade this asset on the marketplace</p>
                    <Link to={`/marketplace/${asset.token!.id}`}>
                      <Button fullWidth size="lg" rightIcon={<ArrowRight size={18} />}>
                        Trade Now
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-foreground-secondary mb-4">
                      This asset is currently being {asset.status === 'evaluating' ? 'evaluated by AI' : 'processed'}
                    </p>
                    <div className="flex items-center gap-2 text-accent-bitcoin">
                      <Clock size={18} />
                      <span>Expected: {asset.status === 'evaluating' ? '2-3 days' : '1 week'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Asset Info */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Category</span>
                  <span className="capitalize">{asset.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Estimated Value</span>
                  <span className="font-mono">{formatSats(asset.estimated_value_sats)} sats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Submitted</span>
                  <span>{formatDate(asset.submitted_at, false)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
