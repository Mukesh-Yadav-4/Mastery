import { useState } from 'react';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { formatDuration, formatPercentage } from '../../utils/calculations';
import { MILESTONE_LABELS } from '../../lib/constants';
import type { SkillProgress } from '../../types';
import { useApp } from '../../context/AppContext';
import { DeleteSkillModal } from './DeleteSkillModal';
import { Play, Trash2 } from 'lucide-react';

interface SkillCardProps {
  progress: SkillProgress;
  onPractice: (skillId: string) => void;
}

export function SkillCard({ progress, onPractice }: SkillCardProps) {
  const { deleteSkill } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { skill, totalSeconds, percentage, nextMilestone, skillXP, skillLevel } = progress;

  return (
    <>
      <div
        className={cn(
          'group relative rounded-2xl bg-surface/90 border border-edge/60 p-4 sm:p-5',
          'transition-all duration-250 hover:border-edge hover:bg-surface hover:shadow-lg hover:shadow-black/20',
        )}
      >
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Progress Ring */}
          <ProgressRing
            percentage={percentage}
            size={68}
            strokeWidth={5.5}
            color={skill.color}
          >
            <span className="text-xs font-bold text-zinc-200 tabular-nums">
              {formatPercentage(percentage)}
            </span>
          </ProgressRing>

          {/* Info Hierarchy */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Skill Title & Icon */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-base">{skill.icon}</span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate tracking-tight">
                  {skill.name}
                </h3>
              </div>

              {/* Secondary Delete Action */}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                title={`Delete ${skill.name}`}
                aria-label={`Delete ${skill.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Primary Metric: Deliberate Practice Hours Invested */}
            <p className="text-xs sm:text-sm text-zinc-400">
              <span className="text-zinc-100 font-semibold tabular-nums">
                {formatDuration(totalSeconds)}
              </span>
              <span className="text-zinc-500 font-normal">
                {' / '}
                {skill.targetHours}h goal
              </span>
            </p>

            {/* Secondary Progression: Level & XP */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-0.5">
              <span className="font-semibold text-zinc-300">
                Level {skillLevel?.level ?? 1}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 tabular-nums">
                {(skillXP ?? 0).toLocaleString()} XP
              </span>

              {nextMilestone && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline">
                    Next: {MILESTONE_LABELS[nextMilestone]}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Practice CTA */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPractice(skill.id)}
            className="flex-shrink-0 opacity-80 group-hover:opacity-100 group-hover:border-accent/40 transition-all cursor-pointer"
            aria-label={`Practice ${skill.name}`}
          >
            <Play size={14} className="text-accent" />
            <span className="hidden sm:inline font-medium">Practice</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSkillModal
        open={showDeleteModal}
        skillName={skill.name}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteSkill(skill.id)}
      />
    </>
  );
}
