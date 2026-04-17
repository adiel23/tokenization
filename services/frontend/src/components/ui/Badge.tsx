import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-muted text-foreground',
        outline: 'text-foreground border border-border',
        success: 'border-transparent bg-accent-green/10 text-accent-green border border-accent-green/20',
        warning: 'border-transparent bg-accent-bitcoin/10 text-accent-bitcoin border border-accent-bitcoin/20',
        danger: 'border-transparent bg-accent-red/10 text-accent-red border border-accent-red/20',
        info: 'border-transparent bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
        subtle: 'border-transparent bg-background-elevated text-foreground-secondary',
        ghost: 'border-transparent bg-transparent text-foreground-secondary',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-2xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: 'green' | 'red' | 'orange' | 'blue' | 'gray';
}

function Badge({ 
  className, 
  variant, 
  size, 
  dot,
  dotColor = 'gray',
  children,
  ...props 
}: BadgeProps) {
  const dotColorClasses = {
    green: 'bg-accent-green',
    red: 'bg-accent-red',
    orange: 'bg-accent-bitcoin',
    blue: 'bg-accent-blue',
    gray: 'bg-foreground-secondary',
  };

  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColorClasses[dotColor])} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
