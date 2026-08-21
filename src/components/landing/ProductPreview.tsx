import { useState } from 'react';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { MILESTONE_PERCENTAGES, MILESTONE_LABELS, MILESTONE_ICONS } from '../../lib/constants';
import { Flame, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface MockSkill {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  targetHours: number;
  totalSeconds: number;
  currentStreak: number;
  recentNotes: string;
}

const PREVIEW_SKILLS: MockSkill[] = [
  {
    id: 'german',
    name: 'German Fluency',
    category: 'Languages',
    icon: '🇩🇪',
    color: '#fbbf24', // Amber
    targetHours: 100,
    totalSeconds: 63 * 3600 + 24 * 60, // 63h 24m = 63.4%
    currentStreak: 14,
    recentNotes: 'Shadowed 45 min native conversation podcast & drilled subjunctive active recall.',
  },
  {
    id: 'system-design',
    name: 'Distributed Systems',
    category: 'Programming',
    icon: '💻',
    color: '#818cf8', // Indigo
    targetHours: 200,
    totalSeconds: 104 * 3600 + 30 * 60, // 104.5h = 52.25%
    currentStreak: 9,
    recentNotes: 'Designed raft consensus replication protocol and verified leader election timeouts.',
  },
  {
    id: 'piano',
    name: 'Classical Piano',
    category: 'Music & Arts',
    icon: '🎹',
    color: '#34d399', // Emerald
    targetHours: 150,
    totalSeconds: 38 * 3600 + 15 * 60, // 38h 15m = 25.5%
    currentStreak: 6,
    recentNotes: 'Isolated Chopin Op 9 No 2 polyrhythm measures at 50 BPM hands separate.',
  },
];

interface ProductPreviewProps {
  onStartSkill: () => void;
}

export function ProductPreview({ onStartSkill }: ProductPreviewProps) {
  const [selectedId, setSelectedId] = useState<string>('german');
  const skill = PREVIEW_SKILLS.find((s) => s.id === selectedId) || PREVIEW_SKILLS[0];

  const totalHours = Math.round((skill.totalSeconds / 3600) * 10) / 10;
  const percentage = Math.min((skill.totalSeconds / (skill.targetHours * 3600)) * 100, 100);
  const formattedPct = (Math.round(percentage * 10) / 10).toFixed(1);

  const hoursInt = Math.floor(skill.totalSeconds / 3600);
  const minsInt = Math.floor((skill.totalSeconds % 3600) / 60);

  // Find next milestone
  const nextMilestone = MILESTONE_PERCENTAGES.find((p) => p > percentage) ?? 100;
  const nextMilestoneHours = Math.round((nextMilestone / 100) * skill.targetHours);
  const remainingHours = Math.max(0, Math.round((nextMilestoneHours - totalHours) * 10) / 10);

  return (
    <section id="preview" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
          Interactive Product Preview
        </h2>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-100">
          The progress experience is the emotional center.
        </p>
        <p className="text-sm text-zinc-400">
          Every minute of focused practice feeds into a tangible, compounding visualization of your self-development.
        </p>
      </div>

      {/* Mockup Container */}
      <div className="relative rounded-2xl border border-edge/80 bg-surface/90 p-5 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all">
        {/* Glow ambient highlight behind preview */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-20 blur-xl transition-all -z-10"
          style={{ backgroundColor: skill.color }}
          aria-hidden="true"
        />

        {/* Skill Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-edge/60 scrollbar-none">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-2 hidden sm:inline">
            Select journey:
          </span>
          {PREVIEW_SKILLS.map((item) => {
            const isSelected = item.id === skill.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-elevated text-zinc-100 border border-edge shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-elevated/40'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Core Product Preview UI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big Radial Gauge & Milestone Progression */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-canvas/40 rounded-xl border border-edge/40">
            <div className="relative my-2">
              <ProgressRing
                percentage={percentage}
                size={180}
                strokeWidth={7}
                color={skill.color}
              >
                <div className="text-center flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-zinc-100 tracking-tight tabular-nums">
                    {formattedPct}%
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    Goal Progress
                  </span>
                </div>
              </ProgressRing>
            </div>

            {/* Streak & Today Stats */}
            <div className="flex items-center justify-center gap-4 mt-4 w-full pt-3 border-t border-edge/40 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-semibold">
                  <Flame size={14} />
                  <span>{skill.currentStreak} Days</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Unbroken Streak</p>
              </div>
              <div className="w-px h-6 bg-edge/60" />
              <div>
                <div className="flex items-center justify-center gap-1 text-accent text-xs font-semibold">
                  <Clock size={14} />
                  <span>{totalHours}h</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Total Invested</p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Journey Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{skill.icon}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
                  {skill.name}
                </h3>
              </div>
              <p className="text-sm text-zinc-300 font-medium">
                <span className="text-zinc-100 font-bold">{hoursInt}h {minsInt}m</span> invested of your{' '}
                <span className="text-zinc-100 font-bold">{skill.targetHours}h</span> commitment
              </p>
            </div>

            {/* Milestone Pathway */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Milestone Checkpoints
                </span>
                <span className="text-accent font-medium text-xs flex items-center gap-1">
                  Next: {nextMilestone}% ({remainingHours}h remaining)
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {MILESTONE_PERCENTAGES.map((milestone) => {
                  const isUnlocked = percentage >= milestone;
                  const isCurrentTarget = nextMilestone === milestone;
                  return (
                    <div
                      key={milestone}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        isUnlocked
                          ? 'bg-accent/10 border-accent/40 text-accent'
                          : isCurrentTarget
                          ? 'bg-elevated border-edge text-zinc-200 ring-1 ring-accent/50'
                          : 'bg-canvas/30 border-edge/40 text-zinc-600'
                      }`}
                    >
                      <span className="text-sm">{isUnlocked ? '✓' : MILESTONE_ICONS[milestone]}</span>
                      <span className="text-[11px] font-bold mt-1">{milestone}%</span>
                      <span className="text-[9px] text-zinc-500 hidden sm:inline">
                        {MILESTONE_LABELS[milestone]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Focus Session Log Preview */}
            <div className="rounded-lg bg-canvas/60 border border-edge/50 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Latest Deliberate Practice Session</span>
                </span>
                <span className="text-zinc-500">Today • 45m</span>
              </div>
              <p className="text-zinc-300 italic font-mono text-[11px]">
                "{skill.recentNotes}"
              </p>
            </div>

            {/* Interactive Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onStartSkill}
                className="w-full sm:w-auto font-semibold gap-2 shadow-lg shadow-accent/20"
              >
                <Zap size={16} />
                <span>Start practicing {skill.name}</span>
                <ChevronRight size={14} />
              </Button>
              <span className="text-xs text-zinc-500">
                Full-screen distraction-free timer with timestamp accuracy
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
