import { describe, it, expect, beforeEach } from 'vitest';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  createSkill,
  getSkills,
  archiveSkill,
  deleteSkill,
  createSession,
  getSessions,
  checkAndCreateMilestones,
  getMilestones,
  saveTimerState,
  getTimerState,
  getStoredPalette,
  setStoredPalette,
} from '../lib/database';
import { STORAGE_KEYS } from '../lib/constants';
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
  // Clear all mastery localStorage keys before each test
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
});

// ── Auth ──────────────────────────────────────────────────────

describe('Auth', () => {
  it('signs up a new user', () => {
    const user = signUp('test@test.com', 'password123');
    expect(user.email).toBe('test@test.com');
    expect(user.id).toBeTruthy();
    expect(user.createdAt).toBeTruthy();
  });

  it('prevents duplicate email signup', () => {
    signUp('test@test.com', 'password123');
    expect(() => signUp('test@test.com', 'password456')).toThrow(
      'already exists',
    );
  });

  it('requires minimum password length', () => {
    expect(() => signUp('test@test.com', '123')).toThrow('at least 6');
  });

  it('validates email format', () => {
    expect(() => signUp('notanemail', 'password123')).toThrow('valid email');
  });

  it('signs in with correct credentials', () => {
    signUp('test@test.com', 'password123');
    signOut();
    const user = signIn('test@test.com', 'password123');
    expect(user.email).toBe('test@test.com');
  });

  it('rejects wrong password', () => {
    signUp('test@test.com', 'password123');
    signOut();
    expect(() => signIn('test@test.com', 'wrong')).toThrow(
      'Invalid email or password',
    );
  });

  it('persists session across calls', () => {
    signUp('test@test.com', 'password123');
    const user = getCurrentUser();
    expect(user?.email).toBe('test@test.com');
  });

  it('clears session on sign out without deleting registered user accounts', () => {
    const created = signUp('persistent@test.com', 'password123');
    expect(getCurrentUser()?.id).toBe(created.id);

    signOut();
    expect(getCurrentUser()).toBeNull();

    // Re-authenticating with same credentials works perfectly
    const relogged = signIn('persistent@test.com', 'password123');
    expect(relogged.id).toBe(created.id);
    expect(relogged.email).toBe('persistent@test.com');
  });

  it('handles email case-insensitivity and whitespace seamlessly', () => {
    signUp('  MyEmail@Example.COM  ', 'secret123');
    signOut();

    // Different case & trimming during sign in
    const user1 = signIn('myemail@example.com', 'secret123');
    expect(user1.email).toBe('myemail@example.com');
    signOut();

    const user2 = signIn('  MYEMAIL@EXAMPLE.COM  ', 'secret123');
    expect(user2.email).toBe('myemail@example.com');
  });

  it('handles password whitespace trimming consistently', () => {
    signUp('trimtest@test.com', 'password123  ');
    signOut();

    const user = signIn('trimtest@test.com', '  password123');
    expect(user.email).toBe('trimtest@test.com');
  });

  it('rejects unknown email during sign in', () => {
    expect(() => signIn('unknown@test.com', 'password123')).toThrow(
      'Invalid email or password',
    );
  });

  it('allows password reset and logs in with new credentials', () => {
    signUp('resetme@test.com', 'oldpassword');
    signOut();

    expect(() => signIn('resetme@test.com', 'newpassword')).toThrow();

    const resetUser = resetPassword('resetme@test.com', 'newpassword');
    expect(resetUser.email).toBe('resetme@test.com');
    expect(getCurrentUser()?.email).toBe('resetme@test.com');

    signOut();
    const relogged = signIn('resetme@test.com', 'newpassword');
    expect(relogged.email).toBe('resetme@test.com');
  });

  it('preserves user skills, sessions, and milestones through multiple logout/login cycles', () => {
    // 1. User signs up
    const user = signUp('practice_master@test.com', 'securePassword');

    // 2. User creates skills and logs sessions
    const skill = createSkill(user.id, {
      name: 'Python',
      description: 'Code practice',
      icon: '🐍',
      color: '#3b82f6',
      targetHours: 100,
    });
    createSession(user.id, skill.id, Date.now() - 36000000, Date.now(), 36000);
    checkAndCreateMilestones(user.id, skill.id, 10, 100);

    // 3. User logs out
    signOut();
    expect(getCurrentUser()).toBeNull();

    // 4. User logs back in
    const activeSessionUser = signIn('practice_master@test.com', 'securePassword');
    expect(activeSessionUser.id).toBe(user.id);

    // 5. Verify all user data is intact
    const userSkills = getSkills(activeSessionUser.id);
    const userSessions = getSessions(activeSessionUser.id);
    const userMilestones = getMilestones(activeSessionUser.id);

    expect(userSkills).toHaveLength(1);
    expect(userSkills[0].name).toBe('Python');
    expect(userSessions).toHaveLength(1);
    expect(userSessions[0].durationSeconds).toBe(36000);
    expect(userMilestones.length).toBeGreaterThan(0);
  });
});

// ── Skills ────────────────────────────────────────────────────

describe('Skills', () => {
  const userId = 'user-test';

  it('creates a skill', () => {
    const skill = createSkill(userId, {
      name: 'Python',
      description: 'Learn Python',
      icon: '🐍',
      color: '#3b82f6',
      targetHours: 100,
    });

    expect(skill.name).toBe('Python');
    expect(skill.targetHours).toBe(100);
    expect(skill.userId).toBe(userId);
    expect(skill.isArchived).toBe(false);
  });

  it('lists only active skills for user', () => {
    createSkill(userId, {
      name: 'Python',
      description: '',
      icon: '🐍',
      color: '#3b82f6',
      targetHours: 100,
    });
    createSkill('other-user', {
      name: 'Guitar',
      description: '',
      icon: '🎸',
      color: '#f59e0b',
      targetHours: 50,
    });

    const skills = getSkills(userId);
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('Python');
  });

  it('validates skill name', () => {
    expect(() =>
      createSkill(userId, {
        name: '  ',
        description: '',
        icon: '🐍',
        color: '#3b82f6',
        targetHours: 100,
      }),
    ).toThrow('name is required');
  });

  it('validates target hours', () => {
    expect(() =>
      createSkill(userId, {
        name: 'Python',
        description: '',
        icon: '🐍',
        color: '#3b82f6',
        targetHours: 0,
      }),
    ).toThrow('greater than 0');
  });

  it('archives a skill', () => {
    const skill = createSkill(userId, {
      name: 'Python',
      description: '',
      icon: '🐍',
      color: '#3b82f6',
      targetHours: 100,
    });

    archiveSkill(userId, skill.id);
    expect(getSkills(userId)).toHaveLength(0);
  });

  it('creates skill with specified category and defaults to generic', () => {
    const s1 = createSkill(userId, {
      name: 'Python',
      description: '',
      category: 'programming',
      icon: '🐍',
      color: '#3b82f6',
      targetHours: 100,
    });
    expect(s1.category).toBe('programming');

    const s2 = createSkill(userId, {
      name: 'Meditation',
      description: '',
      icon: '🧘',
      color: '#8b5cf6',
      targetHours: 50,
    });
    expect(s2.category).toBe('generic');
  });

  it('deletes a skill and removes associated sessions and milestones', () => {
    const skill = createSkill(userId, {
      name: 'Temporary Skill',
      description: '',
      icon: '⚡',
      color: '#ef4444',
      targetHours: 10,
    });

    createSession(userId, skill.id, Date.now() - 3600000, Date.now(), 3600);
    checkAndCreateMilestones(userId, skill.id, 10, 10);

    expect(getSkills(userId)).toHaveLength(1);
    expect(getSessions(userId)).toHaveLength(1);
    expect(getMilestones(userId).length).toBeGreaterThan(0);

    deleteSkill(userId, skill.id);

    expect(getSkills(userId)).toHaveLength(0);
    expect(getSessions(userId)).toHaveLength(0);
    expect(getMilestones(userId)).toHaveLength(0);
  });
});

// ── Sessions ──────────────────────────────────────────────────

describe('Sessions', () => {
  const userId = 'user-test';

  it('creates and retrieves a session', () => {
    const now = Date.now();
    const session = createSession(userId, 'skill-1', now - 3600000, now, 3600);

    expect(session.durationSeconds).toBe(3600);
    expect(session.status).toBe('completed');

    const sessions = getSessions(userId);
    expect(sessions).toHaveLength(1);
  });

  it('rejects zero duration', () => {
    expect(() =>
      createSession(userId, 'skill-1', Date.now(), Date.now(), 0),
    ).toThrow('positive');
  });

  it('isolates sessions by user', () => {
    const now = Date.now();
    createSession(userId, 'skill-1', now - 3600000, now, 3600);
    createSession('other-user', 'skill-1', now - 3600000, now, 3600);

    expect(getSessions(userId)).toHaveLength(1);
    expect(getSessions('other-user')).toHaveLength(1);
  });
});

// ── Milestones ────────────────────────────────────────────────

describe('Milestones', () => {
  const userId = 'user-test';

  it('creates milestones when progress reaches thresholds', () => {
    // 10 hours out of 100 = 10%
    const newMilestones = checkAndCreateMilestones(
      userId,
      'skill-1',
      10,
      100,
    );
    expect(newMilestones).toHaveLength(1);
    expect(newMilestones[0].percentage).toBe(10);
  });

  it('creates multiple milestones at once', () => {
    // 50 hours out of 100 = 50%
    const newMilestones = checkAndCreateMilestones(
      userId,
      'skill-1',
      50,
      100,
    );
    expect(newMilestones).toHaveLength(3); // 10%, 25%, 50%
  });

  it('does not duplicate milestones', () => {
    checkAndCreateMilestones(userId, 'skill-1', 10, 100);
    const secondCheck = checkAndCreateMilestones(userId, 'skill-1', 10, 100);
    expect(secondCheck).toHaveLength(0);
  });

  it('handles 100% completion', () => {
    const milestones = checkAndCreateMilestones(userId, 'skill-1', 100, 100);
    expect(milestones).toHaveLength(5); // 10, 25, 50, 75, 100
  });

  it('handles over-completion', () => {
    const milestones = checkAndCreateMilestones(userId, 'skill-1', 150, 100);
    expect(milestones).toHaveLength(5);
  });

  it('handles zero target gracefully', () => {
    const milestones = checkAndCreateMilestones(userId, 'skill-1', 10, 0);
    expect(milestones).toHaveLength(0);
  });

  it('retrieves milestones for user', () => {
    checkAndCreateMilestones(userId, 'skill-1', 50, 100);
    const stored = getMilestones(userId);
    expect(stored.length).toBe(3);
    expect(stored.every((m) => m.userId === userId)).toBe(true);
  });
});

// ── Timer State ───────────────────────────────────────────────

describe('Timer State', () => {
  it('saves and retrieves timer state', () => {
    const state: TimerState = {
      skillId: 'skill-1',
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
      status: 'running',
    };

    saveTimerState(state);
    const retrieved = getTimerState();
    expect(retrieved?.skillId).toBe('skill-1');
    expect(retrieved?.status).toBe('running');
  });

  it('clears timer state', () => {
    saveTimerState({
      skillId: 'skill-1',
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
      status: 'running',
    });

    saveTimerState(null);
    expect(getTimerState()).toBeNull();
  });

  it('returns null when no timer saved', () => {
    expect(getTimerState()).toBeNull();
  });
});

// ── Core Palette Persistence ──────────────────────────────────

describe('Core Palette Persistence', () => {
  it('defaults to violet if no palette stored', () => {
    expect(getStoredPalette()).toBe('violet');
    expect(getStoredPalette('user-123')).toBe('violet');
  });

  it('persists and retrieves chosen palette', () => {
    setStoredPalette('azure');
    expect(getStoredPalette()).toBe('azure');
  });

  it('persists and retrieves user-specific palette', () => {
    setStoredPalette('emerald', 'user-456');
    expect(getStoredPalette('user-456')).toBe('emerald');
    // Global fallback also updated
    expect(getStoredPalette()).toBe('emerald');
  });
});
