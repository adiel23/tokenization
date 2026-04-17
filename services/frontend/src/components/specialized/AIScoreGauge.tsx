import { cn, getScoreColor } from '@lib/utils';

interface AIScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function AIScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: AIScoreGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));
  
  // Calculate stroke dash array
  const radius = size === 'sm' ? 28 : size === 'md' ? 40 : 56;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Get color based on score
  const getStrokeColor = () => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f7931a'; // bitcoin orange
    if (score >= 40) return '#e5e5e5'; // neutral
    return '#ef4444'; // red
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const labelSizes = {
    sm: 'text-2xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-mono font-bold', textSizes[size], getScoreColor(score))}>
            {clampedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('mt-2 font-medium text-foreground-secondary', labelSizes[size])}>
          AI Score
        </span>
      )}
    </div>
  );
}
