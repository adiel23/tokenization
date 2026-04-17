import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn, copyToClipboard } from '@lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onCopy?: () => void;
}

export function CopyButton({
  text,
  className,
  size = 'md',
  showText = false,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md transition-all duration-200',
        'text-foreground-secondary hover:text-foreground hover:bg-background-elevated',
        copied && 'text-accent-green hover:text-accent-green hover:bg-accent-green/10',
        sizeClasses[size],
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={iconSizes[size]} />
      ) : (
        <Copy size={iconSizes[size]} />
      )}
      {showText && (
        <span className="text-sm">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      )}
    </button>
  );
}
