import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillCard } from '../skills/SkillCard';
import { CreateSkillModal } from '../skills/CreateSkillModal';
import { Button } from '../ui/Button';
import { MasteryLevelCard } from './MasteryLevelCard';
import {
  formatDuration,
  formatRelativeTime,
} from '../../utils/calculations';
import { Plus, Flame, Clock, Zap } from 'lucide-react';

export function Dashboard() {
  const {
    skills,
    sessions,
    skillProgress,
    streak,
    totalSeconds,
    todaySeconds,
    totalXP,
    globalLevelInfo,
    startTimer,
  } = useApp();

  const [showCreateSkill, setShowCreateSkill] = useState(false);

  const recentSessions = sessions.slice(0, 5);
  const hasSkills = skills.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Global Mastery Level Banner ───────────────────────── */}
      {hasSkills && (
        <MasteryLevelCard
          levelInfo={globalLevelInfo}
          totalXP={totalXP}
        />
      )}

      {/* ── Stats Row ────────────────────────────────────────── */}
      {hasSkills ? (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Clock size={16} className="text-accent" />}
            label="Total Practice"
            value={formatDuration(totalSeconds)}
          />
          <StatCard
            icon={<Zap size={16} className="text-warning" />}
            label="Today"
            value={formatDuration(todaySeconds)}
          />
          <StatCard
            icon={<Flame size={16} className="text-orange-400" />}
            label="Streak"
            value={
              streak.currentStreak > 0
                ? `${streak.currentStreak}d`
                : '—'
            }
          />
        </div>
      ) : null}

      {/* ── What Should I Work on Next? Spotlight ─────────────── */}
      {hasSkills && skillProgress.length > 0 ? (() => {
        // Find best skill to practice: not 100%, or the first skill
        const candidate = skillProgress.find((sp) => sp.percentage < 100) || skillProgress[0];
        if (!candidate) return null;

        const { skill, nextMilestone } = candidate;
        return (
          <section className="rounded-2xl bg-gradient-to-br from-surface via-surface to-elevated/90 border border-edge p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${skill.color}20` }}
                >
                  {skill.icon}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                      Up next
                    </span>
                    {nextMilestone ? (
                      <span className="text-[11px] text-zinc-500">
                        • Next: {nextMilestone}% milestone
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 truncate">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-200">
                      {formatDuration(candidate.totalSeconds)}
                    </span>
                    {' invested of '}
                    {skill.targetHours}h goal
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => startTimer(skill.id)}
                className="w-full sm:w-auto font-medium flex-shrink-0 shadow-md shadow-accent/20 cursor-pointer"
              >
                <Zap size={16} />
                Start Focus Session
              </Button>
            </div>
          </section>
        );
      })() : null}

      {/* ── Skills ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100">
            {hasSkills ? 'Your Skills' : ''}
          </h2>
          {hasSkills ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateSkill(true)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Plus size={16} />
              Add Skill
            </Button>
          ) : null}
        </div>

        {hasSkills ? (
          <div className="space-y-3">
            {skillProgress.map((sp) => (
              <SkillCard
                key={sp.skill.id}
                progress={sp}
                onPractice={startTimer}
              />
            ))}
          </div>
        ) : (
          /* ── Empty State ──────────────────────────────────── */
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              What do you want to master?
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
              Choose a skill, set a goal, and start tracking your
              deliberate practice.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCreateSkill(true)}
            >
              <Plus size={18} />
              Create your first skill
            </Button>
          </div>
        )}
      </section>

      {/* ── Recent Sessions ──────────────────────────────────── */}
      {recentSessions.length > 0 ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-1.5">
            {recentSessions.map((session) => {
              const skill = skills.find((s) => s.id === session.skillId);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-surface/40 hover:bg-surface border border-edge/30 transition-colors duration-150"
                >
                  <span className="text-sm">{skill?.icon ?? '🎯'}</span>
                  <span className="text-sm text-zinc-300 font-medium truncate flex-1">
                    {skill?.name ?? 'Deliberate Practice'}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold tabular-nums">
                    {formatDuration(session.durationSeconds)}
                  </span>
                  <span className="text-xs text-zinc-600 min-w-[60px] text-right">
                    {formatRelativeTime(session.startedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Create Skill Modal */}
      <CreateSkillModal
        open={showCreateSkill}
        onClose={() => setShowCreateSkill(false)}
      />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface/80 border border-edge/50 p-3 text-center shadow-sm">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-base sm:text-lg font-bold text-zinc-100 tabular-nums">{value}</p>
    </div>
  );
}
