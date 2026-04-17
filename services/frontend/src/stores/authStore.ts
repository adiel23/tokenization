import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthSession } from '@types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorPending: boolean;
  twoFactorToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setTwoFactorPending: (pending: boolean, token?: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, session: AuthSession) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  hasRole: (role: User['role']) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      twoFactorPending: false,
      twoFactorToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setSession: (session) => set({ session }),
      
      setTwoFactorPending: (pending, token) => 
        set({ twoFactorPending: pending, twoFactorToken: token || null }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      login: (user, session) => set({
        user,
        session,
        isAuthenticated: true,
        twoFactorPending: false,
        twoFactorToken: null,
      }),
      
      logout: () => set({
        user: null,
        session: null,
        isAuthenticated: false,
        twoFactorPending: false,
        twoFactorToken: null,
      }),
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
      
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
      
      isSeller: () => {
        const { user } = get();
        return user?.role === 'seller' || user?.role === 'admin';
      },
      
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
