import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-accent-bitcoin/90',
        secondary: 'bg-background-surface text-foreground border border-border hover:bg-background-elevated',
        outline: 'border border-border bg-transparent hover:bg-background-surface hover:text-foreground',
        ghost: 'hover:bg-background-surface hover:text-foreground',
        link: 'text-accent-bitcoin underline-offset-4 hover:underline',
        danger: 'bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20',
        success: 'bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20',
        glass: 'glass-card text-foreground hover:bg-background-elevated/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    isLoading, 
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
