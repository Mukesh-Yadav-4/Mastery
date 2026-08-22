import { cn } from '../../lib/utils';

interface LevelProgressProps {
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showDetails?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function LevelProgress({
  level,
  totalXP,
  xpToNextLevel,
  progressPercentage,
  size = 'md',
  color = 'var(--color-accent)',
  label = 'Mastery Level',
  showDetails = true,
  showBadge = true,
  className,
}: LevelProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const badgeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-md',
    md: 'text-xs px-2 py-0.5 rounded-lg',
    lg: 'text-sm px-2.5 py-1 rounded-lg font-bold',
  };

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {/* Header Info */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {showBadge && (
              <span
                className={cn(
                  'font-semibold border border-edge/80 bg-surface/90 text-zinc-100 flex items-center gap-1 shadow-sm',
                  badgeStyles[size],
                )}
              >
                <span className="text-accent text-[10px]">⚡</span>
                <span>Level {level}</span>
              </span>
            )}
            <span className="font-medium text-zinc-400 text-[11px] sm:text-xs">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 tabular-nums">
            <span className="font-semibold text-zinc-200">
              {totalXP.toLocaleString()} XP
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              <strong className="text-zinc-300 font-medium">{xpToNextLevel} XP</strong> to Lvl {level + 1}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar Track */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clampedProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} Progress`}
        className={cn(
          'w-full overflow-hidden rounded-full bg-elevated/70 border border-edge/30 relative',
          heightStyles[size],
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
