import { create } from 'zustand';
import type { Notification } from '@types';

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Helpers
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: Date.now(),
      duration: notification.duration || (notification.autoDismiss !== false ? 5000 : undefined),
    };
    
    set({ notifications: [newNotification, ...get().notifications] });
    
    // Auto dismiss
    if (newNotification.duration) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set({
      notifications: get().notifications.filter(n => n.id !== id),
    });
  },

  clearNotifications: () => set({ notifications: [] }),

  success: (title, message, duration = 5000) => {
    get().addNotification({
      type: 'success',
      title,
      message: message || '',
      autoDismiss: true,
      duration,
    });
  },

  error: (title, message, duration = 8000) => {
    get().addNotification({
      type: 'error',
      title,
      message: message || '',
      autoDismiss: true,
      duration,
    });
  },

  warning: (title, message, duration = 6000) => {
    get().addNotification({
      type: 'warning',
      title,
      message: message || '',
      autoDismiss: true,
      duration,
    });
  },

  info: (title, message, duration = 4000) => {
    get().addNotification({
      type: 'info',
      title,
      message: message || '',
      autoDismiss: true,
      duration,
    });
  },
}));
