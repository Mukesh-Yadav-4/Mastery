import { STORAGE_KEYS, MILESTONE_PERCENTAGES } from './constants';
import type {
  User,
  Skill,
  SkillCategory,
  FocusSession,
  MilestoneRecord,
  NewSkillData,
  TimerState,
} from '../types';

// ── Helpers ───────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
    throw new Error('Unable to save data. Storage may be full.');
  }
}

// ── Auth ──────────────────────────────────────────────────────

interface StoredUser {
  id: string;
  email: string;
  password: string;
  displayName?: string;
  createdAt: string;
}

export function signUp(email: string, password: string): User {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    throw new Error('Please enter a valid email address');
  }

  if (trimmedPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = readJson<StoredUser[]>(STORAGE_KEYS.USERS, []);

  if (users.some((u) => u.email.trim().toLowerCase() === trimmedEmail)) {
    throw new Error('An account with this email already exists');
  }

  const user: StoredUser = {
    id: generateId(),
    email: trimmedEmail,
    password: trimmedPassword, // localStorage only — never sent to network
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeJson(STORAGE_KEYS.USERS, users);

  const publicUser: User = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
  writeJson(STORAGE_KEYS.CURRENT_USER, publicUser);

  return publicUser;
}

export function signIn(email: string, password: string): User {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Invalid email or password');
  }

  const users = readJson<StoredUser[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(
    (u) =>
      u.email.trim().toLowerCase() === trimmedEmail &&
      u.password.trim() === trimmedPassword,
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const publicUser: User = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
  writeJson(STORAGE_KEYS.CURRENT_USER, publicUser);
  return publicUser;
}

export function resetPassword(email: string, newPassword: string): User {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = newPassword.trim();

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  if (trimmedPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = readJson<StoredUser[]>(STORAGE_KEYS.USERS, []);
  let user = users.find((u) => u.email.trim().toLowerCase() === trimmedEmail);

  if (user) {
    user.password = trimmedPassword;
  } else {
    user = {
      id: generateId(),
      email: trimmedEmail,
      password: trimmedPassword,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }

  writeJson(STORAGE_KEYS.USERS, users);

  const publicUser: User = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
  writeJson(STORAGE_KEYS.CURRENT_USER, publicUser);
  return publicUser;
}

export function demoSignIn(): User {
  const users = readJson<StoredUser[]>(STORAGE_KEYS.USERS, []);
  let user = users.find((u) => u.email === 'demo@mastery.app');
  if (!user) {
    user = {
      id: generateId(),
      email: 'demo@mastery.app',
      password: 'password123',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeJson(STORAGE_KEYS.USERS, users);
  }

  const publicUser: User = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
  writeJson(STORAGE_KEYS.CURRENT_USER, publicUser);
  return publicUser;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
}

export function getCurrentUser(): User | null {
  return readJson<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// ── Skills ────────────────────────────────────────────────────

export function getSkills(userId: string): Skill[] {
  const all = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  return all
    .filter((s) => s.userId === userId && !s.isArchived)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function createSkill(userId: string, data: NewSkillData): Skill {
  if (!data.name.trim()) {
    throw new Error('Skill name is required');
  }

  if (data.targetHours <= 0) {
    throw new Error('Target hours must be greater than 0');
  }

  const all = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  const now = new Date().toISOString();

  const skill: Skill = {
    id: generateId(),
    userId,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category || 'generic',
    icon: data.icon,
    color: data.color,
    targetHours: data.targetHours,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  all.push(skill);
  writeJson(STORAGE_KEYS.SKILLS, all);

  return skill;
}

export function archiveSkill(userId: string, skillId: string): void {
  const all = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  const updated = all.map((s) =>
    s.id === skillId && s.userId === userId
      ? { ...s, isArchived: true, updatedAt: new Date().toISOString() }
      : s,
  );
  writeJson(STORAGE_KEYS.SKILLS, updated);
}

export function updateSkillCategory(
  userId: string,
  skillId: string,
  category: SkillCategory,
): Skill | null {
  const all = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  let updatedSkill: Skill | null = null;
  const updated = all.map((s) => {
    if (s.id === skillId && s.userId === userId) {
      updatedSkill = {
        ...s,
        category,
        updatedAt: new Date().toISOString(),
      };
      return updatedSkill;
    }
    return s;
  });
  writeJson(STORAGE_KEYS.SKILLS, updated);
  return updatedSkill;
}

export function deleteSkill(userId: string, skillId: string): void {
  // 1. Remove the skill
  const skills = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  const filteredSkills = skills.filter(
    (s) => !(s.id === skillId && s.userId === userId),
  );
  writeJson(STORAGE_KEYS.SKILLS, filteredSkills);

  // 2. Remove associated sessions
  const sessions = readJson<FocusSession[]>(STORAGE_KEYS.SESSIONS, []);
  const filteredSessions = sessions.filter(
    (sess) => !(sess.skillId === skillId && sess.userId === userId),
  );
  writeJson(STORAGE_KEYS.SESSIONS, filteredSessions);

  // 3. Remove associated milestones
  const milestones = readJson<MilestoneRecord[]>(STORAGE_KEYS.MILESTONES, []);
  const filteredMilestones = milestones.filter(
    (m) => !(m.skillId === skillId && m.userId === userId),
  );
  writeJson(STORAGE_KEYS.MILESTONES, filteredMilestones);

  // 4. If active timer is running on this deleted skill, clear it
  const activeTimer = readJson<TimerState | null>(STORAGE_KEYS.ACTIVE_TIMER, null);
  if (activeTimer && activeTimer.skillId === skillId) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  }
}

// ── Sessions ──────────────────────────────────────────────────

export function getSessions(userId: string): FocusSession[] {
  const all = readJson<FocusSession[]>(STORAGE_KEYS.SESSIONS, []);
  return all
    .filter((s) => s.userId === userId && s.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
}

export function createSession(
  userId: string,
  skillId: string,
  startedAt: number,
  endedAt: number,
  durationSeconds: number,
): FocusSession {
  if (durationSeconds <= 0) {
    throw new Error('Session duration must be positive');
  }

  const all = readJson<FocusSession[]>(STORAGE_KEYS.SESSIONS, []);

  const session: FocusSession = {
    id: generateId(),
    userId,
    skillId,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationSeconds: Math.round(durationSeconds),
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  all.push(session);
  writeJson(STORAGE_KEYS.SESSIONS, all);

  // Update skill's updatedAt timestamp
  const skills = readJson<Skill[]>(STORAGE_KEYS.SKILLS, []);
  const updatedSkills = skills.map((s) =>
    s.id === skillId && s.userId === userId
      ? { ...s, updatedAt: new Date().toISOString() }
      : s,
  );
  writeJson(STORAGE_KEYS.SKILLS, updatedSkills);

  return session;
}

// ── Milestones ────────────────────────────────────────────────

export function getMilestones(userId: string): MilestoneRecord[] {
  const all = readJson<MilestoneRecord[]>(STORAGE_KEYS.MILESTONES, []);
  return all.filter((m) => m.userId === userId);
}

export function getSkillMilestones(
  userId: string,
  skillId: string,
): MilestoneRecord[] {
  return getMilestones(userId).filter((m) => m.skillId === skillId);
}

export function checkAndCreateMilestones(
  userId: string,
  skillId: string,
  totalHours: number,
  targetHours: number,
): MilestoneRecord[] {
  if (targetHours <= 0) return [];

  const existing = readJson<MilestoneRecord[]>(STORAGE_KEYS.MILESTONES, []);
  const skillMilestones = existing.filter(
    (m) => m.userId === userId && m.skillId === skillId,
  );
  const percentage = (totalHours / targetHours) * 100;

  const newMilestones: MilestoneRecord[] = [];

  for (const threshold of MILESTONE_PERCENTAGES) {
    if (
      percentage >= threshold &&
      !skillMilestones.some((m) => m.percentage === threshold)
    ) {
      const milestone: MilestoneRecord = {
        id: generateId(),
        userId,
        skillId,
        percentage: threshold,
        unlockedAt: new Date().toISOString(),
      };
      newMilestones.push(milestone);
    }
  }

  if (newMilestones.length > 0) {
    writeJson(STORAGE_KEYS.MILESTONES, [...existing, ...newMilestones]);
  }

  return newMilestones;
}

export function saveTimerState(state: TimerState | null): void {
  if (state) {
    writeJson(STORAGE_KEYS.ACTIVE_TIMER, state);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  }
}

export function getTimerState(): TimerState | null {
  return readJson<TimerState | null>(STORAGE_KEYS.ACTIVE_TIMER, null);
}

// ── Core Palette Persistence ──────────────────────────────────

export function getStoredPalette(userId?: string): string {
  const key = userId ? `${STORAGE_KEYS.CORE_PALETTE}_${userId}` : STORAGE_KEYS.CORE_PALETTE;
  return readJson<string>(key, 'violet');
}

export function setStoredPalette(paletteId: string, userId?: string): void {
  const key = userId ? `${STORAGE_KEYS.CORE_PALETTE}_${userId}` : STORAGE_KEYS.CORE_PALETTE;
  writeJson(key, paletteId);
  // Also write to global fallback
  writeJson(STORAGE_KEYS.CORE_PALETTE, paletteId);
}

