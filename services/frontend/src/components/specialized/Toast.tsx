import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@lib/utils';
import { useNotificationStore } from '@stores';

interface ToastProps {
  className?: string;
}

export function ToastContainer({ className }: ToastProps) {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm',
        className
      )}
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  };
  onClose: () => void;
}

function ToastItem({ notification, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss handled by store, but we animate exit
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
    error: 'bg-accent-red/10 border-accent-red/20 text-accent-red',
    warning: 'bg-accent-bitcoin/10 border-accent-bitcoin/20 text-accent-bitcoin',
    info: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
  };

  const Icon = icons[notification.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        colors[notification.type],
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        {notification.message && (
          <p className="text-sm opacity-90 mt-0.5">{notification.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
