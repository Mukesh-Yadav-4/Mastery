// ── Milestone Thresholds ──────────────────────────────────────
export const MILESTONE_PERCENTAGES = [10, 25, 50, 75, 100] as const;

export const MILESTONE_LABELS: Record<number, string> = {
  10: 'First Steps',
  25: 'Quarter Way',
  50: 'Halfway There',
  75: 'Almost There',
  100: 'Goal Reached',
};

export const MILESTONE_ICONS: Record<number, string> = {
  10: '🌱',
  25: '⚡',
  50: '🔥',
  75: '💎',
  100: '👑',
};

// ── Skill Colors ──────────────────────────────────────────────
export const SKILL_COLORS = [
  '#818cf8', // Indigo
  '#a78bfa', // Violet
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#fbbf24', // Amber
  '#34d399', // Emerald
  '#22d3ee', // Cyan
  '#60a5fa', // Blue
  '#a3e635', // Lime
  '#f87171', // Red
] as const;

// ── Skill Icons ───────────────────────────────────────────────
export const SKILL_ICONS = [
  '💻', '🎹', '✍️', '🇩🇪', '🐍', '📐', '🎸', '🎨',
  '🗣️', '📚', '🧮', '🎯', '🏋️', '♟️', '📷', '🎻',
  '🧠', '⚡', '🔬', '🎤', '🏃', '🧘', '🎭', '📊',
] as const;

// ── Target Hour Presets ───────────────────────────────────────
export const TARGET_HOUR_PRESETS = [25, 50, 100, 200, 500, 1000] as const;

// ── Minimum Session Duration (seconds) ────────────────────────
// Any completed session >= 1s is stored permanently
export const MIN_SESSION_DURATION_SECONDS = 1;

// ── localStorage Keys ─────────────────────────────────────────
export const STORAGE_KEYS = {
  USERS: 'mastery_users',
  CURRENT_USER: 'mastery_current_user',
  SKILLS: 'mastery_skills',
  SESSIONS: 'mastery_sessions',
  MILESTONES: 'mastery_milestones',
  ACTIVE_TIMER: 'mastery_active_timer',
} as const;
