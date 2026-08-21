import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { formatHoursMinutes, formatPercentage } from '../../utils/calculations';
import { MILESTONE_LABELS } from '../../lib/constants';
import type { SkillProgress } from '../../types';
import { Play } from 'lucide-react';

interface SkillCardProps {
  progress: SkillProgress;
  onPractice: (skillId: string) => void;
}

export function SkillCard({ progress, onPractice }: SkillCardProps) {
  const { skill, totalSeconds, percentage, nextMilestone } = progress;

  return (
    <div
      className={cn(
        'group relative rounded-card bg-surface border border-edge/50 p-4',
        'transition-all duration-250',
        'hover:border-edge hover:bg-surface/80',
      )}
    >
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <ProgressRing
          percentage={percentage}
          size={72}
          strokeWidth={6}
          color={skill.color}
        >
          <span className="text-xs font-semibold text-zinc-300 tabular-nums">
            {formatPercentage(percentage)}
          </span>
        </ProgressRing>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">{skill.icon}</span>
            <h3 className="text-sm font-semibold text-zinc-100 truncate">
              {skill.name}
            </h3>
          </div>

          {/* Hours */}
          <p className="text-xs text-zinc-400 mb-1.5">
            <span className="text-zinc-200 font-medium">
              {formatHoursMinutes(totalSeconds)}
            </span>
            {' / '}
            {skill.targetHours}h
          </p>

          {/* Next milestone */}
          {nextMilestone ? (
            <div className="flex items-center gap-1.5">
              <div
                className="h-1 flex-1 rounded-full bg-elevated overflow-hidden max-w-[120px]"
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min((percentage / nextMilestone) * 100, 100)}%`,
                    backgroundColor: skill.color,
                  }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                {MILESTONE_LABELS[nextMilestone]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-success font-medium">
              ✓ Goal complete
            </span>
          )}
        </div>

        {/* Practice Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPractice(skill.id)}
          className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
          aria-label={`Practice ${skill.name}`}
        >
          <Play size={14} />
          <span className="hidden sm:inline">Practice</span>
        </Button>
      </div>
    </div>
  );
}
