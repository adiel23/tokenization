// User types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'seller' | 'admin' | 'auditor';
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  nostr_pubkey?: string;
  referral_code?: string;
  referred_by?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Wallet types
export interface Wallet {
  id: string;
  user_id: string;
  onchain_balance_sats: number;
  lightning_balance_sats: number;
  pending_balance_sats: number;
  custody_backend: 'software' | 'hsm';
  created_at: string;
}

export interface TokenBalance {
  token_id: string;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  value_sats: number;
  change_24h: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive' | 'trade' | 'escrow' | 'yield';
  amount_sats: number;
  fee_sats: number;
  status: 'pending' | 'confirmed' | 'failed';
  txid?: string;
  address?: string;
  description?: string;
  created_at: string;
  confirmed_at?: string;
}

// Asset types
export interface Asset {
  id: string;
  name: string;
  description: string;
  category: 'real_estate' | 'commodities' | 'art' | 'infrastructure' | 'agriculture' | 'energy' | 'other';
  status: 'submitted' | 'evaluating' | 'approved' | 'rejected' | 'tokenized';
  submitted_by: string;
  submitted_at: string;
  estimated_value_sats: number;
  supporting_documents: Document[];
  ai_evaluation?: AIEvaluation;
  token?: Token;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface AIEvaluation {
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  projected_roi_percent: number;
  summary: string;
  evaluated_at: string;
}

export interface Token {
  id: string;
  asset_id: string;
  total_supply: number;
  unit_price_sats: number;
  market_cap_sats: number;
  minted_at: string;
  asset_group_key: string;
}

// Marketplace types
export interface Order {
  id: string;
  token_id: string;
  user_id: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop_limit';
  quantity: number;
  price_sats: number;
  stop_price_sats?: number;
  status: 'open' | 'partially_filled' | 'filled' | 'cancelled';
  filled_quantity: number;
  created_at: string;
  expires_at?: string;
}

export interface Trade {
  id: string;
  token_id: string;
  buyer_order_id: string;
  seller_order_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  price_sats: number;
  total_sats: number;
  escrow_id: string;
  status: 'pending' | 'escrow_funded' | 'completed' | 'disputed';
  created_at: string;
  completed_at?: string;
}

export interface Escrow {
  id: string;
  trade_id: string;
  multisig_address: string;
  buyer_pubkey: string;
  seller_pubkey: string;
  platform_pubkey: string;
  amount_sats: number;
  platform_fee_sats: number;
  status: 'created' | 'funded' | 'released' | 'disputed' | 'refunded';
  funded_at?: string;
  released_at?: string;
  funding_txid?: string;
  release_txid?: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  last_price: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  order_count: number;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Education types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  modules: Module[];
  created_at: string;
  enrolled_count: number;
}

export interface Module {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  completed_modules: string[];
  enrolled_at: string;
  completed_at?: string;
}

// Treasury types
export interface TreasuryEntry {
  id: string;
  type: 'fee_collection' | 'disbursement' | 'donation';
  amount_sats: number;
  description: string;
  related_trade_id?: string;
  created_at: string;
  disbursement_reason?: string;
  recipient_address?: string;
}

export interface TreasurySummary {
  total_balance_sats: number;
  total_fees_collected_sats: number;
  total_disbursed_sats: number;
  education_fund_sats: number;
  last_updated: string;
}

// Admin types
export interface Dispute {
  id: string;
  trade_id: string;
  escrow_id: string;
  opened_by: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'resolved_split';
  evidence: string[];
  opened_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolved_by?: string;
}

export interface UserRoleUpdate {
  user_id: string;
  new_role: 'user' | 'seller' | 'admin' | 'auditor';
  reason: string;
}

// Referral types
export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_sats: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface YieldAccrual {
  id: string;
  token_id: string;
  holder_id: string;
  amount_sats: number;
  period_start: string;
  period_end: string;
  paid_at: string;
}

// Onboarding types
export interface OnboardingSummary {
  custody_configured: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  kyc_provider_required: boolean;
  fiat_onramp_ready: boolean;
  available_providers: FiatProvider[];
}

export interface FiatProvider {
  id: string;
  name: string;
  logo_url: string;
  supported_fiat_currencies: string[];
  supported_countries: string[];
  requires_kyc: boolean;
  disabled_reason?: string;
}

// API Response types
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'price_update' | 'order_book_update' | 'trade_executed' | 'order_filled' | 'escrow_update';
  payload: unknown;
  timestamp: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  created_at: number;
}
