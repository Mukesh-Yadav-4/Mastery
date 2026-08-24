import { useState } from 'react';
import type { ChartBarData, Timeframe } from '../../utils/analytics';
import { formatDuration } from '../../utils/calculations';
import { cn } from '../../lib/utils';
import { Clock, Sparkles } from 'lucide-react';

interface TimeAnalysisChartProps {
  data: ChartBarData[];
  timeframe: Timeframe;
  totalHours: number;
}

export function TimeAnalysisChart({
  data,
  timeframe,
  totalHours,
}: TimeAnalysisChartProps) {
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);

  const maxHours = Math.max(
    ...data.map((d) => d.totalHours),
    timeframe === 'day' ? 1.0 : timeframe === 'week' ? 2.0 : 4.0,
  );

  const hoveredData = data.find((d) => d.id === hoveredBarId) || null;

  return (
    <div className="space-y-4">
      {/* Chart Canvas Container */}
      <div className="relative pt-6 pb-2 select-none">
        {/* Y-Axis Gridlines & Reference Labels */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-white/20 w-full flex items-center justify-between text-[10px] text-zinc-400">
            <span>{maxHours.toFixed(1)}h</span>
          </div>
          <div className="border-b border-white/10 w-full flex items-center justify-between text-[10px] text-zinc-400">
            <span>{(maxHours / 2).toFixed(1)}h</span>
          </div>
          <div className="border-b border-white/20 w-full flex items-center justify-between text-[10px] text-zinc-400">
            <span>0h</span>
          </div>
        </div>

        {/* Bars Flex Track */}
        <div
          className={cn(
            'relative h-44 sm:h-52 flex items-end justify-between gap-1 sm:gap-2 px-1 z-10',
            timeframe === 'month' && 'gap-0.5 sm:gap-1',
          )}
        >
          {data.map((bar) => {
            const heightPercent =
              maxHours > 0 ? Math.min(100, (bar.totalHours / maxHours) * 100) : 0;
            const isHovered = hoveredBarId === bar.id;
            const hasHours = bar.totalSeconds > 0;
            const primarySkill = bar.skillBreakdown[0];

            return (
              <div
                key={bar.id}
                onMouseEnter={() => setHoveredBarId(bar.id)}
                onMouseLeave={() => setHoveredBarId(null)}
                className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
              >
                {/* Bar Column with Rounded Cap & Glow */}
                <div
                  style={{
                    height: `${Math.max(hasHours ? 6 : 2, heightPercent)}%`,
                  }}
                  className={cn(
                    'w-full max-w-[32px] rounded-t-lg transition-all duration-300 relative overflow-hidden',
                    hasHours
                      ? isHovered
                        ? 'brightness-125 shadow-[0_0_16px_rgba(129,140,248,0.6)]'
                        : 'shadow-[0_0_8px_rgba(129,140,248,0.2)]'
                      : 'bg-white/[0.04]',
                    bar.isCurrent && !hasHours && 'bg-accent/15 border-t border-accent/40',
                  )}
                >
                  {hasHours && (
                    <div
                      className="absolute inset-0 transition-opacity duration-200"
                      style={{
                        background: primarySkill
                          ? `linear-gradient(to top, ${primarySkill.color}70, ${primarySkill.color})`
                          : 'linear-gradient(to top, #6366f1, #818cf8)',
                      }}
                    />
                  )}
                  {bar.isCurrent && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/60 shadow-[0_0_8px_white]" />
                  )}
                </div>

                {/* X-Axis Label */}
                <div className="h-6 flex items-center justify-center pt-2">
                  <span
                    className={cn(
                      'text-[10px] font-semibold transition-colors truncate',
                      bar.isCurrent
                        ? 'text-accent font-bold'
                        : isHovered
                        ? 'text-zinc-100'
                        : 'text-zinc-400',
                      timeframe === 'month' &&
                        parseInt(bar.label, 10) % 5 !== 0 &&
                        bar.label !== '1' &&
                        !bar.isCurrent &&
                        'hidden sm:inline text-[9px]',
                    )}
                  >
                    {bar.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating or Docked Hover Details Card */}
      <div
        className={cn(
          'rounded-2xl p-3.5 bg-surface/90 border border-edge/80 backdrop-blur-xl transition-all duration-200',
          hoveredData && hoveredData.totalSeconds > 0
            ? 'border-accent/40 shadow-[0_0_24px_rgba(129,140,248,0.15)] opacity-100'
            : 'opacity-80',
        )}
      >
        {hoveredData ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-accent text-sm">
                <Clock size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100">
                    {hoveredData.subLabel || hoveredData.label}
                  </span>
                  {hoveredData.isCurrent && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-accent/20 text-accent border border-accent/30">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-bold text-zinc-200 tabular-nums">
                    {formatDuration(hoveredData.totalSeconds)}
                  </span>
                  <span>•</span>
                  <span>
                    {hoveredData.sessionCount}{' '}
                    {hoveredData.sessionCount === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Skill breakdown chips */}
            {hoveredData.skillBreakdown.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {hoveredData.skillBreakdown.map((sk) => (
                  <div
                    key={sk.skillId}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${sk.color}15`,
                      borderColor: `${sk.color}35`,
                      color: sk.color,
                    }}
                  >
                    <span>{sk.icon}</span>
                    <span className="truncate max-w-[110px]">{sk.name}</span>
                    <span className="text-zinc-300 font-mono text-[10px]">
                      {formatDuration(sk.seconds)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" />
              <span>Hover over any bar to inspect deliberate practice sessions</span>
            </span>
            <span className="font-bold text-zinc-300 tabular-nums">
              Total: {formatDuration(totalHours * 3600)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
