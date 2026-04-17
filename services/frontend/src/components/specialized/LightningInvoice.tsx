import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Zap } from 'lucide-react';
import { cn, truncateAddress, copyToClipboard, formatSats } from '@lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';

interface LightningInvoiceProps {
  invoice: string;
  amountSats?: number;
  description?: string;
  expiry?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LightningInvoice({
  invoice,
  amountSats,
  description,
  expiry,
  className,
  size = 'md',
}: LightningInvoiceProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiry);

  const handleCopy = async () => {
    await copyToClipboard(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrSizes = {
    sm: 180,
    md: 240,
    lg: 320,
  };

  // Countdown timer
  useState(() => {
    if (!expiry) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) return prev - 1;
        clearInterval(interval);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Zap size={20} className="text-accent-bitcoin" />
          Lightning Invoice
        </CardTitle>
        {description && (
          <p className="text-sm text-foreground-secondary">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col items-center gap-6">
          {/* QR Code */}
          <div className="relative">
            <div className={cn(
              'p-4 bg-white rounded-xl shadow-lg',
              'border-4 border-accent-bitcoin/20'
            )}>
              <QRCodeSVG 
                value={invoice.toUpperCase()} 
                size={qrSizes[size]}
                level="M"
                includeMargin={false}
              />
            </div>
            {/* Bitcoin logo overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-accent-bitcoin rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">₿</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          {amountSats !== undefined && (
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-foreground">
                {formatSats(amountSats)}
              </span>
              <span className="text-foreground-secondary ml-1">sats</span>
            </div>
          )}

          {/* Expiry */}
          {timeLeft !== undefined && timeLeft > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground-secondary">Expires in:</span>
              <span className={cn(
                'font-mono font-medium',
                timeLeft < 60 ? 'text-accent-red' : 'text-foreground'
              )}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-all',
              'bg-background-elevated hover:bg-accent-bitcoin/10 border border-border',
              copied && 'bg-accent-green/10 border-accent-green/20'
            )}
          >
            {copied ? (
              <>
                <Check size={16} className="text-accent-green" />
                <span className="text-accent-green">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Invoice</span>
              </>
            )}
          </button>

          {/* Invoice string (truncated) */}
          <code className="text-xs text-foreground-secondary font-mono break-all text-center max-w-xs">
            {truncateAddress(invoice, 20)}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
