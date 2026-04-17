import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Wallet, TokenBalance, Transaction } from '@types';

interface WalletState {
  wallet: Wallet | null;
  tokenBalances: TokenBalance[];
  transactions: Transaction[];
  pendingDeposits: Transaction[];
  pendingWithdrawals: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Fiat on-ramp
  onrampSessionUrl: string | null;
  
  // Actions
  setWallet: (wallet: Wallet | null) => void;
  setTokenBalances: (balances: TokenBalance[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setOnrampSession: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getTotalBalanceSats: () => number;
  getAvailableBalanceSats: () => number;
  getPendingBalanceSats: () => number;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      tokenBalances: [],
      transactions: [],
      pendingDeposits: [],
      pendingWithdrawals: [],
      isLoading: false,
      error: null,
      onrampSessionUrl: null,

      setWallet: (wallet) => set({ wallet }),
      
      setTokenBalances: (tokenBalances) => set({ tokenBalances }),
      
      setTransactions: (transactions) => {
        const pendingDeposits = transactions.filter(
          t => t.type === 'deposit' && t.status === 'pending'
        );
        const pendingWithdrawals = transactions.filter(
          t => (t.type === 'withdrawal' || t.type === 'send') && t.status === 'pending'
        );
        set({ 
          transactions, 
          pendingDeposits, 
          pendingWithdrawals 
        });
      },
      
      addTransaction: (transaction) => {
        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });
      },
      
      updateTransaction: (id, updates) => {
        const { transactions } = get();
        const updated = transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        );
        set({ transactions: updated });
      },
      
      setOnrampSession: (url) => set({ onrampSessionUrl: url }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      getTotalBalanceSats: () => {
        const { wallet, tokenBalances } = get();
        const btcBalance = wallet ? 
          wallet.onchain_balance_sats + wallet.lightning_balance_sats : 0;
        const tokenValue = tokenBalances.reduce((sum, t) => sum + t.value_sats, 0);
        return btcBalance + tokenValue;
      },

      getAvailableBalanceSats: () => {
        const { wallet } = get();
        return wallet ? 
          wallet.onchain_balance_sats + wallet.lightning_balance_sats : 0;
      },

      getPendingBalanceSats: () => {
        const { wallet } = get();
        return wallet?.pending_balance_sats || 0;
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallet: state.wallet,
        tokenBalances: state.tokenBalances,
        transactions: state.transactions.slice(0, 50), // Only persist recent 50
      }),
    }
  )
);
