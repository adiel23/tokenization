import { useMemo } from 'react';
import { cn, formatNumber } from '@lib/utils';
import type { OrderBook } from '@types';

interface OrderBookDepthProps {
  orderBook: OrderBook;
  className?: string;
  maxRows?: number;
}

export function OrderBookDepth({
  orderBook,
  className,
  maxRows = 8,
}: OrderBookDepthProps) {
  const { bids, asks, spread } = orderBook;

  // Calculate cumulative depth
  const processedAsks = useMemo(() => {
    let cumulative = 0;
    return asks.slice(0, maxRows).reverse().map((ask) => {
      cumulative += ask.quantity;
      return { ...ask, cumulative };
    }).reverse();
  }, [asks, maxRows]);

  const processedBids = useMemo(() => {
    let cumulative = 0;
    return bids.slice(0, maxRows).map((bid) => {
      cumulative += bid.quantity;
      return { ...bid, cumulative };
    });
  }, [bids, maxRows]);

  const maxCumulative = Math.max(
    processedAsks[0]?.cumulative || 0,
    processedBids[processedBids.length - 1]?.cumulative || 0
  ) || 1;

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-foreground-secondary mb-2 px-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - Red */}
      <div className="space-y-0.5">
        {processedAsks.map((ask, i) => {
          const depthPercent = (ask.cumulative / maxCumulative) * 100;
          return (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-3 gap-2 text-sm relative py-0.5 px-2 rounded"
              style={{
                background: `linear-gradient(to left, rgba(239, 68, 68, 0.15) ${depthPercent}%, transparent ${depthPercent}%)`,
              }}
            >
              <span className="font-mono text-accent-red">{formatNumber(ask.price, 0)}</span>
              <span className="font-mono text-right text-foreground">{formatNumber(ask.quantity, 2)}</span>
              <span className="font-mono text-right text-foreground-secondary">{formatNumber(ask.cumulative, 2)}</span>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center gap-3 py-2 my-1 border-y border-border">
        <span className="text-xs text-foreground-secondary">Spread</span>
        <span className="font-mono text-sm text-accent-bitcoin">{formatNumber(spread, 0)}</span>
        <span className="text-xs text-foreground-secondary">
          ({((spread / (asks[0]?.price || 1)) * 100).toFixed(2)}%)
        </span>
      </div>

      {/* Bids (Buys) - Green */}
      <div className="space-y-0.5">
        {processedBids.map((bid, i) => {
          const depthPercent = (bid.cumulative / maxCumulative) * 100;
          return (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-3 gap-2 text-sm relative py-0.5 px-2 rounded"
              style={{
                background: `linear-gradient(to left, rgba(34, 197, 94, 0.15) ${depthPercent}%, transparent ${depthPercent}%)`,
              }}
            >
              <span className="font-mono text-accent-green">{formatNumber(bid.price, 0)}</span>
              <span className="font-mono text-right text-foreground">{formatNumber(bid.quantity, 2)}</span>
              <span className="font-mono text-right text-foreground-secondary">{formatNumber(bid.cumulative, 2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
