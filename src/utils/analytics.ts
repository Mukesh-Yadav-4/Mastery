import type { FocusSession, Skill, SkillProgress } from '../types';
import {
  getLocalDateString,
  secondsToHours,
  getSessionXPBreakdown,
} from './calculations';

export type Timeframe = 'day' | 'week' | 'month' | 'year';

export interface ChartBarData {
  id: string;
  label: string;
  subLabel?: string;
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  isCurrent?: boolean;
  skillBreakdown: Array<{
    skillId: string;
    name: string;
    color: string;
    icon: string;
    seconds: number;
    hours: number;
  }>;
}

export interface AnalyticsSummary {
  timeframe: Timeframe;
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  totalXP: number;
  dailyAverageHours: number;
  topSkill: {
    id: string;
    name: string;
    icon: string;
    color: string;
    hours: number;
    percentage: number;
  } | null;
  deliberatePracticeRate: number; // % of sessions with micro-goal intention
  reflectionRate: number; // % of sessions with reflection notes/quality
  avgFlowRating: number; // 1.0 to 5.0
}

export interface SkillTimeDistribution {
  skill: Skill;
  seconds: number;
  hours: number;
  percentage: number;
}

export interface FlowRatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

export interface TShapedMasteryBreakdown {
  coreSkill: SkillProgress | null;
  auxiliarySkills: SkillProgress[];
  coreHours: number;
  auxiliaryHours: number;
  corePercentage: number;
  auxiliaryPercentage: number;
}

/**
 * Filter sessions belonging to the specified timeframe relative to referenceDate
 */
export function getSessionsInTimeframe(
  sessions: FocusSession[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): FocusSession[] {
  const completed = sessions.filter((s) => s.status === 'completed');
  if (completed.length === 0) return [];

  const ref = new Date(referenceDate);

  if (timeframe === 'day') {
    const todayStr = getLocalDateString(ref);
    return completed.filter(
      (s) => getLocalDateString(new Date(s.startedAt)) === todayStr,
    );
  }

  if (timeframe === 'week') {
    // Current Monday to Sunday
    const day = ref.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const monTime = monday.getTime();
    const sunTime = sunday.getTime();

    return completed.filter((s) => {
      const t = new Date(s.startedAt).getTime();
      return t >= monTime && t <= sunTime;
    });
  }

  if (timeframe === 'month') {
    const year = ref.getFullYear();
    const month = ref.getMonth(); // 0-indexed

    return completed.filter((s) => {
      const d = new Date(s.startedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  if (timeframe === 'year') {
    const year = ref.getFullYear();
    return completed.filter((s) => {
      const d = new Date(s.startedAt);
      return d.getFullYear() === year;
    });
  }

  return completed;
}

/**
 * Generate bar chart time-series data for the selected timeframe
 */
export function getTimeframeChartData(
  sessions: FocusSession[],
  skills: Skill[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): ChartBarData[] {
  const timeframeSessions = getSessionsInTimeframe(
    sessions,
    timeframe,
    referenceDate,
  );
  const ref = new Date(referenceDate);
  const skillMap = new Map(skills.map((s) => [s.id, s]));

  const buildSkillBreakdown = (matchedSessions: FocusSession[]) => {
    const bySkill = new Map<string, number>();
    for (const s of matchedSessions) {
      bySkill.set(s.skillId, (bySkill.get(s.skillId) ?? 0) + s.durationSeconds);
    }
    return Array.from(bySkill.entries())
      .map(([skillId, seconds]) => {
        const sk = skillMap.get(skillId);
        return {
          skillId,
          name: sk?.name ?? 'Unknown',
          color: sk?.color ?? '#818cf8',
          icon: sk?.icon ?? '🎯',
          seconds,
          hours: secondsToHours(seconds),
        };
      })
      .sort((a, b) => b.seconds - a.seconds);
  };

  // ── 1. DAY VIEW (12 2-hour blocks) ──────────────────────────
  if (timeframe === 'day') {
    const currentHour = ref.getHours();
    const bars: ChartBarData[] = [];

    for (let block = 0; block < 12; block++) {
      const startHour = block * 2;
      const endHour = startHour + 2;

      const labelHour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
      const ampm = startHour < 12 ? 'a' : 'p';
      const label = `${labelHour}${ampm}`;

      const matched = timeframeSessions.filter((s) => {
        const hour = new Date(s.startedAt).getHours();
        return hour >= startHour && hour < endHour;
      });

      const totalSecs = matched.reduce((acc, s) => acc + s.durationSeconds, 0);
      const isCurrent = currentHour >= startHour && currentHour < endHour;

      bars.push({
        id: `day-block-${block}`,
        label,
        subLabel: `${startHour}:00 - ${endHour}:00`,
        totalSeconds: totalSecs,
        totalHours: Math.round((totalSecs / 3600) * 100) / 100,
        sessionCount: matched.length,
        isCurrent,
        skillBreakdown: buildSkillBreakdown(matched),
      });
    }
    return bars;
  }

  // ── 2. WEEK VIEW (7 Days: Mon → Sun) ────────────────────────
  if (timeframe === 'week') {
    const day = ref.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMon);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = getLocalDateString(ref);
    const bars: ChartBarData[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);

      const matched = timeframeSessions.filter(
        (s) => getLocalDateString(new Date(s.startedAt)) === dateStr,
      );

      const totalSecs = matched.reduce((acc, s) => acc + s.durationSeconds, 0);
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();

      bars.push({
        id: `week-day-${i}`,
        label: dayLabels[i],
        subLabel: `${monthShort} ${dayNum}`,
        totalSeconds: totalSecs,
        totalHours: Math.round((totalSecs / 3600) * 100) / 100,
        sessionCount: matched.length,
        isCurrent: dateStr === todayStr,
        skillBreakdown: buildSkillBreakdown(matched),
      });
    }
    return bars;
  }

  // ── 3. MONTH VIEW (All days of current month) ───────────────
  if (timeframe === 'month') {
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = ref.getDate();
    const monthName = ref.toLocaleString('en-US', { month: 'short' });
    const bars: ChartBarData[] = [];

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateStr = getLocalDateString(d);

      const matched = timeframeSessions.filter(
        (s) => getLocalDateString(new Date(s.startedAt)) === dateStr,
      );

      const totalSecs = matched.reduce((acc, s) => acc + s.durationSeconds, 0);

      bars.push({
        id: `month-day-${dayNum}`,
        label: `${dayNum}`,
        subLabel: `${monthName} ${dayNum}`,
        totalSeconds: totalSecs,
        totalHours: Math.round((totalSecs / 3600) * 100) / 100,
        sessionCount: matched.length,
        isCurrent: dayNum === todayDate,
        skillBreakdown: buildSkillBreakdown(matched),
      });
    }
    return bars;
  }

  // ── 4. YEAR VIEW (12 Calendar Months) ────────────────────────
  if (timeframe === 'year') {
    const year = ref.getFullYear();
    const currentMonth = ref.getMonth();
    const monthLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const bars: ChartBarData[] = [];

    for (let m = 0; m < 12; m++) {
      const matched = timeframeSessions.filter((s) => {
        const d = new Date(s.startedAt);
        return d.getFullYear() === year && d.getMonth() === m;
      });

      const totalSecs = matched.reduce((acc, s) => acc + s.durationSeconds, 0);

      bars.push({
        id: `year-month-${m}`,
        label: monthLabels[m],
        subLabel: `${monthLabels[m]} ${year}`,
        totalSeconds: totalSecs,
        totalHours: Math.round((totalSecs / 3600) * 100) / 100,
        sessionCount: matched.length,
        isCurrent: m === currentMonth,
        skillBreakdown: buildSkillBreakdown(matched),
      });
    }
    return bars;
  }

  return [];
}

/**
 * Calculate high-level summary metrics for the selected timeframe
 */
export function getTimeframeSummary(
  sessions: FocusSession[],
  skills: Skill[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): AnalyticsSummary {
  const matched = getSessionsInTimeframe(sessions, timeframe, referenceDate);
  const totalSeconds = matched.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHours = secondsToHours(totalSeconds);
  const sessionCount = matched.length;

  // Compute Total XP in this timeframe
  const totalXP = matched.reduce((acc, s) => {
    const hasIntention = Boolean(s.intention && s.intention.trim().length > 0);
    const hasReflection = Boolean(
      s.reflection &&
        ((s.reflection.notes && s.reflection.notes.trim().length > 0) ||
          (s.reflection.friction && s.reflection.friction.trim().length > 0) ||
          s.reflection.qualityRating),
    );
    const breakdown = getSessionXPBreakdown(s.durationSeconds, s.status, {
      hasIntention,
      hasReflection,
    });
    return acc + breakdown.totalXP;
  }, 0);

  // Daily Average calculation
  let divisorDays = 1;
  const ref = new Date(referenceDate);

  if (timeframe === 'day') {
    divisorDays = 1;
  } else if (timeframe === 'week') {
    divisorDays = 7;
  } else if (timeframe === 'month') {
    const daysInMonth = new Date(
      ref.getFullYear(),
      ref.getMonth() + 1,
      0,
    ).getDate();
    divisorDays = daysInMonth;
  } else if (timeframe === 'year') {
    divisorDays = 365;
  }

  const dailyAverageHours =
    Math.round((totalSeconds / divisorDays / 3600) * 100) / 100;

  // Top Skill
  const skillSecondsMap = new Map<string, number>();
  for (const s of matched) {
    skillSecondsMap.set(
      s.skillId,
      (skillSecondsMap.get(s.skillId) ?? 0) + s.durationSeconds,
    );
  }

  let topSkill: AnalyticsSummary['topSkill'] = null;
  if (skillSecondsMap.size > 0) {
    const sorted = Array.from(skillSecondsMap.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const [topSkillId, topSecs] = sorted[0];
    const skillObj = skills.find((s) => s.id === topSkillId);
    if (skillObj) {
      const topHours = secondsToHours(topSecs);
      const percentage =
        totalSeconds > 0 ? Math.round((topSecs / totalSeconds) * 100) : 0;
      topSkill = {
        id: skillObj.id,
        name: skillObj.name,
        icon: skillObj.icon,
        color: skillObj.color,
        hours: topHours,
        percentage,
      };
    }
  }

  // Deliberate Practice Adherence (% with intention)
  const withIntention = matched.filter(
    (s) => s.intention && s.intention.trim().length > 0,
  ).length;
  const deliberatePracticeRate =
    sessionCount > 0 ? Math.round((withIntention / sessionCount) * 100) : 0;

  // Reflection Rate (% with notes or rating)
  const withReflection = matched.filter(
    (s) =>
      s.reflection &&
      (s.reflection.notes ||
        s.reflection.friction ||
        s.reflection.qualityRating),
  ).length;
  const reflectionRate =
    sessionCount > 0 ? Math.round((withReflection / sessionCount) * 100) : 0;

  // Average Flow Rating
  const ratedSessions = matched.filter((s) => s.reflection?.qualityRating);
  const avgFlowRating =
    ratedSessions.length > 0
      ? Math.round(
          (ratedSessions.reduce(
            (acc, s) => acc + (s.reflection?.qualityRating ?? 0),
            0,
          ) /
            ratedSessions.length) *
            10,
        ) / 10
      : 0;

  return {
    timeframe,
    totalSeconds,
    totalHours,
    sessionCount,
    totalXP,
    dailyAverageHours,
    topSkill,
    deliberatePracticeRate,
    reflectionRate,
    avgFlowRating,
  };
}

/**
 * Get distribution of deliberate practice time across skills in the timeframe
 */
export function getSkillTimeDistribution(
  sessions: FocusSession[],
  skills: Skill[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): SkillTimeDistribution[] {
  const matched = getSessionsInTimeframe(sessions, timeframe, referenceDate);
  const totalSeconds = matched.reduce((acc, s) => acc + s.durationSeconds, 0);

  const bySkill = new Map<string, number>();
  for (const s of matched) {
    bySkill.set(s.skillId, (bySkill.get(s.skillId) ?? 0) + s.durationSeconds);
  }

  const result: SkillTimeDistribution[] = [];
  for (const skill of skills) {
    const secs = bySkill.get(skill.id) ?? 0;
    if (secs > 0) {
      result.push({
        skill,
        seconds: secs,
        hours: secondsToHours(secs),
        percentage:
          totalSeconds > 0 ? Math.round((secs / totalSeconds) * 100) : 0,
      });
    }
  }

  return result.sort((a, b) => b.seconds - a.seconds);
}

/**
 * Get distribution of flow ratings (1 to 5 stars) in the timeframe
 */
export function getFlowRatingDistribution(
  sessions: FocusSession[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): FlowRatingDistribution[] {
  const matched = getSessionsInTimeframe(sessions, timeframe, referenceDate);
  const rated = matched.filter((s) => s.reflection?.qualityRating);

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of rated) {
    const stars = s.reflection?.qualityRating ?? 0;
    if (stars >= 1 && stars <= 5) {
      counts[stars] = (counts[stars] ?? 0) + 1;
    }
  }

  const total = rated.length;
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars] ?? 0,
    percentage: total > 0 ? Math.round(((counts[stars] ?? 0) / total) * 100) : 0,
  }));
}

/**
 * Extract frequent reflection friction / breakthrough tags in the timeframe
 */
export function getReflectionTagsCount(
  sessions: FocusSession[],
  timeframe: Timeframe,
  referenceDate = new Date(),
): Array<{ tag: string; count: number }> {
  const matched = getSessionsInTimeframe(sessions, timeframe, referenceDate);
  const tagMap = new Map<string, number>();

  for (const s of matched) {
    if (!s.reflection?.notes) continue;
    const parts = s.reflection.notes.split(' • ').map((t) => t.trim());
    for (const part of parts) {
      if (part && part.length > 2 && part.length < 35) {
        tagMap.set(part, (tagMap.get(part) ?? 0) + 1);
      }
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

/**
 * Calculate T-Shaped Domain Mastery breakdown: Primary Core Depth vs Auxiliary Breadth
 */
export function getTShapedMasteryBreakdown(
  skillProgress: SkillProgress[],
): TShapedMasteryBreakdown {
  if (skillProgress.length === 0) {
    return {
      coreSkill: null,
      auxiliarySkills: [],
      coreHours: 0,
      auxiliaryHours: 0,
      corePercentage: 0,
      auxiliaryPercentage: 0,
    };
  }

  // Core skill is highest targetHours (or highest totalSeconds)
  const sorted = [...skillProgress].sort(
    (a, b) =>
      b.skill.targetHours - a.skill.targetHours || b.totalSeconds - a.totalSeconds,
  );

  const coreSkill = sorted[0];
  const auxiliarySkills = sorted.slice(1);

  const coreHours = coreSkill.totalHours;
  const auxiliaryHours = auxiliarySkills.reduce(
    (acc, sp) => acc + sp.totalHours,
    0,
  );
  const grandTotal = coreHours + auxiliaryHours;

  const corePercentage =
    grandTotal > 0 ? Math.round((coreHours / grandTotal) * 100) : 0;
  const auxiliaryPercentage =
    grandTotal > 0 ? Math.round((auxiliaryHours / grandTotal) * 100) : 0;

  return {
    coreSkill,
    auxiliarySkills,
    coreHours,
    auxiliaryHours,
    corePercentage,
    auxiliaryPercentage,
  };
}
