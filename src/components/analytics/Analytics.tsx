import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  type Timeframe,
  getTimeframeChartData,
  getTimeframeSummary,
  getSkillTimeDistribution,
  getFlowRatingDistribution,
  getReflectionTagsCount,
  getTShapedMasteryBreakdown,
} from '../../utils/analytics';
import { TimeAnalysisChart } from './TimeAnalysisChart';
import { formatDuration } from '../../utils/calculations';
import { cn } from '../../lib/utils';
import {
  Clock,
  Target,
  Sparkles,
  Zap,
  Layers,
  Compass,
  Star,
  Tag,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

const TIMEFRAMES: Array<{ id: Timeframe; label: string; desc: string }> = [
  { id: 'day', label: 'Day', desc: 'Hourly focus breakdown' },
  { id: 'week', label: 'Week', desc: 'Mon – Sun distribution' },
  { id: 'month', label: 'Month', desc: 'Daily focus this month' },
  { id: 'year', label: 'Year', desc: 'Annual month-by-month' },
];

export function Analytics() {
  const { sessions, skills, skillProgress, streak, totalXP } = useApp();
  const [timeframe, setTimeframe] = useState<Timeframe>('week');

  // Chart time-series data
  const chartData = useMemo(() => {
    return getTimeframeChartData(sessions, skills, timeframe);
  }, [sessions, skills, timeframe]);

  // High-level summary metrics
  const summary = useMemo(() => {
    return getTimeframeSummary(sessions, skills, timeframe);
  }, [sessions, skills, timeframe]);

  // Skill time distribution list
  const skillDistribution = useMemo(() => {
    return getSkillTimeDistribution(sessions, skills, timeframe);
  }, [sessions, skills, timeframe]);

  // Flow rating distribution
  const flowDistribution = useMemo(() => {
    return getFlowRatingDistribution(sessions, timeframe);
  }, [sessions, timeframe]);

  // Top reflection tags
  const reflectionTags = useMemo(() => {
    return getReflectionTagsCount(sessions, timeframe);
  }, [sessions, timeframe]);

  // T-shaped domain mastery
  const tShaped = useMemo(() => {
    return getTShapedMasteryBreakdown(skillProgress);
  }, [skillProgress]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── 1. Page Header & Timeframe Toggle Capsule ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 size={20} className="text-accent" />
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Practice Analytics
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Scientific breakdown of deliberate focus hours, consistency, and flow
          </p>
        </div>

        {/* Timeframe Selector Capsule */}
        <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md self-start sm:self-auto shadow-inner">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                timeframe === tf.id
                  ? 'text-white bg-accent/25 border border-accent/40 shadow-[0_0_12px_rgba(129,140,248,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]',
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Top Summary Stat Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Hours */}
        <div className="rounded-2xl p-4 bg-surface/80 border border-edge/60 backdrop-blur-xl shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {timeframe === 'day'
                ? 'Hours Today'
                : timeframe === 'week'
                ? 'Hours This Week'
                : timeframe === 'month'
                ? 'Hours This Month'
                : 'Hours This Year'}
            </span>
            <Clock size={15} className="text-accent" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 tabular-nums tracking-tight">
            {formatDuration(summary.totalSeconds)}
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">
            {summary.sessionCount} focus {summary.sessionCount === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        {/* Card 2: Daily Average */}
        <div className="rounded-2xl p-4 bg-surface/80 border border-edge/60 backdrop-blur-xl shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Daily Average
            </span>
            <TrendingUp size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 tabular-nums tracking-tight">
            {summary.dailyAverageHours}h <span className="text-xs font-normal text-zinc-500">/ day</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">
            {streak.currentStreak} day active streak
          </p>
        </div>

        {/* Card 3: Top Skill */}
        <div className="rounded-2xl p-4 bg-surface/80 border border-edge/60 backdrop-blur-xl shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Top Focus Skill
            </span>
            <Target size={15} className="text-amber-400" />
          </div>
          {summary.topSkill ? (
            <div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-base">{summary.topSkill.icon}</span>
                <span
                  className="text-sm font-bold truncate"
                  style={{ color: summary.topSkill.color }}
                >
                  {summary.topSkill.name}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">
                {summary.topSkill.hours}h ({summary.topSkill.percentage}% of time)
              </p>
            </div>
          ) : (
            <div>
              <div className="text-sm font-semibold text-zinc-500">—</div>
              <p className="text-[10px] text-zinc-600">No practice in period</p>
            </div>
          )}
        </div>

        {/* Card 4: Mastery XP */}
        <div className="rounded-2xl p-4 bg-surface/80 border border-edge/60 backdrop-blur-xl shadow-lg space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Mastery XP
            </span>
            <Zap size={15} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-accent tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(129,140,248,0.4)]">
            +{summary.totalXP} <span className="text-xs font-normal text-zinc-500">XP</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">
            Total lifetime: {totalXP} XP
          </p>
        </div>
      </div>

      {/* ── 3. Main Interactive Hours Graph Card ─────────────── */}
      <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Time Invested</span>
              <span className="text-xs font-normal text-zinc-400">
                ({TIMEFRAMES.find((t) => t.id === timeframe)?.desc})
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Hours of focused deliberate practice grouped by {timeframe}
            </p>
          </div>
          <div className="text-xs font-bold text-zinc-300 tabular-nums">
            Period Total:{' '}
            <span className="text-accent font-black text-sm">
              {formatDuration(summary.totalSeconds)}
            </span>
          </div>
        </div>

        {/* Graph Component */}
        <TimeAnalysisChart
          data={chartData}
          timeframe={timeframe}
          totalHours={summary.totalHours}
        />
      </div>

      {/* ── 4. T-Shaped Mastery & Skill Distribution Grid ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* T-Shaped Domain Breakdown */}
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  T-Shaped Domain Architecture
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Primary Core Depth vs. Auxiliary Support Skills
                </p>
              </div>
            </div>
          </div>

          {tShaped.coreSkill ? (
            <div className="space-y-4">
              {/* Ratio Visual Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-cyan-300 flex items-center gap-1">
                    <span>{tShaped.coreSkill.skill.icon}</span>
                    <span>Core Vertical Depth ({tShaped.corePercentage}%)</span>
                  </span>
                  <span className="text-zinc-400">
                    Auxiliary Breadth ({tShaped.auxiliaryPercentage}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.06] border border-white/10 overflow-hidden flex">
                  <div
                    style={{
                      width: `${tShaped.corePercentage}%`,
                      backgroundColor: tShaped.coreSkill.skill.color,
                    }}
                    className="h-full shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-500"
                  />
                  <div
                    style={{ width: `${tShaped.auxiliaryPercentage}%` }}
                    className="h-full bg-indigo-500/40 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Core Skill Details */}
              <div
                className="rounded-2xl p-3.5 border space-y-1.5"
                style={{
                  backgroundColor: `${tShaped.coreSkill.skill.color}15`,
                  borderColor: `${tShaped.coreSkill.skill.color}35`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tShaped.coreSkill.skill.icon}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: tShaped.coreSkill.skill.color }}
                    >
                      {tShaped.coreSkill.skill.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white tabular-nums">
                    {tShaped.coreHours}h / {tShaped.coreSkill.skill.targetHours}h
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Primary anchor domain for 100-hour deliberate mastery.
                </p>
              </div>

              {/* Auxiliary Skills Tags */}
              {tShaped.auxiliarySkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Supporting Breadth Skills ({tShaped.auxiliarySkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tShaped.auxiliarySkills.map((sp) => (
                      <div
                        key={sp.skill.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-zinc-300"
                      >
                        <span>{sp.skill.icon}</span>
                        <span>{sp.skill.name}</span>
                        <span className="text-zinc-500 text-[10px] font-mono">
                          {sp.totalHours}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              Add skills to visualize your T-shaped practice architecture.
            </div>
          )}
        </div>

        {/* Skill Time Distribution */}
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-accent" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Skill Time Allocation
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Distribution of focus across skills in this {timeframe}
                </p>
              </div>
            </div>
          </div>

          {skillDistribution.length > 0 ? (
            <div className="space-y-3">
              {skillDistribution.map((item) => (
                <div key={item.skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">{item.skill.icon}</span>
                      <span className="font-bold text-zinc-200 truncate">
                        {item.skill.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-zinc-400 tabular-nums flex-shrink-0">
                      <span className="text-zinc-200 font-bold">
                        {formatDuration(item.seconds)}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.skill.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              No practice logged for this {timeframe} yet.
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Deliberate Practice Quality & Flow Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Practice Adherence Card */}
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Target size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Deliberate Intentions
            </h4>
          </div>
          <div className="text-2xl font-black text-zinc-100 tabular-nums">
            {summary.deliberatePracticeRate}%
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Of completed sessions started with an explicit micro-goal intention.
          </p>
        </div>

        {/* Reflection Insight Card */}
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Reflection Rate
            </h4>
          </div>
          <div className="text-2xl font-black text-zinc-100 tabular-nums">
            {summary.reflectionRate}%
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Of completed sessions recorded post-focus insights or friction notes.
          </p>
        </div>

        {/* Flow Rating Distribution Card */}
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Star size={16} className="fill-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Average Flow Depth
              </h4>
            </div>
            <span className="text-sm font-black text-amber-300">
              {summary.avgFlowRating > 0 ? `${summary.avgFlowRating} / 5` : '—'}
            </span>
          </div>

          <div className="space-y-1.5">
            {flowDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-[11px]">
                <span className="text-zinc-400 font-mono w-4">{item.stars}★</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-zinc-500 font-mono text-[10px] w-6 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Breakthrough & Friction Tags (if available) ──── */}
      {reflectionTags.length > 0 && (
        <div className="rounded-3xl bg-surface/90 border border-edge/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <Tag size={16} className="text-accent" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Frequent Insights & Breakthrough Themes
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {reflectionTags.map((t) => (
              <span
                key={t.tag}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-zinc-300"
              >
                <span>{t.tag}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-accent/20 text-accent text-[10px] font-bold">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
