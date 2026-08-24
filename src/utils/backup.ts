import type { Skill, FocusSession, MilestoneRecord } from '../types';
import { STORAGE_KEYS } from '../lib/constants';

export interface MasteryBackupData {
  version: 1;
  app: 'Mastery';
  exportedAt: string;
  paletteId?: string;
  skills: Skill[];
  sessions: FocusSession[];
  milestones: MilestoneRecord[];
}

export function generateBackupData(userId: string): MasteryBackupData {
  let allSkills: Skill[] = [];
  let allSessions: FocusSession[] = [];
  let allMilestones: MilestoneRecord[] = [];
  let paletteId = 'deep-violet';

  try {
    const rawSkills = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (rawSkills) {
      allSkills = (JSON.parse(rawSkills) as Skill[]).filter(
        (s) => s.userId === userId,
      );
    }
  } catch {}

  try {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (rawSessions) {
      allSessions = (JSON.parse(rawSessions) as FocusSession[]).filter(
        (s) => s.userId === userId,
      );
    }
  } catch {}

  try {
    const rawMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (rawMilestones) {
      allMilestones = (JSON.parse(rawMilestones) as MilestoneRecord[]).filter(
        (m) => m.userId === userId,
      );
    }
  } catch {}

  try {
    const storedPalette = localStorage.getItem('mastery_core_palette');
    if (storedPalette) {
      paletteId = storedPalette;
    }
  } catch {}

  return {
    version: 1,
    app: 'Mastery',
    exportedAt: new Date().toISOString(),
    paletteId,
    skills: allSkills,
    sessions: allSessions,
    milestones: allMilestones,
  };
}

export function downloadBackupFile(data: MasteryBackupData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `mastery-backup-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseAndValidateBackup(
  jsonText: string,
): { valid: true; data: MasteryBackupData } | { valid: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText) as Partial<MasteryBackupData>;
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File is not a valid JSON object' };
    }

    if (!Array.isArray(parsed.skills)) {
      return { valid: false, error: 'Backup is missing skills array' };
    }

    if (!Array.isArray(parsed.sessions)) {
      return { valid: false, error: 'Backup is missing sessions array' };
    }

    const validatedData: MasteryBackupData = {
      version: 1,
      app: 'Mastery',
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      paletteId: parsed.paletteId || 'deep-violet',
      skills: parsed.skills,
      sessions: parsed.sessions,
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
    };

    return { valid: true, data: validatedData };
  } catch (err) {
    return {
      valid: false,
      error:
        err instanceof Error
          ? `Invalid JSON syntax: ${err.message}`
          : 'Could not read backup file',
    };
  }
}

export function restoreBackupData(
  userId: string,
  backup: MasteryBackupData,
  mode: 'merge' | 'replace' = 'merge',
): {
  importedSkills: number;
  importedSessions: number;
  importedMilestones: number;
} {
  // Read current storage
  let currentSkills: Skill[] = [];
  let currentSessions: FocusSession[] = [];
  let currentMilestones: MilestoneRecord[] = [];

  try {
    const rawSkills = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (rawSkills) currentSkills = JSON.parse(rawSkills);
  } catch {}

  try {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (rawSessions) currentSessions = JSON.parse(rawSessions);
  } catch {}

  try {
    const rawMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (rawMilestones) currentMilestones = JSON.parse(rawMilestones);
  } catch {}

  // Filter out current user's data if replacing
  const otherUsersSkills = currentSkills.filter((s) => s.userId !== userId);
  const otherUsersSessions = currentSessions.filter((s) => s.userId !== userId);
  const otherUsersMilestones = currentMilestones.filter((m) => m.userId !== userId);

  let targetSkills = mode === 'replace' ? [] : currentSkills.filter((s) => s.userId === userId);
  let targetSessions = mode === 'replace' ? [] : currentSessions.filter((s) => s.userId === userId);
  let targetMilestones = mode === 'replace' ? [] : currentMilestones.filter((m) => m.userId === userId);

  let importedSkillsCount = 0;
  let importedSessionsCount = 0;
  let importedMilestonesCount = 0;

  // Process incoming skills (ensure current userId)
  const existingSkillIds = new Set(targetSkills.map((s) => s.id));
  backup.skills.forEach((skill) => {
    const adjustedSkill: Skill = { ...skill, userId };
    if (!existingSkillIds.has(adjustedSkill.id)) {
      targetSkills.push(adjustedSkill);
      existingSkillIds.add(adjustedSkill.id);
      importedSkillsCount++;
    }
  });

  // Process incoming sessions
  const existingSessionIds = new Set(targetSessions.map((s) => s.id));
  backup.sessions.forEach((session) => {
    const adjustedSession: FocusSession = { ...session, userId };
    if (!existingSessionIds.has(adjustedSession.id)) {
      targetSessions.push(adjustedSession);
      existingSessionIds.add(adjustedSession.id);
      importedSessionsCount++;
    }
  });

  // Process incoming milestones
  const existingMilestoneIds = new Set(targetMilestones.map((m) => m.id));
  backup.milestones.forEach((milestone) => {
    const adjustedMilestone: MilestoneRecord = { ...milestone, userId };
    if (!existingMilestoneIds.has(adjustedMilestone.id)) {
      targetMilestones.push(adjustedMilestone);
      existingMilestoneIds.add(adjustedMilestone.id);
      importedMilestonesCount++;
    }
  });

  // Save back
  localStorage.setItem(
    STORAGE_KEYS.SKILLS,
    JSON.stringify([...otherUsersSkills, ...targetSkills]),
  );
  localStorage.setItem(
    STORAGE_KEYS.SESSIONS,
    JSON.stringify([...otherUsersSessions, ...targetSessions]),
  );
  localStorage.setItem(
    STORAGE_KEYS.MILESTONES,
    JSON.stringify([...otherUsersMilestones, ...targetMilestones]),
  );

  if (backup.paletteId) {
    localStorage.setItem('mastery_core_palette', backup.paletteId);
  }

  return {
    importedSkills: importedSkillsCount,
    importedSessions: importedSessionsCount,
    importedMilestones: importedMilestonesCount,
  };
}
