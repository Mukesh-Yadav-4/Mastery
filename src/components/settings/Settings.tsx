import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { LogOut, Flame, Zap, Sparkles, Check, Share2 } from 'lucide-react';
import { formatDuration } from '../../utils/calculations';
import { CORE_PALETTES_LIST } from '../../utils/palettes';
import { ShareProgressModal } from '../share/ShareProgressModal';
import { cn } from '../../lib/utils';

export function Settings() {
  const { user, signOut } = useAuth();
  const {
    totalSeconds,
    streak,
    sessions,
    skills,
    totalXP,
    globalLevelInfo,
    paletteId,
    setPaletteId,
  } = useApp();

  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Profile & Journey</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 cursor-pointer border border-accent/40 hover:border-accent"
        >
          <Share2 size={13} className="text-accent" />
          <span>Share Progress Card</span>
        </Button>
      </div>

      {/* User info */}
      <div className="rounded-card bg-surface border border-edge/30 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
            ⚡
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {user?.email}
            </p>
            <p className="text-xs text-zinc-500">
              Member since{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-zinc-500"
        >
          <LogOut size={14} />
          Sign out
        </Button>
      </div>

      {/* ── CORE IDENTITY Palette Personalization ────────────── */}
      <div className="rounded-card bg-surface border border-edge/30 p-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
            <Sparkles size={14} />
            <span>Core Identity</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Choose the energy of your universe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_PALETTES_LIST.map((p) => {
            const isSelected = paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaletteId(p.id)}
                className={cn(
                  'relative text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer group',
                  isSelected
                    ? 'bg-surface-elevated/80 border-accent/80 shadow-lg ring-1 ring-accent/40'
                    : 'bg-canvas/50 border-edge/40 hover:border-zinc-500 hover:bg-surface-elevated/40',
                )}
                aria-pressed={isSelected}
              >
                {/* Visual Orb Preview */}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/20 shadow-md relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${p.coreInner}, ${p.corePrimary}, ${p.coreSecondary})`,
                    boxShadow: isSelected ? `0 0 16px ${p.aura}80` : undefined,
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white/90 blur-[1px] shadow-sm" />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-zinc-100">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-semibold text-accent/90">
                        — {p.themeName}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-accent flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    {p.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats overview */}
      <div className="rounded-card bg-surface border border-edge/30 p-5">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">
          Your Progression
        </h2>

        <div className="space-y-3">
          <StatRow
            label="Mastery Level"
            value={
              <span className="flex items-center gap-1 text-accent font-bold">
                <Zap size={14} />
                Level {globalLevelInfo.level}
              </span>
            }
          />
          <StatRow label="Total Experience" value={`${totalXP.toLocaleString()} XP`} />
          <StatRow label="Total Practice" value={formatDuration(totalSeconds)} />
          <StatRow label="Sessions Completed" value={`${sessions.length}`} />
          <StatRow label="Active Skills" value={`${skills.length}`} />
          <StatRow
            label="Current Streak"
            value={
              streak.currentStreak > 0 ? (
                <span className="flex items-center gap-1">
                  <Flame size={14} className="text-orange-400" />
                  {streak.currentStreak} days
                </span>
              ) : (
                '—'
              )
            }
          />
          <StatRow
            label="Longest Streak"
            value={
              streak.longestStreak > 0
                ? `${streak.longestStreak} days`
                : '—'
            }
          />
          {sessions.length > 0 ? (
            <StatRow
              label="Average Session"
              value={formatDuration(
                Math.round(
                  sessions.reduce(
                    (acc, s) => acc + s.durationSeconds,
                    0,
                  ) / sessions.length,
                ),
              )}
            />
          ) : null}
        </div>
      </div>

      {/* Share Progress Card Modal */}
      <ShareProgressModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-edge/20 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}
