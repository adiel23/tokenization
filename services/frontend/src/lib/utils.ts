import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSats(sats: number, showBtc: boolean = false): string {
  if (showBtc) {
    const btc = sats / 100_000_000;
    return btc.toFixed(8).replace(/\.?0+$/, '');
  }
  return sats.toLocaleString('en-US');
}

export function formatFiat(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatPercentage(value: number, includeSign: boolean = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function truncateTxid(txid: string, chars: number = 6): string {
  if (txid.length <= chars * 2 + 3) return txid;
  return `${txid.slice(0, chars)}...${txid.slice(-chars)}`;
}

export function formatDate(date: string | Date, includeTime: boolean = true): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (!includeTime) return dateStr;
  return `${dateStr} ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(date, false);
}

export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Color utilities for the mempool aesthetic
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-accent-green';
  if (value < 0) return 'text-accent-red';
  return 'text-foreground-secondary';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-accent-green';
  if (score >= 60) return 'text-accent-bitcoin';
  if (score >= 40) return 'text-foreground';
  return 'text-accent-red';
}
