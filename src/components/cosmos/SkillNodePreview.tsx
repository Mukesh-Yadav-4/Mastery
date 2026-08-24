import type { SceneNodeData } from './Cosmos3DScene';
import { Compass, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SkillNodePreviewProps {
  node: SceneNodeData;
  className?: string;
}

export function SkillNodePreview({ node, className }: SkillNodePreviewProps) {
  const progression = node.progression;
  const stageName = progression?.currentStage.name ?? 'Foundation';
  const nextHorizon = progression?.nextVisualMilestoneHours;

  return (
    <div
      className={cn(
        'pointer-events-none transition-all duration-200 ease-out animate-fade-in',
        'rounded-2xl bg-[#090d1f]/95 border border-edge/80 px-3.5 py-2.5 backdrop-blur-xl shadow-2xl shadow-black/80',
        'flex items-center gap-3 select-none ring-1 ring-white/10',
        className,
      )}
      role="tooltip"
      aria-label={`Preview for ${node.name}`}
    >
      {/* Skill Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-white/15 shadow-inner"
        style={{ backgroundColor: `${node.color}25` }}
      >
        {node.icon}
      </div>

      {/* Details */}
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5 truncate">
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-tight truncate">
            {node.name}
          </h4>
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-accent">
            <Zap size={10} className="fill-current" />
            Lv.{node.level}
          </span>
          <span
            className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-canvas/80 border border-edge/60 flex-shrink-0"
            style={{ color: node.color }}
          >
            {stageName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="font-semibold text-zinc-200">
            {node.formattedDuration} invested
          </span>
          {nextHorizon && (
            <span className="text-zinc-500 flex items-center gap-0.5">
              • <Compass size={10} className="text-cyan-400" />
              Next Horizon · {nextHorizon}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
