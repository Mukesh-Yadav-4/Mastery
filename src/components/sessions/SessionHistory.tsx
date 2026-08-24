import { useApp } from '../../context/AppContext';
import {
  formatDuration,
  formatRelativeTime,
  getLocalDateString,
} from '../../utils/calculations';

export function SessionHistory() {
  const { sessions, skills } = useApp();

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-3">📝</div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">
          No sessions yet
        </h2>
        <p className="text-sm text-zinc-500">
          Complete a focus session to see your history here.
        </p>
      </div>
    );
  }

  // Group sessions by date
  const grouped = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const dateKey = getLocalDateString(session.startedAt);
    const existing = grouped.get(dateKey);
    if (existing) {
      existing.push(session);
    } else {
      grouped.set(dateKey, [session]);
    }
  }

  const sortedDates = Array.from(grouped.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-lg font-semibold text-zinc-100 mb-5">History</h1>

      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const daySessions = grouped.get(dateKey)!;
          const dayTotal = daySessions.reduce(
            (acc, s) => acc + s.durationSeconds,
            0,
          );

          // Format date label
          const today = getLocalDateString(new Date());
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = getLocalDateString(yesterday);

          let dateLabel: string;
          if (dateKey === today) {
            dateLabel = 'Today';
          } else if (dateKey === yesterdayStr) {
            dateLabel = 'Yesterday';
          } else {
            dateLabel = new Date(dateKey + 'T12:00:00').toLocaleDateString(
              undefined,
              {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              },
            );
          }

          return (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {dateLabel}
                </h3>
                <span className="text-xs text-zinc-600 tabular-nums">
                  {formatDuration(dayTotal)}
                </span>
              </div>

              {/* Sessions */}
              <div className="space-y-1">
                {daySessions.map((session) => {
                  const skill = skills.find(
                    (s) => s.id === session.skillId,
                  );
                  const stars = session.reflection?.qualityRating ?? 4;
                  return (
                    <div
                      key={session.id}
                      className="py-3 px-3.5 rounded-xl bg-surface border border-edge/30 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">
                          {skill?.icon ?? '🎯'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-200 truncate">
                            {skill?.name ?? 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{formatRelativeTime(session.startedAt)}</span>
                            <span className="text-zinc-700">•</span>
                            <div className="flex items-center text-amber-400 text-[10px]">
                              {'★'.repeat(stars)}
                              <span className="text-zinc-700">
                                {'★'.repeat(Math.max(0, 5 - stars))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-zinc-300 tabular-nums flex-shrink-0">
                          {formatDuration(session.durationSeconds)}
                        </span>
                      </div>

                      {session.intention && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium pl-8">
                          <span className="text-accent text-[10px] font-bold uppercase tracking-wider">
                            Target:
                          </span>
                          <span className="truncate italic text-zinc-200">
                            "{session.intention}"
                          </span>
                        </div>
                      )}

                      {session.reflection?.notes && (
                        <div className="pl-8">
                          <p className="text-xs text-zinc-400 italic bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                            {session.reflection.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
