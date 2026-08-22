import type { LevelInfo } from '../../types';
import { cn } from '../../lib/utils';
import { Zap } from 'lucide-react';

interface MasteryLevelCardProps {
  levelInfo: LevelInfo;
  totalXP: number;
  className?: string;
}

export function MasteryLevelCard({
  levelInfo,
  totalXP,
  className,
}: MasteryLevelCardProps) {
  const {
    level,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    xpToNextLevel,
    progressPercentage,
  } = levelInfo;

  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface/95 to-elevated/80 border border-edge/70 p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-all duration-300',
        className,
      )}
    >
      {/* Subtle radial ambient highlight behind level */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl -z-10"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-3.5">
        {/* Top Header: Identity & XP Stats */}
        <div className="flex items-center justify-between gap-4">
          {/* Identity */}
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 block">
              Global Mastery
            </span>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent text-xs">
                <Zap size={13} className="fill-accent/40" />
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
                Level {level}
              </h2>
            </div>
          </div>

          {/* XP Numbers */}
          <div className="text-right space-y-0.5 flex-shrink-0">
            <div className="text-xs sm:text-sm font-bold text-zinc-200 tabular-nums">
              <span>{xpInCurrentLevel.toLocaleString()}</span>
              <span className="text-zinc-500 font-normal">
                {' / '}
                {xpRequiredForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <p className="text-[11px] text-accent/90 font-medium tabular-nums">
              {xpToNextLevel > 0 ? (
                <span>
                  <strong>{xpToNextLevel.toLocaleString()} XP</strong> to Level {level + 1}
                </span>
              ) : (
                <span>Max tier reached</span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="space-y-1.5">
          <div
            role="progressbar"
            aria-valuenow={Math.round(clampedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Mastery Level ${level} progress`}
            className="w-full h-2.5 overflow-hidden rounded-full bg-canvas/80 border border-edge/50 relative shadow-inner"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-indigo-400 to-accent-light transition-all duration-700 ease-out relative"
              style={{
                width: `${clampedProgress}%`,
                boxShadow: '0 0 12px rgba(129, 140, 248, 0.45)',
              }}
            />
          </div>

          {/* Bottom Micro Details */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 tabular-nums px-0.5">
            <span>{totalXP.toLocaleString()} Lifetime XP</span>
            <span className="font-medium text-zinc-400">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
