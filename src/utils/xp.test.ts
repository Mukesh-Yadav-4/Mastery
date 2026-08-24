import { describe, it, expect } from 'vitest';
import {
  calculateSessionXP,
  getSessionXPBreakdown,
  calculateLevelThreshold,
  calculateLevelInfo,
  getGlobalTotalXP,
  getSkillTotalXP,
} from './calculations';
import type { FocusSession } from '../types';

describe('XP & Level Progression Engine', () => {
  // ── Session XP Rules ────────────────────────────────────────

  describe('calculateSessionXP and getSessionXPBreakdown', () => {
    it('awards 1 base XP per minute of completed practice', () => {
      expect(calculateSessionXP(60)).toBe(1); // 1 min
      expect(calculateSessionXP(300)).toBe(5); // 5 min
      expect(calculateSessionXP(599)).toBe(9); // 9 min (under 10 min -> 0 bonus)
    });

    it('applies exact completion bonus thresholds for completed sessions', () => {
      // 10-14 min -> +0 bonus
      expect(getSessionXPBreakdown(10 * 60)).toEqual({
        baseXP: 10,
        bonusXP: 0,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 10,
      });
      expect(getSessionXPBreakdown(14 * 60)).toEqual({
        baseXP: 14,
        bonusXP: 0,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 14,
      });

      // 15-29 min -> +2 bonus
      expect(getSessionXPBreakdown(15 * 60)).toEqual({
        baseXP: 15,
        bonusXP: 2,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 17,
      });
      expect(getSessionXPBreakdown(25 * 60)).toEqual({
        baseXP: 25,
        bonusXP: 2,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 27,
      });

      // 30-44 min -> +4 bonus
      expect(getSessionXPBreakdown(30 * 60)).toEqual({
        baseXP: 30,
        bonusXP: 4,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 34,
      });
      expect(getSessionXPBreakdown(40 * 60)).toEqual({
        baseXP: 40,
        bonusXP: 4,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 44,
      });

      // 45-59 min -> +6 bonus (45m -> 51 XP)
      expect(getSessionXPBreakdown(45 * 60)).toEqual({
        baseXP: 45,
        bonusXP: 6,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 51,
      });
      expect(calculateSessionXP(45 * 60)).toBe(51);

      // 60-89 min -> +8 bonus (60m -> 68 XP)
      expect(getSessionXPBreakdown(60 * 60)).toEqual({
        baseXP: 60,
        bonusXP: 8,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 68,
      });
      expect(calculateSessionXP(60 * 60)).toBe(68);

      // 90-119 min -> +12 bonus (90m -> 102 XP)
      expect(getSessionXPBreakdown(90 * 60)).toEqual({
        baseXP: 90,
        bonusXP: 12,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 102,
      });
      expect(calculateSessionXP(90 * 60)).toBe(102);

      // 120+ min -> +15 bonus (120m -> 135 XP)
      expect(getSessionXPBreakdown(120 * 60)).toEqual({
        baseXP: 120,
        bonusXP: 15,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 135,
      });
      expect(calculateSessionXP(120 * 60)).toBe(135);
    });

    it('awards deliberate intention and reflection bonuses', () => {
      // 25m Pomodoro with intention (+5) and reflection (+5)
      const res = getSessionXPBreakdown(25 * 60, 'completed', {
        hasIntention: true,
        hasReflection: true,
      });
      expect(res).toEqual({
        baseXP: 25,
        bonusXP: 2,
        intentionBonus: 5,
        reflectionBonus: 5,
        streakBonus: 0,
        totalXP: 37,
      });
    });

    it('applies daily streak momentum bonuses', () => {
      // 7-day streak (+10% on 30m session = +3 XP)
      const res = getSessionXPBreakdown(30 * 60, 'completed', {
        streakDays: 7,
      });
      expect(res.streakBonus).toBe(3);
      expect(res.totalXP).toBe(30 + 4 + 3); // 37 XP
    });



    it('does NOT award completion bonus for cancelled or abandoned sessions', () => {
      expect(getSessionXPBreakdown(60 * 60, 'cancelled')).toEqual({
        baseXP: 60,
        bonusXP: 0,
        intentionBonus: 0,
        reflectionBonus: 0,
        streakBonus: 0,
        totalXP: 60,
      });
      expect(calculateSessionXP(45 * 60, 'cancelled')).toBe(45);
      expect(calculateSessionXP(120 * 60, 'cancelled')).toBe(120);
    });

    it('is completely deterministic (same input produces exact same XP)', () => {
      const duration = 54 * 60;
      const xp1 = calculateSessionXP(duration);
      const xp2 = calculateSessionXP(duration);
      expect(xp1).toBe(xp2);
      expect(xp1).toBe(54 + 6); // 60 XP
    });

    it('handles zero or negative duration gracefully', () => {
      expect(calculateSessionXP(0)).toBe(0);
      expect(calculateSessionXP(-100)).toBe(0);
    });
  });

  // ── Level Thresholds ────────────────────────────────────────

  describe('calculateLevelThreshold', () => {
    it('matches exact spec thresholds for Levels 1–15', () => {
      expect(calculateLevelThreshold(1)).toBe(0);
      expect(calculateLevelThreshold(2)).toBe(30);
      expect(calculateLevelThreshold(3)).toBe(75);
      expect(calculateLevelThreshold(4)).toBe(150);
      expect(calculateLevelThreshold(5)).toBe(250);
      expect(calculateLevelThreshold(6)).toBe(375);
      expect(calculateLevelThreshold(7)).toBe(525);
      expect(calculateLevelThreshold(8)).toBe(700);
      expect(calculateLevelThreshold(9)).toBe(900);
      expect(calculateLevelThreshold(10)).toBe(1150);
      expect(calculateLevelThreshold(11)).toBe(1350);
      expect(calculateLevelThreshold(12)).toBe(1575);
      expect(calculateLevelThreshold(13)).toBe(1825);
      expect(calculateLevelThreshold(14)).toBe(2100);
      expect(calculateLevelThreshold(15)).toBe(2500);
    });

    it('calculates smooth scaling progression for Level 16 and beyond', () => {
      expect(calculateLevelThreshold(16)).toBe(2950); // 2500 + 450
      expect(calculateLevelThreshold(17)).toBe(3450); // 2950 + 500
      expect(calculateLevelThreshold(18)).toBe(4000); // 3450 + 550
      expect(calculateLevelThreshold(20)).toBe(5250);
    });
  });

  // ── Level Info Calculation ──────────────────────────────────

  describe('calculateLevelInfo', () => {
    it('evaluates Level 1 correctly at 0 XP', () => {
      const info = calculateLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.currentLevelXP).toBe(0);
      expect(info.nextLevelXP).toBe(30);
      expect(info.xpInCurrentLevel).toBe(0);
      expect(info.xpToNextLevel).toBe(30);
      expect(info.progressPercentage).toBe(0);
    });

    it('evaluates XP immediately before a threshold', () => {
      // 29 XP -> Level 1 (1 XP to Level 2)
      const infoL1 = calculateLevelInfo(29);
      expect(infoL1.level).toBe(1);
      expect(infoL1.xpInCurrentLevel).toBe(29);
      expect(infoL1.xpToNextLevel).toBe(1);
      expect(infoL1.progressPercentage).toBeCloseTo((29 / 30) * 100, 1);

      // 74 XP -> Level 2 (1 XP to Level 3)
      const infoL2 = calculateLevelInfo(74);
      expect(infoL2.level).toBe(2);
      expect(infoL2.xpInCurrentLevel).toBe(44); // 74 - 30
      expect(infoL2.xpToNextLevel).toBe(1); // 75 - 74

      // 249 XP -> Level 4 (1 XP to Level 5)
      const infoL4 = calculateLevelInfo(249);
      expect(infoL4.level).toBe(4);
      expect(infoL4.xpInCurrentLevel).toBe(99); // 249 - 150
      expect(infoL4.xpToNextLevel).toBe(1);
    });

    it('evaluates exact thresholds accurately', () => {
      // 30 XP -> exactly Level 2 (0% into Level 2)
      const infoL2 = calculateLevelInfo(30);
      expect(infoL2.level).toBe(2);
      expect(infoL2.currentLevelXP).toBe(30);
      expect(infoL2.nextLevelXP).toBe(75);
      expect(infoL2.xpInCurrentLevel).toBe(0);
      expect(infoL2.xpToNextLevel).toBe(45);
      expect(infoL2.progressPercentage).toBe(0);

      // 250 XP -> exactly Level 5
      const infoL5 = calculateLevelInfo(250);
      expect(infoL5.level).toBe(5);
      expect(infoL5.currentLevelXP).toBe(250);
      expect(infoL5.nextLevelXP).toBe(375);
      expect(infoL5.xpInCurrentLevel).toBe(0);
      expect(infoL5.xpToNextLevel).toBe(125);
      expect(infoL5.progressPercentage).toBe(0);
    });

    it('evaluates XP immediately after a threshold', () => {
      // 31 XP -> Level 2
      const info = calculateLevelInfo(31);
      expect(info.level).toBe(2);
      expect(info.xpInCurrentLevel).toBe(1);
      expect(info.xpToNextLevel).toBe(44);
      expect(info.progressPercentage).toBeCloseTo((1 / 45) * 100, 1);
    });

    it('evaluates high level progression beyond Level 15', () => {
      const info = calculateLevelInfo(3000);
      expect(info.level).toBe(16); // 2950 <= 3000 < 3450
      expect(info.currentLevelXP).toBe(2950);
      expect(info.nextLevelXP).toBe(3450);
      expect(info.xpInCurrentLevel).toBe(50);
      expect(info.xpToNextLevel).toBe(450);
    });
  });

  // ── Global and Skill Total XP Aggregations ───────────────────

  describe('XP Aggregations across Sessions', () => {
    const mockSessions: FocusSession[] = [
      {
        id: 's1',
        userId: 'u1',
        skillId: 'german',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: 45 * 60, // 51 XP
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's2',
        userId: 'u1',
        skillId: 'german',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: 60 * 60, // 68 XP
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's3',
        userId: 'u1',
        skillId: 'python',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: 30 * 60, // 34 XP
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's4',
        userId: 'u1',
        skillId: 'german',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: 15 * 60,
        status: 'cancelled', // cancelled -> 0 XP in completed queries
        createdAt: new Date().toISOString(),
      },
    ];

    it('computes skill total XP correctly', () => {
      expect(getSkillTotalXP('german', mockSessions)).toBe(51 + 68); // 119 XP
      expect(getSkillTotalXP('python', mockSessions)).toBe(34);
      expect(getSkillTotalXP('guitar', mockSessions)).toBe(0);
    });

    it('computes global total XP correctly', () => {
      expect(getGlobalTotalXP(mockSessions)).toBe(51 + 68 + 34); // 153 XP
    });
  });
});
