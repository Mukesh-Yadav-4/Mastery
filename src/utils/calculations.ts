import type {
  FocusSession,
  Skill,
  SkillProgress,
  StreakData,
  MilestoneRecord,
  LevelInfo,
} from '../types';
import {
  MILESTONE_PERCENTAGES,
  LEVEL_XP_THRESHOLDS,
  SESSION_COMPLETION_BONUS_TIERS,
} from '../lib/constants';

// ── Time Formatting ───────────────────────────────────────────

/**
 * Canonical duration formatting system.
 * Uses stored seconds as the single source of truth.
 *
 * Rules:
 * - < 60 seconds      → "42s" (e.g. "1s", "0s")
 * - 60s to < 1 hour   → "1m", "42m"
 * - 1 hour+           → "1h 04m", "1h 00m"
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s';

  const secs = Math.floor(totalSeconds);
  if (secs < 60) {
    return `${secs}s`;
  }

  const mins = Math.floor(secs / 60);
  if (mins < 60) {
    return `${mins}m`;
  }

  const hrs = Math.floor(secs / 3600);
  const remMins = Math.floor((secs % 3600) / 60);
  const padMins = remMins.toString().padStart(2, '0');
  return `${hrs}h ${padMins}m`;
}

/** Format seconds as "1h 04m" or "42m" (canonical formatDuration) */
export function formatHoursMinutes(totalSeconds: number): string {
  return formatDuration(totalSeconds);
}

/** Format seconds as timer display "01:23:45" or "23:45" */
export function formatTimerDisplay(totalSeconds: number): string {
  const absSeconds = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(absSeconds / 3600);
  const mins = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  const pad = (n: number): string => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/** Format percentage accurately: e.g. "34.45%", "0%", "100%", "25%" */
export function formatPercentage(percentage: number): string {
  if (percentage <= 0) return '0%';
  if (percentage >= 100) return '100%';
  if (Number.isInteger(percentage)) return `${percentage}%`;
  const rounded = parseFloat(percentage.toFixed(2));
  return `${rounded}%`;
}

/** Convert seconds to hours with 1 decimal precision */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10;
}

// ── Date Helpers ──────────────────────────────────────────────

/** Get today's date as YYYY-MM-DD in local time */
export function getTodayDateString(): string {
  return getLocalDateString(new Date());
}

/** Convert a Date or ISO string to YYYY-MM-DD in local time */
export function getLocalDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Get yesterday's date as YYYY-MM-DD */
function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

// ── Session Queries ───────────────────────────────────────────

/** Filter sessions for a specific skill */
export function getSkillSessions(
  skillId: string,
  sessions: FocusSession[],
): FocusSession[] {
  return sessions.filter((s) => s.skillId === skillId);
}

/** Get total seconds invested in a skill */
export function getSkillTotalSeconds(
  skillId: string,
  sessions: FocusSession[],
): number {
  return sessions
    .filter((s) => s.skillId === skillId && s.status === 'completed')
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

/** Get total seconds across all completed sessions */
export function getTotalSeconds(sessions: FocusSession[]): number {
  return sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

/** Get sessions completed today */
export function getTodaySessions(sessions: FocusSession[]): FocusSession[] {
  const today = getTodayDateString();
  return sessions.filter(
    (s) => s.status === 'completed' && getLocalDateString(s.startedAt) === today,
  );
}

/** Get total seconds practiced today */
export function getTodayTotalSeconds(sessions: FocusSession[]): number {
  return getTodaySessions(sessions).reduce(
    (acc, s) => acc + s.durationSeconds,
    0,
  );
}

// ── XP & Level Progression Engine ─────────────────────────────

/**
 * Calculate detailed XP breakdown for a focus session.
 * - 1 minute of completed practice = 1 base XP.
 * - Adds completion bonus for completed sessions based on duration tier.
 * - Cancelled sessions earn 0 bonus XP.
 */
export function getSessionXPBreakdown(
  durationSeconds: number,
  status: 'completed' | 'cancelled' = 'completed',
): {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
} {
  if (durationSeconds <= 0) {
    return { baseXP: 0, bonusXP: 0, totalXP: 0 };
  }

  const minutes = Math.floor(durationSeconds / 60);
  const baseXP = minutes;

  if (status === 'cancelled') {
    return { baseXP, bonusXP: 0, totalXP: baseXP };
  }

  let bonusXP = 0;
  for (const tier of SESSION_COMPLETION_BONUS_TIERS) {
    if (minutes >= tier.minMinutes) {
      bonusXP = tier.bonusXP;
      break;
    }
  }

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
  };
}

/** Calculate total XP awarded for a session */
export function calculateSessionXP(
  durationSeconds: number,
  status: 'completed' | 'cancelled' = 'completed',
): number {
  return getSessionXPBreakdown(durationSeconds, status).totalXP;
}

/** Calculate cumulative XP threshold required to reach a specific level */
export function calculateLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  if (level <= 15) return LEVEL_XP_THRESHOLDS[level];

  // For Level > 15: smooth gradual progression curve
  let xp = LEVEL_XP_THRESHOLDS[15];
  for (let l = 16; l <= level; l++) {
    const step = 400 + (l - 15) * 50;
    xp += step;
  }
  return xp;
}

/** Calculate comprehensive level info from cumulative total XP */
export function calculateLevelInfo(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, Math.floor(totalXP));
  let level = 1;

  while (calculateLevelThreshold(level + 1) <= safeXP) {
    level++;
  }

  const currentLevelXP = calculateLevelThreshold(level);
  const nextLevelXP = calculateLevelThreshold(level + 1);
  const xpInCurrentLevel = safeXP - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  const xpToNextLevel = Math.max(0, nextLevelXP - safeXP);
  const progressPercentage = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100),
  );

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    xpToNextLevel,
    progressPercentage,
  };
}

/** Get total XP earned across all completed sessions */
export function getGlobalTotalXP(sessions: FocusSession[]): number {
  return sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + calculateSessionXP(s.durationSeconds, s.status), 0);
}

/** Get total XP earned for a specific skill */
export function getSkillTotalXP(
  skillId: string,
  sessions: FocusSession[],
): number {
  return sessions
    .filter((s) => s.skillId === skillId && s.status === 'completed')
    .reduce((acc, s) => acc + calculateSessionXP(s.durationSeconds, s.status), 0);
}

// ── Skill Progress ────────────────────────────────────────────

/** Calculate complete progress data for a single skill */
export function getSkillProgress(
  skill: Skill,
  sessions: FocusSession[],
  milestones: MilestoneRecord[],
): SkillProgress {
  const totalSeconds = getSkillTotalSeconds(skill.id, sessions);
  const totalHours = secondsToHours(totalSeconds);
  const percentage = Math.min(
    skill.targetHours > 0 ? (totalSeconds / (skill.targetHours * 3600)) * 100 : 0,
    100,
  );

  const skillMilestones = milestones.filter((m) => m.skillId === skill.id);
  const unlockedMilestones = skillMilestones.map((m) => m.percentage).sort((a, b) => a - b);

  // Current milestone = highest unlocked, or 0
  const currentMilestone =
    unlockedMilestones.length > 0
      ? unlockedMilestones[unlockedMilestones.length - 1]
      : 0;

  // Next milestone = lowest threshold not yet unlocked
  const nextMilestone =
    MILESTONE_PERCENTAGES.find((p) => !unlockedMilestones.includes(p)) ?? null;

  const skillXP = getSkillTotalXP(skill.id, sessions);
  const skillLevel = calculateLevelInfo(skillXP);

  return {
    skill,
    totalSeconds,
    totalHours,
    percentage,
    currentMilestone,
    nextMilestone,
    unlockedMilestones,
    skillXP,
    skillLevel,
  };
}

/** Calculate progress for all skills */
export function getAllSkillProgress(
  skills: Skill[],
  sessions: FocusSession[],
  milestones: MilestoneRecord[],
): SkillProgress[] {
  return skills.map((skill) => getSkillProgress(skill, sessions, milestones));
}

// ── Streak Calculation ────────────────────────────────────────

/**
 * Calculate practice streak from sessions.
 *
 * Rules:
 * - A day "counts" if the user completed at least one session that day.
 * - The streak counts consecutive calendar days backwards from the most recent practice day.
 * - If the last practice was today or yesterday, the streak is still active.
 * - If the last practice was 2+ days ago, the streak is 0.
 */
export function calculateStreak(sessions: FocusSession[]): StreakData {
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  if (completedSessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      todayCompleted: false,
    };
  }

  // Build set of unique practice dates
  const practiceDates = new Set<string>();
  for (const session of completedSessions) {
    practiceDates.add(getLocalDateString(session.startedAt));
  }

  const sortedDates = Array.from(practiceDates).sort();
  const lastPracticeDate = sortedDates[sortedDates.length - 1];
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const todayCompleted = practiceDates.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;

  if (lastPracticeDate === todayStr || lastPracticeDate === yesterdayStr) {
    // Traverse backwards from the last practice date
    const startDate = new Date(lastPracticeDate + 'T12:00:00'); // noon to avoid DST issues
    const checkDate = new Date(startDate);

    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (practiceDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr + 'T12:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24),
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = currentDate;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastPracticeDate,
    todayCompleted,
  };
}

// ── Misc Helpers ──────────────────────────────────────────────

/** Format a relative time label: "Just now", "5m ago", "2h ago", "3d ago" */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  const days = Math.floor(diffSeconds / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
