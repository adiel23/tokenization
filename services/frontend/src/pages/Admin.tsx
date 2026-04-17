import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Scale,
  Wallet,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Filter
} from 'lucide-react';
import { cn, formatSats, formatDate } from '@lib/utils';
import { Layout, Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from '@components';
import type { User, Dispute, TreasuryEntry } from '@types';

// Mock data
const mockStats = {
  totalUsers: 12847,
  totalTrades: 3456,
  totalVolume: 245000000,
  treasuryBalance: 15000000,
  activeDisputes: 3,
  pendingAssets: 12,
};

const mockUsers: User[] = [
  { id: '1', email: 'user1@example.com', role: 'user', kyc_status: 'verified', created_at: '2024-01-15T10:00:00Z' },
  { id: '2', email: 'seller1@example.com', role: 'seller', kyc_status: 'verified', created_at: '2024-02-01T14:30:00Z' },
  { id: '3', email: 'user2@example.com', role: 'user', kyc_status: 'pending', created_at: '2024-03-10T09:15:00Z' },
];

const mockDisputes: Dispute[] = [
  { 
    id: '1', 
    trade_id: '123', 
    escrow_id: '456', 
    opened_by: 'user1', 
    reason: 'Seller did not release escrow after payment confirmation',
    status: 'open',
    evidence: ['receipt.pdf'],
    opened_at: '2024-03-15T10:00:00Z',
  },
];

const mockTreasury: TreasuryEntry[] = [
  { id: '1', type: 'fee_collection', amount_sats: 50000, description: 'Trade fee #1234', related_trade_id: '1234', created_at: '2024-03-15T10:00:00Z' },
  { id: '2', type: 'fee_collection', amount_sats: 25000, description: 'Trade fee #1235', related_trade_id: '1235', created_at: '2024-03-14T14:00:00Z' },
  { id: '3', type: 'disbursement', amount_sats: 1000000, description: 'Education fund allocation', disbursement_reason: 'Course development', created_at: '2024-03-10T09:00:00Z' },
];

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'disputes', label: 'Disputes', icon: Scale },
  { id: 'treasury', label: 'Treasury', icon: Wallet },
];

function StatsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Total Users</p>
          <p className="text-2xl font-mono font-bold">{mockStats.totalUsers.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Total Trades</p>
          <p className="text-2xl font-mono font-bold">{mockStats.totalTrades.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Total Volume</p>
          <p className="text-2xl font-mono font-bold">{formatSats(mockStats.totalVolume)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Treasury Balance</p>
          <p className="text-2xl font-mono font-bold text-accent-bitcoin">{formatSats(mockStats.treasuryBalance)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Active Disputes</p>
          <p className="text-2xl font-mono font-bold text-accent-red">{mockStats.activeDisputes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-foreground-secondary mb-1">Pending Assets</p>
          <p className="text-2xl font-mono font-bold text-accent-bitcoin">{mockStats.pendingAssets}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background-elevated border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">User</th>
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Role</th>
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">KYC Status</th>
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Joined</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-background-elevated/50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-foreground-secondary font-mono">ID: {user.id}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant={user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant={user.kyc_status === 'verified' ? 'success' : user.kyc_status === 'pending' ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {user.kyc_status}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-foreground-secondary">
                    {formatDate(user.created_at, false)}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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

function DisputesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Disputes</CardTitle>
      </CardHeader>
      <CardContent>
        {mockDisputes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-accent-green mb-4" />
            <p className="text-foreground-secondary">No active disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockDisputes.map((dispute) => (
              <div key={dispute.id} className="p-4 rounded-lg bg-background-elevated border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="danger">Open</Badge>
                      <span className="text-sm text-foreground-secondary">Dispute #{dispute.id}</span>
                    </div>
                    <p className="text-sm font-medium">{dispute.reason}</p>
                  </div>
                  <span className="text-xs text-foreground-secondary">
                    {formatDate(dispute.opened_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary mb-3">
                  <span>Trade: {dispute.trade_id}</span>
                  <span>•</span>
                  <span>Escrow: {dispute.escrow_id}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success">
                    <CheckCircle size={14} className="mr-1" />
                    Resolve Buyer
                  </Button>
                  <Button size="sm" variant="danger">
                    <X size={14} className="mr-1" />
                    Resolve Seller
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TreasuryTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Treasury Ledger</CardTitle>
          <CardDescription>Fee collection and disbursements</CardDescription>
        </div>
        <Button size="sm" variant="outline">
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTreasury.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-background-elevated"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  entry.type === 'fee_collection' ? 'bg-accent-green/10' : 'bg-accent-bitcoin/10'
                )}>
                  {entry.type === 'fee_collection' ? (
                    <TrendingUp size={14} className="text-accent-green" />
                  ) : (
                    <Wallet size={14} className="text-accent-bitcoin" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-foreground-secondary">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-mono font-medium',
                  entry.type === 'fee_collection' ? 'text-accent-green' : 'text-accent-bitcoin'
                )}>
                  {entry.type === 'fee_collection' ? '+' : '-'}{formatSats(entry.amount_sats)}
                </p>
                <Badge variant={entry.type === 'fee_collection' ? 'success' : 'warning'} size="sm">
                  {entry.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Treasury Actions */}
        <div className="mt-6 p-4 rounded-lg bg-accent-bitcoin/10 border border-accent-bitcoin/20">
          <h4 className="font-medium mb-2">Disbursement Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">
              <Wallet size={14} className="mr-1" />
              Allocate to Education
            </Button>
            <Button size="sm" variant="outline">
              <Shield size={14} className="mr-1" />
              Emergency Reserve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout adminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-red/10 flex items-center justify-center">
            <Shield className="text-accent-red" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-foreground-secondary">Platform management and oversight</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-accent-bitcoin text-accent-bitcoin'
                    : 'border-transparent text-foreground-secondary hover:text-foreground'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsOverview />
            <div className="grid lg:grid-cols-2 gap-6">
              <DisputesTab />
              <TreasuryTab />
            </div>
          </div>
        )}

        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'disputes' && <DisputesTab />}
        {activeTab === 'treasury' && <TreasuryTab />}
      </div>
    </Layout>
  );
}
