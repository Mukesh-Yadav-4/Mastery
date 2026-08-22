import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { LogOut, Flame, Zap } from 'lucide-react';
import { formatDuration } from '../../utils/calculations';

export function Settings() {
  const { user, signOut } = useAuth();
  const { totalSeconds, streak, sessions, skills, totalXP, globalLevelInfo } = useApp();

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Profile & Journey</h1>

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
