import { cn } from '@lib/utils';
import { Check, Clock, Shield, AlertCircle } from 'lucide-react';
import type { Escrow } from '@types';

interface EscrowStatusTrackerProps {
  status: Escrow['status'];
  className?: string;
  compact?: boolean;
}

const steps = [
  { key: 'created', label: 'Created', icon: Shield },
  { key: 'funded', label: 'Funded', icon: Clock },
  { key: 'released', label: 'Released', icon: Check },
];

export function EscrowStatusTracker({
  status,
  className,
  compact = false,
}: EscrowStatusTrackerProps) {
  const getCurrentStep = () => {
    switch (status) {
      case 'created':
        return 0;
      case 'funded':
        return 1;
      case 'released':
        return 2;
      case 'disputed':
        return -1; // Special state
      case 'refunded':
        return 2; // End state
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep();
  const isDisputed = status === 'disputed';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {isDisputed ? (
          <>
            <AlertCircle size={14} className="text-accent-red" />
            <span className="text-sm text-accent-red">Disputed</span>
          </>
        ) : (
          <>
            <div className="flex items-center">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        isActive ? 'bg-accent-bitcoin text-background' : 'bg-background-elevated text-foreground-secondary'
                      )}
                    >
                      <Icon size={10} />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-3 h-0.5',
                          index < currentStep ? 'bg-accent-bitcoin' : 'bg-background-elevated'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-foreground-secondary capitalize">{status}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Status header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">Escrow Status</span>
        <span
          className={cn(
            'text-sm font-medium capitalize',
            isDisputed ? 'text-accent-red' : 'text-accent-bitcoin'
          )}
        >
          {status}
        </span>
      </div>

      {/* Progress steps */}
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-background-elevated rounded-full" />
        
        {/* Active progress */}
        {!isDisputed && (
          <div
            className="absolute top-5 left-0 h-1 bg-accent-bitcoin rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        )}

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10',
                    isActive
                      ? 'bg-accent-bitcoin border-accent-bitcoin text-background'
                      : 'bg-background-surface border-border text-foreground-secondary',
                    isCurrent && !isDisputed && 'ring-4 ring-accent-bitcoin/20'
                  )}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-foreground-secondary'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disputed warning */}
      {isDisputed && (
        <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-accent-red" />
            <span className="text-sm text-accent-red">
              This escrow is under dispute. An admin will review and resolve shortly.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
