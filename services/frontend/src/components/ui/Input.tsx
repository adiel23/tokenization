import * as React from 'react';
import { cn } from '@lib/utils';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  copyable?: boolean;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    rightElement,
    leftElement,
    copyable,
    isPassword,
    id,
    value,
    defaultValue,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const inputId = id || React.useId();
    const inputValue = value !== undefined ? value : defaultValue;

    const handleCopy = async () => {
      if (inputValue) {
        await navigator.clipboard.writeText(String(inputValue));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const inputType = isPassword 
      ? (showPassword ? 'text' : 'password')
      : type;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
              {leftElement}
            </div>
          )}
          <input
            type={inputType}
            id={inputId}
            className={cn(
              'flex w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-foreground-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'transition-all duration-200',
              error && 'border-accent-red focus-visible:ring-accent-red/50',
              leftElement && 'pl-10',
              (rightElement || isPassword || copyable) && 'pr-10',
              className
            )}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            {...props}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {copied ? <Check size={16} className="text-accent-green" /> : <Copy size={16} />}
              </button>
            )}
            {rightElement && !isPassword && !copyable && rightElement}
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-accent-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-foreground-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
