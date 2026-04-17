import * as React from 'react';
import { cn } from '@lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  noPadding?: boolean;
  glow?: 'none' | 'bitcoin' | 'green' | 'red';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, noPadding, glow = 'none', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-background-surface text-foreground',
          glass && 'glass-card',
          !noPadding && 'p-6',
          glow === 'bitcoin' && 'shadow-[0_0_20px_rgba(247,147,26,0.1)]',
          glow === 'green' && 'shadow-[0_0_20px_rgba(34,197,94,0.1)]',
          glow === 'red' && 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-foreground-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-border mt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
