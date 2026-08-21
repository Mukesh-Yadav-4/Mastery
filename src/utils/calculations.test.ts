import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatHoursMinutes,
  formatTimerDisplay,
  formatPercentage,
  secondsToHours,
  getTodayDateString,
  getLocalDateString,
  getSkillTotalSeconds,
  getSkillProgress,
  calculateStreak,
  formatRelativeTime,
} from '../utils/calculations';
import type { FocusSession } from '../types';

// ── formatDuration ────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats minutes only', () => {
    expect(formatDuration(300)).toBe('5m');
    expect(formatDuration(59 * 60 + 30)).toBe('59m');
  });

  it('formats hours only', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(7200)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3660)).toBe('1h 1m');
    expect(formatDuration(5400)).toBe('1h 30m');
  });

  it('handles negative input', () => {
    expect(formatDuration(-100)).toBe('0m');
  });
});

// ── formatHoursMinutes ────────────────────────────────────────

describe('formatHoursMinutes', () => {
  it('formats zero', () => {
    expect(formatHoursMinutes(0)).toBe('0m');
  });

  it('includes 0m for round hours', () => {
    expect(formatHoursMinutes(3600)).toBe('1h 0m');
  });
});

// ── formatTimerDisplay ────────────────────────────────────────

describe('formatTimerDisplay', () => {
  it('formats under an hour', () => {
    expect(formatTimerDisplay(0)).toBe('00:00');
    expect(formatTimerDisplay(65)).toBe('01:05');
    expect(formatTimerDisplay(3599)).toBe('59:59');
  });

  it('formats over an hour', () => {
    expect(formatTimerDisplay(3600)).toBe('01:00:00');
    expect(formatTimerDisplay(3661)).toBe('01:01:01');
    expect(formatTimerDisplay(36000)).toBe('10:00:00');
  });

  it('handles negative', () => {
    expect(formatTimerDisplay(-10)).toBe('00:00');
  });
});

// ── secondsToHours ────────────────────────────────────────────

describe('secondsToHours', () => {
  it('converts correctly', () => {
    expect(secondsToHours(0)).toBe(0);
    expect(secondsToHours(3600)).toBe(1);
    expect(secondsToHours(5400)).toBe(1.5);
  });

  it('rounds to 1 decimal', () => {
    expect(secondsToHours(1234)).toBe(0.3);
    expect(secondsToHours(12345)).toBe(3.4);
  });
});

// ── Date helpers ──────────────────────────────────────────────

describe('getTodayDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('getLocalDateString', () => {
  it('converts Date object', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(getLocalDateString(date)).toBe('2024-01-15');
  });

  it('converts ISO string', () => {
    // Use a date that is unambiguous in any timezone
    const result = getLocalDateString('2024-06-15T12:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── getSkillTotalSeconds ──────────────────────────────────────

describe('getSkillTotalSeconds', () => {
  const sessions: FocusSession[] = [
    makeFocusSession('s1', 'skill-a', 3600),
    makeFocusSession('s2', 'skill-a', 1800),
    makeFocusSession('s3', 'skill-b', 900),
  ];

  it('sums only matching skill', () => {
    expect(getSkillTotalSeconds('skill-a', sessions)).toBe(5400);
    expect(getSkillTotalSeconds('skill-b', sessions)).toBe(900);
  });

  it('returns 0 for unknown skill', () => {
    expect(getSkillTotalSeconds('skill-c', sessions)).toBe(0);
  });

  it('returns 0 for empty sessions', () => {
    expect(getSkillTotalSeconds('skill-a', [])).toBe(0);
  });
});

// ── calculateStreak ───────────────────────────────────────────

describe('calculateStreak', () => {
  it('returns 0 for no sessions', () => {
    const streak = calculateStreak([]);
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
    expect(streak.todayCompleted).toBe(false);
  });

  it('returns 1 for a single session today', () => {
    const today = new Date();
    const sessions = [makeFocusSessionOnDate('s1', 'skill-a', 3600, today)];
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(1);
    expect(streak.todayCompleted).toBe(true);
  });

  it('counts consecutive days', () => {
    const sessions = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      sessions.push(makeFocusSessionOnDate(`s${i}`, 'skill-a', 3600, date));
    }
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(5);
    expect(streak.longestStreak).toBe(5);
  });

  it('breaks on gaps', () => {
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const sessions = [
      makeFocusSessionOnDate('s1', 'skill-a', 3600, today),
      makeFocusSessionOnDate('s2', 'skill-a', 3600, threeDaysAgo),
    ];
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(1);
  });

  it('preserves streak if last practice was yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const sessions = [
      makeFocusSessionOnDate('s1', 'skill-a', 3600, yesterday),
      makeFocusSessionOnDate('s2', 'skill-a', 3600, twoDaysAgo),
    ];
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(2);
    expect(streak.todayCompleted).toBe(false);
  });

  it('handles multiple sessions per day', () => {
    const today = new Date();
    const sessions = [
      makeFocusSessionOnDate('s1', 'skill-a', 1800, today),
      makeFocusSessionOnDate('s2', 'skill-b', 1800, today),
    ];
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(1);
  });

  it('streak is 0 if last practice was 2+ days ago', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const sessions = [
      makeFocusSessionOnDate('s1', 'skill-a', 3600, threeDaysAgo),
    ];
    const streak = calculateStreak(sessions);
    expect(streak.currentStreak).toBe(0);
  });
});

// ── formatRelativeTime ────────────────────────────────────────

describe('formatRelativeTime', () => {
  it('says "Just now" for recent times', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('Just now');
  });

  it('says minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('says hours ago', () => {
    const threeHoursAgo = new Date(
      Date.now() - 3 * 60 * 60 * 1000,
    ).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('says Yesterday', () => {
    const yesterday = new Date(
      Date.now() - 25 * 60 * 60 * 1000,
    ).toISOString();
    expect(formatRelativeTime(yesterday)).toBe('Yesterday');
  });
});

// ── formatPercentage ──────────────────────────────────────────

describe('formatPercentage', () => {
  it('formats zero and below', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(-5)).toBe('0%');
  });

  it('formats 100 and above', () => {
    expect(formatPercentage(100)).toBe('100%');
    expect(formatPercentage(120)).toBe('100%');
  });

  it('formats integer percentages', () => {
    expect(formatPercentage(25)).toBe('25%');
    expect(formatPercentage(50)).toBe('50%');
  });

  it('formats decimal percentages up to 2 decimal places', () => {
    expect(formatPercentage(34.45)).toBe('34.45%');
    expect(formatPercentage(34.5)).toBe('34.5%');
    expect(formatPercentage(0.25)).toBe('0.25%');
  });
});

// ── getSkillProgress ──────────────────────────────────────────

describe('getSkillProgress', () => {
  const skill = {
    id: 'skill-1',
    userId: 'user-1',
    name: 'Python',
    description: '',
    icon: '🐍',
    color: '#3b82f6',
    targetHours: 100,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('calculates progress accurately without rounding away time', () => {
    // 34h 27m = 124020 seconds. 124020 / 360000 = 34.45%
    const sessions: FocusSession[] = [
      makeFocusSession('s1', 'skill-1', 124020),
    ];
    const progress = getSkillProgress(skill, sessions, []);
    expect(progress.totalSeconds).toBe(124020);
    expect(progress.percentage).toBeCloseTo(34.45, 2);
    expect(formatPercentage(progress.percentage)).toBe('34.45%');
  });

  it('calculates milestones and next milestone correctly', () => {
    const milestones = [
      { id: 'm1', userId: 'user-1', skillId: 'skill-1', percentage: 10, unlockedAt: '' },
      { id: 'm2', userId: 'user-1', skillId: 'skill-1', percentage: 25, unlockedAt: '' },
    ];
    const sessions = [makeFocusSession('s1', 'skill-1', 3600 * 26)]; // 26 hours = 26%
    const progress = getSkillProgress(skill, sessions, milestones);
    expect(progress.currentMilestone).toBe(25);
    expect(progress.nextMilestone).toBe(50);
  });

  it('returns null for nextMilestone when all are unlocked', () => {
    const milestones = [10, 25, 50, 75, 100].map((pct, idx) => ({
      id: `m${idx}`,
      userId: 'user-1',
      skillId: 'skill-1',
      percentage: pct,
      unlockedAt: '',
    }));
    const sessions = [makeFocusSession('s1', 'skill-1', 3600 * 100)];
    const progress = getSkillProgress(skill, sessions, milestones);
    expect(progress.currentMilestone).toBe(100);
    expect(progress.nextMilestone).toBeNull();
  });
});

// ── Helpers ───────────────────────────────────────────────────

function makeFocusSession(
  id: string,
  skillId: string,
  durationSeconds: number,
): FocusSession {
  return {
    id,
    userId: 'user-1',
    skillId,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
}

function makeFocusSessionOnDate(
  id: string,
  skillId: string,
  durationSeconds: number,
  date: Date,
): FocusSession {
  const start = new Date(date);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + durationSeconds * 1000);

  return {
    id,
    userId: 'user-1',
    skillId,
    startedAt: start.toISOString(),
    endedAt: end.toISOString(),
    durationSeconds,
    status: 'completed',
    createdAt: start.toISOString(),
  };
}
