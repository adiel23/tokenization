import { create } from 'zustand';
import type { Order, Trade, OrderBook, PricePoint } from '@types';

interface TradeFormState {
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop_limit';
  quantity: string;
  price: string;
  stopPrice: string;
  total: number;
}

interface TradeState {
  // Selected token
  selectedTokenId: string | null;
  
  // Order form
  orderForm: TradeFormState;
  
  // Market data
  orderBook: OrderBook | null;
  priceHistory: PricePoint[];
  currentPrice: number | null;
  priceChange24h: number;
  volume24h: number;
  
  // User orders/trades
  openOrders: Order[];
  recentTrades: Trade[];
  userTrades: Trade[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedToken: (tokenId: string | null) => void;
  updateOrderForm: (updates: Partial<TradeFormState>) => void;
  resetOrderForm: () => void;
  setOrderBook: (orderBook: OrderBook | null) => void;
  setPriceHistory: (history: PricePoint[]) => void;
  setCurrentPrice: (price: number | null) => void;
  setMarketStats: (change24h: number, volume24h: number) => void;
  setOpenOrders: (orders: Order[]) => void;
  addOpenOrder: (order: Order) => void;
  removeOpenOrder: (orderId: string) => void;
  updateOpenOrder: (orderId: string, updates: Partial<Order>) => void;
  setRecentTrades: (trades: Trade[]) => void;
  addRecentTrade: (trade: Trade) => void;
  setUserTrades: (trades: Trade[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getBestBid: () => number;
  getBestAsk: () => number;
  getSpread: () => number;
  getSpreadPercent: () => number;
}

const defaultOrderForm: TradeFormState = {
  side: 'buy',
  type: 'limit',
  quantity: '',
  price: '',
  stopPrice: '',
  total: 0,
};

export const useTradeStore = create<TradeState>((set, get) => ({
  selectedTokenId: null,
  orderForm: { ...defaultOrderForm },
  orderBook: null,
  priceHistory: [],
  currentPrice: null,
  priceChange24h: 0,
  volume24h: 0,
  openOrders: [],
  recentTrades: [],
  userTrades: [],
  isLoading: false,
  error: null,

  setSelectedToken: (tokenId) => set({ 
    selectedTokenId: tokenId,
    orderBook: null,
    priceHistory: [],
    currentPrice: null,
  }),
  
  updateOrderForm: (updates) => {
    const { orderForm, orderBook } = get();
    const newForm = { ...orderForm, ...updates };
    
    // Auto-calculate total
    const qty = parseFloat(newForm.quantity) || 0;
    let price = parseFloat(newForm.price) || 0;
    
    // For market orders, use best available price
    if (newForm.type === 'market' && orderBook) {
      price = newForm.side === 'buy' 
        ? orderBook.asks[0]?.price || 0
        : orderBook.bids[0]?.price || 0;
    }
    
    newForm.total = qty * price;
    
    set({ orderForm: newForm });
  },
  
  resetOrderForm: () => set({ orderForm: { ...defaultOrderForm } }),
  
  setOrderBook: (orderBook) => set({ orderBook }),
  
  setPriceHistory: (priceHistory) => set({ priceHistory }),
  
  setCurrentPrice: (currentPrice) => set({ currentPrice }),
  
  setMarketStats: (priceChange24h, volume24h) => set({ priceChange24h, volume24h }),
  
  setOpenOrders: (openOrders) => set({ openOrders }),
  
  addOpenOrder: (order) => {
    const { openOrders } = get();
    set({ openOrders: [order, ...openOrders] });
  },
  
  removeOpenOrder: (orderId) => {
    const { openOrders } = get();
    set({ openOrders: openOrders.filter(o => o.id !== orderId) });
  },
  
  updateOpenOrder: (orderId, updates) => {
    const { openOrders } = get();
    set({
      openOrders: openOrders.map(o =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
    });
  },
  
  setRecentTrades: (recentTrades) => set({ recentTrades }),
  
  addRecentTrade: (trade) => {
    const { recentTrades } = get();
    set({ recentTrades: [trade, ...recentTrades.slice(0, 99)] });
  },
  
  setUserTrades: (userTrades) => set({ userTrades }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  getBestBid: () => {
    const { orderBook } = get();
    return orderBook?.bids[0]?.price || 0;
  },

  getBestAsk: () => {
    const { orderBook } = get();
    return orderBook?.asks[0]?.price || 0;
  },

  getSpread: () => {
    const state = get();
    return state.getBestAsk() - state.getBestBid();
  },

  getSpreadPercent: () => {
    const state = get();
    const mid = (state.getBestBid() + state.getBestAsk()) / 2;
    if (mid === 0) return 0;
    return (state.getSpread() / mid) * 100;
  },
}));
