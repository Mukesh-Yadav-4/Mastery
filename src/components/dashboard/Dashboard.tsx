import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HomeCosmos } from '../cosmos/HomeCosmos';
import { SkillCard } from '../skills/SkillCard';
import { CreateSkillModal } from '../skills/CreateSkillModal';
import { Button } from '../ui/Button';
import {
  formatDuration,
  formatRelativeTime,
} from '../../utils/calculations';
import { Plus } from 'lucide-react';

export function Dashboard() {
  const {
    skills,
    sessions,
    skillProgress,
    startTimer,
  } = useApp();

  const [showCreateSkill, setShowCreateSkill] = useState(false);

  const recentSessions = sessions.slice(0, 5);
  const hasSkills = skills.length > 0;

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in pb-12">
      {/* ── Visual Centerpiece: 3D Cosmic Growth System ──────── */}
      <HomeCosmos onOpenCreateSkill={() => setShowCreateSkill(true)} />

      {/* ── Active Capabilities / Skills List ────────────────── */}
      {hasSkills && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Active Capabilities
              </h2>
              <p className="text-xs text-zinc-400">
                Deliberate practice accumulation and journey milestones
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateSkill(true)}
              className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Skill</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {skillProgress.map((sp) => (
              <SkillCard
                key={sp.skill.id}
                progress={sp}
                onPractice={startTimer}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Practice Sessions ─────────────────────────── */}
      {recentSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Recent Practice Sessions
          </h2>
          <div className="space-y-1.5">
            {recentSessions.map((session) => {
              const skill = skills.find((s) => s.id === session.skillId);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-surface/60 hover:bg-surface border border-edge/40 transition-colors duration-150"
                >
                  <span className="text-base">{skill?.icon ?? '🎯'}</span>
                  <span className="text-sm text-zinc-200 font-medium truncate flex-1">
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
      )}

      {/* Create Skill Modal */}
      <CreateSkillModal
        open={showCreateSkill}
        onClose={() => setShowCreateSkill(false)}
      />
    </div>
  );
}
