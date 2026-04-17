import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';
import { cn, truncateAddress, copyToClipboard } from '@lib/utils';
import { Card, CardContent } from '@components/ui/Card';

interface BitcoinAddressProps {
  address: string;
  label?: string;
  showQR?: boolean;
  qrSize?: number;
  truncate?: boolean;
  truncateChars?: number;
  className?: string;
  showCopy?: boolean;
  variant?: 'default' | 'large' | 'compact';
}

export function BitcoinAddress({
  address,
  label,
  showQR = true,
  qrSize = 160,
  truncate = true,
  truncateChars = 6,
  className,
  showCopy = true,
  variant = 'default',
}: BitcoinAddressProps) {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = truncate ? truncateAddress(address, truncateChars) : address;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="font-mono text-sm text-foreground">{displayAddress}</span>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
          >
            {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <Card className={cn('p-6', className)}>
        {label && (
          <p className="text-sm text-foreground-secondary mb-4">{label}</p>
        )}
        <div className="flex flex-col items-center gap-4">
          {showQR && (
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={address} size={qrSize} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <code className="font-mono text-lg text-foreground break-all">{address}</code>
            {showCopy && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-md bg-background-elevated hover:bg-accent-bitcoin/10 transition-colors"
              >
                {copied ? <Check size={18} className="text-accent-green" /> : <Copy size={18} />}
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <CardContent className="p-0">
        {label && (
          <p className="text-sm text-foreground-secondary mb-2">{label}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <code className="font-mono text-sm text-foreground break-all flex-1">
            {displayAddress}
          </code>
          <div className="flex items-center gap-1">
            {showCopy && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-background-elevated transition-colors"
                title="Copy address"
              >
                {copied ? <Check size={16} className="text-accent-green" /> : <Copy size={16} />}
              </button>
            )}
            {showQR && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  showQRCode ? 'bg-accent-bitcoin/20 text-accent-bitcoin' : 'hover:bg-background-elevated'
                )}
                title="Toggle QR code"
              >
                <QrCode size={16} />
              </button>
            )}
          </div>
        </div>
        {showQRCode && (
          <div className="mt-4 flex justify-center">
            <div className="p-3 bg-white rounded-lg">
              <QRCodeSVG value={address} size={qrSize} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
