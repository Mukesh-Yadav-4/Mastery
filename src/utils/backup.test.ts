import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateBackupData,
  parseAndValidateBackup,
  restoreBackupData,
  type MasteryBackupData,
} from './backup';
import { STORAGE_KEYS } from '../lib/constants';
import type { Skill, FocusSession } from '../types';

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

describe('Backup and Restore utilities', () => {
  const mockUserId = 'user-123';

  const mockSkills: Skill[] = [
    {
      id: 'skill-1',
      userId: mockUserId,
      name: 'TypeScript Mastery',
      description: 'Advanced types',
      icon: '💻',
      color: '#6366f1',
      targetHours: 100,
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockSessions: FocusSession[] = [
    {
      id: 'sess-1',
      userId: mockUserId,
      skillId: 'skill-1',
      startedAt: '2026-01-01T10:00:00.000Z',
      endedAt: '2026-01-01T11:00:00.000Z',
      durationSeconds: 3600,
      status: 'completed',
      intention: 'Build parser',
      createdAt: '2026-01-01T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    const storage = new LocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      writable: true,
    });
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(mockSkills));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mockSessions));
    localStorage.setItem('mastery_core_palette', 'cyan-resonance');
  });

  it('generates a valid backup data structure', () => {
    const backup = generateBackupData(mockUserId);
    expect(backup.app).toBe('Mastery');
    expect(backup.version).toBe(1);
    expect(backup.skills).toHaveLength(1);
    expect(backup.sessions).toHaveLength(1);
    expect(backup.paletteId).toBe('cyan-resonance');
  });

  it('validates a correct backup JSON string', () => {
    const rawJson = JSON.stringify(generateBackupData(mockUserId));
    const result = parseAndValidateBackup(rawJson);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.skills[0].name).toBe('TypeScript Mastery');
    }
  });

  it('rejects invalid JSON or malformed schema', () => {
    const result = parseAndValidateBackup('{ not json');
    expect(result.valid).toBe(false);

    const result2 = parseAndValidateBackup(JSON.stringify({ notASkill: 123 }));
    expect(result2.valid).toBe(false);
  });

  it('merges backup data cleanly into existing store', () => {
    const newBackup: MasteryBackupData = {
      version: 1,
      app: 'Mastery',
      exportedAt: new Date().toISOString(),
      skills: [
        {
          id: 'skill-2',
          userId: 'other-user',
          name: 'Piano',
          description: 'Keys',
          icon: '🎹',
          color: '#a855f7',
          targetHours: 100,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      sessions: [],
      milestones: [],
    };

    const stats = restoreBackupData(mockUserId, newBackup, 'merge');
    expect(stats.importedSkills).toBe(1);

    const storedSkills = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SKILLS) || '[]',
    ) as Skill[];
    expect(storedSkills).toHaveLength(2);
    expect(storedSkills.some((s) => s.name === 'Piano')).toBe(true);
    expect(storedSkills.find((s) => s.name === 'Piano')?.userId).toBe(mockUserId);
  });
});
