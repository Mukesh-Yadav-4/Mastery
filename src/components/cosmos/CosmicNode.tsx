import { cn } from '../../lib/utils';
import type { SkillProgressionState } from '../../utils/progression';

export interface CosmicNodeData {
  id: string;
  name: string;
  icon: string;
  color: string;
  level: number;
  xp?: number;
  totalHours?: number;
  formattedDuration: string;
  targetHours?: number;
  percentage: number;
  depth: 'foreground' | 'midground' | 'background';
  x: number; // 0 to 100% position on stage
  y: number; // 0 to 100% position on stage
  isCustom?: boolean;
  progression?: SkillProgressionState;
}

interface CosmicNodeProps {
  node: CosmicNodeData;
  isSelected?: boolean;
  onSelect: (node: CosmicNodeData) => void;
}

export function CosmicNode({ node, isSelected, onSelect }: CosmicNodeProps) {
  const { name, icon, color, level, depth, x, y } = node;

  const depthStyles = {
    background: 'scale-[0.82] opacity-70 z-10 hover:opacity-100 hover:scale-95',
    midground: 'scale-100 opacity-95 z-20 hover:scale-105',
    foreground: 'scale-[1.12] opacity-100 z-30 hover:scale-[1.2]',
  };

  return (
    <div
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none transition-all duration-300 ease-out group',
        depthStyles[depth],
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={() => onSelect(node)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${name}, Level ${level}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node);
        }
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Outer Pulsing Aura Glow */}
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-xl transition-all duration-500 -z-10',
            isSelected ? 'opacity-80 scale-150' : 'opacity-35 group-hover:opacity-65 group-hover:scale-125',
          )}
          style={{ backgroundColor: color }}
        />

        {/* Node Badge */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface/90 border backdrop-blur-md transition-all duration-300 shadow-lg',
            isSelected
              ? 'border-accent shadow-[0_0_20px_rgba(129,140,248,0.5)] ring-1 ring-accent/60'
              : 'border-edge/70 hover:border-zinc-300',
          )}
        >
          <span className="text-base">{icon}</span>
          <span className="text-xs font-bold text-zinc-100 truncate max-w-[110px]">
            {name}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-canvas/80 border border-edge/60"
            style={{ color }}
          >
            Lv.{level}
          </span>
        </div>
      </div>
    </div>
  );
}
