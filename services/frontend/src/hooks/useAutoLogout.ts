import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '@stores';

interface UseAutoLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useAutoLogout({
  timeoutMinutes = 15,
  warningMinutes = 2,
  onWarning,
  onLogout,
}: UseAutoLogoutOptions = {}) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { warning } = useNotificationStore();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Only set timers if authenticated
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();

    // Set warning timer
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      warning(
        'Session expiring soon',
        `You will be logged out in ${warningMinutes} minutes due to inactivity`
      );
      onWarning?.();
    }, warningMs);

    // Set logout timer
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
      navigate('/auth/login');
      onLogout?.();
    }, timeoutMs);
  }, [isAuthenticated, timeoutMinutes, warningMinutes, logout, navigate, onWarning, onLogout, warning]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, resetTimer]);

  return {
    resetTimer,
    lastActivity: () => lastActivityRef.current,
  };
}

// Hook to check if session is about to expire
export function useSessionExpiry() {
  const { session } = useAuthStore();
  
  const isExpiringSoon = () => {
    if (!session) return false;
    const timeUntilExpiry = session.expires_at - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
  };

  const timeUntilExpiry = () => {
    if (!session) return 0;
    return Math.max(0, session.expires_at - Date.now());
  };

  return {
    isExpiringSoon,
    timeUntilExpiry,
  };
}
