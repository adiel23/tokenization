import { cn, formatSats, formatFiat } from '@lib/utils';

interface SatoshiAmountProps {
  amount: number;
  showFiat?: boolean;
  fiatRate?: number;
  currency?: string;
  showBtc?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  mono?: boolean;
  highlight?: boolean;
}

export function SatoshiAmount({
  amount,
  showFiat = true,
  fiatRate = 60000, // USD per BTC default
  currency = 'USD',
  showBtc = false,
  size = 'md',
  className,
  mono = true,
  highlight = false,
}: SatoshiAmountProps) {
  const btcPrice = fiatRate;
  const fiatValue = (amount / 100_000_000) * btcPrice;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl font-bold',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn(
          sizeClasses[size],
          mono && 'font-mono tabular-nums',
          highlight && 'text-gradient-bitcoin',
          'text-foreground'
        )}
      >
        {showBtc ? (
          <>
            {formatSats(amount, true)} <span className="text-foreground-secondary text-sm">BTC</span>
          </>
        ) : (
          <>
            {formatSats(amount)} <span className="text-foreground-secondary text-sm">sats</span>
          </>
        )}
      </span>
      {showFiat && (
        <span className="text-foreground-secondary text-sm">
          ≈ {formatFiat(fiatValue, currency)}
        </span>
      )}
    </div>
  );
}
