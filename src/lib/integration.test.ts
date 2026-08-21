import { describe, it, expect, beforeEach } from 'vitest';
import {
  signUp,
  getCurrentUser,
  createSkill,
  getSkills,
  createSession,
  getSessions,
  checkAndCreateMilestones,
  getMilestones,
  saveTimerState,
  getTimerState,
} from './database';
import { STORAGE_KEYS } from './constants';
import {
  getSkillProgress,
  calculateStreak,
  formatPercentage,
} from '../utils/calculations';
import type { TimerState } from '../types';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new LocalStorageMock() as unknown as Storage;
}

beforeEach(() => {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
});

describe('Full Mastery V0.1 User Journey', () => {
  it('executes the full mastery loop: Sign Up -> Create Skill -> Practice -> Milestones -> Streak -> Refresh', () => {
    // 1. SIGN UP
    const user = signUp('mastery_user@example.com', 'supersecret123');
    expect(user.id).toBeTruthy();
    expect(user.email).toBe('mastery_user@example.com');
    expect(getCurrentUser()?.id).toBe(user.id);

    // 2. CREATE SKILL & SET TARGET
    const skill = createSkill(user.id, {
      name: 'German Fluency',
      description: 'Daily speaking practice and active vocabulary recall',
      icon: '🇩🇪',
      color: '#fbbf24',
      targetHours: 100,
    });
    expect(skill.id).toBeTruthy();
    expect(skill.targetHours).toBe(100);

    let activeSkills = getSkills(user.id);
    expect(activeSkills).toHaveLength(1);
    expect(activeSkills[0].name).toBe('German Fluency');

    // Initial progress: 0%
    let initialProgress = getSkillProgress(skill, [], []);
    expect(initialProgress.totalHours).toBe(0);
    expect(initialProgress.percentage).toBe(0);
    expect(initialProgress.nextMilestone).toBe(10);
    expect(initialProgress.currentMilestone).toBe(0);

    // 3. START SESSION
    const startTime = Date.now() - 3600000 * 10; // 10 hours ago
    const timerState: TimerState = {
      skillId: skill.id,
      startedAt: startTime,
      pausedAt: null,
      totalPausedMs: 0,
      status: 'running',
    };
    saveTimerState(timerState);

    // Verify timer persisted
    const savedTimer = getTimerState();
    expect(savedTimer?.skillId).toBe(skill.id);
    expect(savedTimer?.status).toBe('running');

    // 4. PAUSE / RESUME
    const pauseTime = startTime + 3600000 * 5;
    const pausedTimer: TimerState = {
      ...timerState,
      status: 'paused',
      pausedAt: pauseTime,
    };
    saveTimerState(pausedTimer);
    expect(getTimerState()?.status).toBe('paused');

    // Resume after 30 min pause
    const resumedTimer: TimerState = {
      ...pausedTimer,
      status: 'running',
      totalPausedMs: 1800000,
      pausedAt: null,
    };
    saveTimerState(resumedTimer);

    // 5. COMPLETE SESSION (10 hours practice time = 36000 seconds)
    const sessionDurationSeconds = 36000; // 10 hours
    const endTime = startTime + sessionDurationSeconds * 1000 + resumedTimer.totalPausedMs;
    const completedSession = createSession(
      user.id,
      skill.id,
      startTime,
      endTime,
      sessionDurationSeconds,
    );
    saveTimerState(null); // Clear timer
    expect(getTimerState()).toBeNull();
    expect(completedSession.durationSeconds).toBe(36000);

    // 6. TIME SAVED & VERIFIED
    const storedSessions = getSessions(user.id);
    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0].id).toBe(completedSession.id);

    // 7. PROGRESS UPDATED
    const exactHours = storedSessions[0].durationSeconds / 3600;
    expect(exactHours).toBe(10);

    // 8. MILESTONES DETECTED & SAVED (10h out of 100h = 10%)
    const newMilestones = checkAndCreateMilestones(
      user.id,
      skill.id,
      exactHours,
      skill.targetHours,
    );
    expect(newMilestones).toHaveLength(1);
    expect(newMilestones[0].percentage).toBe(10);

    const userMilestones = getMilestones(user.id);
    expect(userMilestones).toHaveLength(1);
    expect(userMilestones[0].percentage).toBe(10);

    // Check updated skill progress model
    const updatedProgress = getSkillProgress(skill, storedSessions, userMilestones);
    expect(updatedProgress.totalSeconds).toBe(36000);
    expect(updatedProgress.totalHours).toBe(10);
    expect(updatedProgress.percentage).toBe(10);
    expect(formatPercentage(updatedProgress.percentage)).toBe('10%');
    expect(updatedProgress.currentMilestone).toBe(10);
    expect(updatedProgress.nextMilestone).toBe(25);

    // 9. STREAK UPDATED
    const streak = calculateStreak(storedSessions);
    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(1);
    expect(streak.todayCompleted).toBe(true);

    // 10. SIMULATE BROWSER REFRESH — All data remains canonical
    const refreshedSkills = getSkills(user.id);
    const refreshedSessions = getSessions(user.id);
    const refreshedMilestones = getMilestones(user.id);

    expect(refreshedSkills).toHaveLength(1);
    expect(refreshedSessions).toHaveLength(1);
    expect(refreshedMilestones).toHaveLength(1);

    const refreshedProgress = getSkillProgress(
      refreshedSkills[0],
      refreshedSessions,
      refreshedMilestones,
    );
    expect(refreshedProgress.totalHours).toBe(10);
    expect(refreshedProgress.currentMilestone).toBe(10);
    expect(refreshedProgress.nextMilestone).toBe(25);

    // 11. SUBSEQUENT SESSION PUSHES TO 25% MILESTONE
    createSession(
      user.id,
      skill.id,
      Date.now() - 3600000 * 15,
      Date.now(),
      15 * 3600, // 15 hours
    );

    const allSessions = getSessions(user.id);
    const totalSecs = allSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalHrs = totalSecs / 3600; // 25 hours total

    const secondMilestoneBatch = checkAndCreateMilestones(
      user.id,
      skill.id,
      totalHrs,
      skill.targetHours,
    );
    expect(secondMilestoneBatch).toHaveLength(1);
    expect(secondMilestoneBatch[0].percentage).toBe(25);

    const finalMilestones = getMilestones(user.id);
    expect(finalMilestones).toHaveLength(2); // 10% and 25%

    const finalProgress = getSkillProgress(skill, allSessions, finalMilestones);
    expect(finalProgress.totalHours).toBe(25);
    expect(finalProgress.percentage).toBe(25);
    expect(finalProgress.currentMilestone).toBe(25);
    expect(finalProgress.nextMilestone).toBe(50);
  });
});
