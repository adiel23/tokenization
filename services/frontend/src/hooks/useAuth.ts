import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore, useWalletStore } from '@stores';
import type { User, AuthSession } from '@types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  referralCode?: string;
}

interface AuthResponse {
  user: User;
  session: AuthSession;
}

// Mock API calls - replace with actual API integration
const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    user: {
      id: '1',
      email: credentials.email,
      role: 'user',
      kyc_status: 'none',
      created_at: new Date().toISOString(),
    },
    session: {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_at: Date.now() + 15 * 60 * 1000,
    },
  };
};

const mockRegister = async (data: RegisterData): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    user: {
      id: '2',
      email: data.email,
      role: 'user',
      kyc_status: 'none',
      created_at: new Date().toISOString(),
      referred_by: data.referralCode,
    },
    session: {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_at: Date.now() + 15 * 60 * 1000,
    },
  };
};

export function useAuth() {
  const navigate = useNavigate();
  const { login: storeLogin, logout: storeLogout, setLoading, setTwoFactorPending } = useAuthStore();
  const { success, error } = useNotificationStore();
  const { setWallet } = useWalletStore();

  const login = useCallback(async (credentials: LoginCredentials, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      
      // Check if 2FA is required (mock)
      const requires2FA = false; // This would come from the API
      
      if (requires2FA) {
        setTwoFactorPending(true, credentials.email);
        navigate('/auth/2fa');
        return { success: false, requires2FA: true };
      }

      const response = await mockLogin(credentials);
      
      storeLogin(response.user, response.session);
      success('Welcome back!', `Logged in as ${response.user.email}`);
      
      navigate(redirectTo);
      return { success: true, requires2FA: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      error('Login failed', message);
      return { success: false, requires2FA: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, setTwoFactorPending, success, error]);

  const verify2FA = useCallback(async (code: string, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      
      // Mock 2FA verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, verify code with API
      const isValid = code === '123456'; // Mock valid code
      
      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      const { twoFactorToken } = useAuthStore.getState();
      const response = await mockLogin({ email: twoFactorToken || '', password: '' });
      
      storeLogin(response.user, response.session);
      success('Welcome back!', '2FA verification successful');
      
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '2FA verification failed';
      error('Verification failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error]);

  const register = useCallback(async (data: RegisterData, redirectTo = '/onboarding') => {
    try {
      setLoading(true);
      
      const response = await mockRegister(data);
      
      storeLogin(response.user, response.session);
      success('Account created!', 'Welcome to RWA Platform');
      
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      error('Registration failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error]);

  const logout = useCallback(() => {
    storeLogout();
    setWallet(null);
    success('Logged out', 'You have been logged out successfully');
    navigate('/');
  }, [storeLogout, setWallet, success, navigate]);

  return {
    login,
    register,
    logout,
    verify2FA,
  };
}
