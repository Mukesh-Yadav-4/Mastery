import { describe, it, expect } from 'vitest';
import {
  getSessionsInTimeframe,
  getTimeframeChartData,
  getTimeframeSummary,
  getSkillTimeDistribution,
  getFlowRatingDistribution,
  getTShapedMasteryBreakdown,
} from './analytics';
import type { FocusSession, Skill, SkillProgress } from '../types';

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    userId: 'user-1',
    name: 'TypeScript & React Architecture',
    description: 'Deep mastery of frontend systems',
    icon: '⚡',
    color: '#818cf8',
    targetHours: 100,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'skill-2',
    userId: 'user-1',
    name: 'Algorithms & Data Structures',
    description: 'Problem solving',
    icon: '🧠',
    color: '#34d399',
    targetHours: 50,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const refDate = new Date('2026-08-25T14:30:00Z');

const mockSessions: FocusSession[] = [
  // Today session
  {
    id: 's-1',
    userId: 'user-1',
    skillId: 'skill-1',
    startedAt: '2026-08-25T10:00:00Z',
    endedAt: '2026-08-25T11:00:00Z',
    durationSeconds: 3600,
    status: 'completed',
    intention: 'Build clean analytics module',
    reflection: {
      qualityRating: 5,
      notes: 'Effortless Flow • Technical Breakthrough',
    },
    createdAt: '2026-08-25T11:00:00Z',
  },
  // Yesterday session (same week & month & year)
  {
    id: 's-2',
    userId: 'user-1',
    skillId: 'skill-2',
    startedAt: '2026-08-24T15:00:00Z',
    endedAt: '2026-08-24T16:30:00Z',
    durationSeconds: 5400,
    status: 'completed',
    intention: 'Graph algorithms review',
    reflection: {
      qualityRating: 4,
      notes: 'Solid practice • Overcame Friction',
    },
    createdAt: '2026-08-24T16:30:00Z',
  },
  // Earlier in current month
  {
    id: 's-3',
    userId: 'user-1',
    skillId: 'skill-1',
    startedAt: '2026-08-10T09:00:00Z',
    endedAt: '2026-08-10T10:00:00Z',
    durationSeconds: 3600,
    status: 'completed',
    createdAt: '2026-08-10T10:00:00Z',
  },
  // Earlier in current year (May 2026)
  {
    id: 's-4',
    userId: 'user-1',
    skillId: 'skill-2',
    startedAt: '2026-05-15T09:00:00Z',
    endedAt: '2026-05-15T11:00:00Z',
    durationSeconds: 7200,
    status: 'completed',
    createdAt: '2026-05-15T11:00:00Z',
  },
  // Previous year (should not match 2026 year view)
  {
    id: 's-5',
    userId: 'user-1',
    skillId: 'skill-1',
    startedAt: '2025-11-20T09:00:00Z',
    endedAt: '2025-11-20T10:00:00Z',
    durationSeconds: 3600,
    status: 'completed',
    createdAt: '2025-11-20T10:00:00Z',
  },
];

describe('Analytics Utility Functions', () => {
  describe('getSessionsInTimeframe', () => {
    it('filters sessions correctly for day timeframe', () => {
      const daySessions = getSessionsInTimeframe(mockSessions, 'day', refDate);
      expect(daySessions.length).toBe(1);
      expect(daySessions[0].id).toBe('s-1');
    });

    it('filters sessions correctly for week timeframe', () => {
      const weekSessions = getSessionsInTimeframe(mockSessions, 'week', refDate);
      expect(weekSessions.map((s) => s.id).sort()).toEqual(['s-1', 's-2']);
    });

    it('filters sessions correctly for month timeframe', () => {
      const monthSessions = getSessionsInTimeframe(mockSessions, 'month', refDate);
      expect(monthSessions.map((s) => s.id).sort()).toEqual(['s-1', 's-2', 's-3']);
    });

    it('filters sessions correctly for year timeframe', () => {
      const yearSessions = getSessionsInTimeframe(mockSessions, 'year', refDate);
      expect(yearSessions.map((s) => s.id).sort()).toEqual(['s-1', 's-2', 's-3', 's-4']);
    });

    it('returns empty array when no completed sessions exist', () => {
      const empty = getSessionsInTimeframe([], 'week', refDate);
      expect(empty).toEqual([]);
    });
  });

  describe('getTimeframeChartData', () => {
    it('generates 12 blocks for day view', () => {
      const chart = getTimeframeChartData(mockSessions, mockSkills, 'day', refDate);
      expect(chart.length).toBe(12);
      const totalSecs = chart.reduce((acc, b) => acc + b.totalSeconds, 0);
      expect(totalSecs).toBe(3600);
    });

    it('generates 7 days for week view with correct labels', () => {
      const chart = getTimeframeChartData(mockSessions, mockSkills, 'week', refDate);
      expect(chart.length).toBe(7);
      expect(chart.map((b) => b.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('generates 12 months for year view with correct labels', () => {
      const chart = getTimeframeChartData(mockSessions, mockSkills, 'year', refDate);
      expect(chart.length).toBe(12);
      expect(chart[0].label).toBe('Jan');
      expect(chart[11].label).toBe('Dec');
      const totalHours = chart.reduce((acc, b) => acc + b.totalHours, 0);
      expect(totalHours).toBeCloseTo(5.5, 1);
    });
  });

  describe('getTimeframeSummary', () => {
    it('calculates summary statistics correctly for week timeframe', () => {
      const summary = getTimeframeSummary(mockSessions, mockSkills, 'week', refDate);
      expect(summary.totalSeconds).toBe(9000);
      expect(summary.totalHours).toBe(2.5);
      expect(summary.sessionCount).toBe(2);
      expect(summary.deliberatePracticeRate).toBe(100);
      expect(summary.reflectionRate).toBe(100);
      expect(summary.avgFlowRating).toBe(4.5);
      expect(summary.topSkill?.name).toBe('Algorithms & Data Structures');
    });

    it('handles empty sessions gracefully without division by zero', () => {
      const summary = getTimeframeSummary([], mockSkills, 'month', refDate);
      expect(summary.totalSeconds).toBe(0);
      expect(summary.totalHours).toBe(0);
      expect(summary.sessionCount).toBe(0);
      expect(summary.topSkill).toBeNull();
      expect(summary.avgFlowRating).toBe(0);
    });
  });

  describe('getSkillTimeDistribution', () => {
    it('computes skill distribution percentages correctly', () => {
      const dist = getSkillTimeDistribution(mockSessions, mockSkills, 'week', refDate);
      expect(dist.length).toBe(2);
      const totalPct = dist.reduce((acc, d) => acc + d.percentage, 0);
      expect(totalPct).toBe(100);
    });
  });

  describe('getFlowRatingDistribution', () => {
    it('returns distribution across 5 star buckets', () => {
      const flow = getFlowRatingDistribution(mockSessions, 'month', refDate);
      expect(flow.length).toBe(5);
      expect(flow[0].stars).toBe(5); // 5 stars
      expect(flow[0].count).toBe(1);
      expect(flow[1].stars).toBe(4); // 4 stars
      expect(flow[1].count).toBe(1);
    });
  });

  describe('getTShapedMasteryBreakdown', () => {
    it('classifies highest target hour skill as core domain', () => {
      const mockProgress: SkillProgress[] = [
        {
          skill: mockSkills[0], // 100h target
          totalSeconds: 36000,
          totalHours: 10,
          percentage: 10,
          currentMilestone: 10,
          nextMilestone: 25,
          unlockedMilestones: [10],
          skillXP: 600,
          skillLevel: {
            level: 3,
            currentLevelXP: 450,
            nextLevelXP: 900,
            xpInCurrentLevel: 150,
            xpRequiredForNextLevel: 450,
            xpToNextLevel: 300,
            progressPercentage: 33,
          },
        },
        {
          skill: mockSkills[1], // 50h target
          totalSeconds: 18000,
          totalHours: 5,
          percentage: 10,
          currentMilestone: 10,
          nextMilestone: 25,
          unlockedMilestones: [10],
          skillXP: 300,
          skillLevel: {
            level: 2,
            currentLevelXP: 150,
            nextLevelXP: 450,
            xpInCurrentLevel: 150,
            xpRequiredForNextLevel: 300,
            xpToNextLevel: 150,
            progressPercentage: 50,
          },
        },
      ];

      const tShaped = getTShapedMasteryBreakdown(mockProgress);
      expect(tShaped.coreSkill?.skill.name).toBe('TypeScript & React Architecture');
      expect(tShaped.coreHours).toBe(10);
      expect(tShaped.auxiliaryHours).toBe(5);
      expect(tShaped.corePercentage).toBe(67);
      expect(tShaped.auxiliaryPercentage).toBe(33);
    });
  });
});
