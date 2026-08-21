import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { LogOut, Flame } from 'lucide-react';
import { formatDuration } from '../../utils/calculations';

export function Settings() {
  const { user, signOut } = useAuth();
  const { totalHours, streak, sessions, skills } = useApp();

  return (
    <div className="animate-fade-in">
      <h1 className="text-lg font-semibold text-zinc-100 mb-6">Profile</h1>

      {/* User info */}
      <div className="rounded-card bg-surface border border-edge/30 p-5 mb-6">
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
          Your journey
        </h2>

        <div className="space-y-3">
          <StatRow label="Total practice" value={`${totalHours} hours`} />
          <StatRow label="Sessions completed" value={`${sessions.length}`} />
          <StatRow label="Skills active" value={`${skills.length}`} />
          <StatRow
            label="Current streak"
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
            label="Longest streak"
            value={
              streak.longestStreak > 0
                ? `${streak.longestStreak} days`
                : '—'
            }
          />
          {sessions.length > 0 ? (
            <StatRow
              label="Avg session"
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
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}
