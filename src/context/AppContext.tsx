import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import type {
  Skill,
  SkillCategory,
  FocusSession,
  MilestoneRecord,
  TimerState,
  SkillProgress,
  StreakData,
  ActiveView,
  NewSkillData,
  CelebrationData,
  SessionRewardData,
  LevelInfo,
} from '../types';
import { useAuth } from './AuthContext';
import * as db from '../lib/database';
import {
  getAllSkillProgress,
  calculateStreak,
  getTodayTotalSeconds,
  getTotalSeconds,
  secondsToHours,
  getGlobalTotalXP,
  getSkillTotalXP,
  calculateLevelInfo,
  getSessionXPBreakdown,
} from '../utils/calculations';
import { MIN_SESSION_DURATION_SECONDS } from '../lib/constants';
import { getCorePalette, type CorePalette } from '../utils/palettes';

interface AppContextValue {
  // Data
  skills: Skill[];
  sessions: FocusSession[];
  milestones: MilestoneRecord[];
  skillProgress: SkillProgress[];
  streak: StreakData;
  totalHours: number;
  totalSeconds: number;
  todaySeconds: number;
  totalXP: number;
  globalLevelInfo: LevelInfo;

  // Core Palette Personalization
  paletteId: string;
  corePalette: CorePalette;
  setPaletteId: (paletteId: string) => void;

  // Views
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Timer
  activeTimer: TimerState | null;
  startTimer: (skillId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  completeTimer: () => void;
  cancelTimer: () => void;

  // Skills
  createSkill: (data: NewSkillData) => void;
  updateSkillCategory: (skillId: string, category: SkillCategory) => void;
  archiveSkill: (skillId: string) => void;
  deleteSkill: (skillId: string) => void;

  // Celebration & Rewards
  celebration: CelebrationData | null;
  dismissCelebration: () => void;
  sessionReward: SessionRewardData | null;
  dismissSessionReward: () => void;

  // Refresh
  refreshData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeTimer, setActiveTimer] = useState<TimerState | null>(null);
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [sessionReward, setSessionReward] = useState<SessionRewardData | null>(null);
  const [paletteId, setPaletteIdState] = useState<string>(() => {
    return db.getStoredPalette(user?.id);
  });

  const corePalette = useMemo(() => getCorePalette(paletteId), [paletteId]);

  const handleSetPaletteId = useCallback(
    (newPaletteId: string) => {
      setPaletteIdState(newPaletteId);
      db.setStoredPalette(newPaletteId, user?.id);
    },
    [user?.id],
  );

  // Sync palette preference when user changes
  useEffect(() => {
    setPaletteIdState(db.getStoredPalette(user?.id));
  }, [user?.id]);

  // Load data when user changes
  const loadData = useCallback(() => {
    if (!user) {
      setSkills([]);
      setSessions([]);
      setMilestones([]);
      setActiveTimer(null);
      return;
    }

    setSkills(db.getSkills(user.id));
    setSessions(db.getSessions(user.id));
    setMilestones(db.getMilestones(user.id));

    // Restore active timer if any
    const savedTimer = db.getTimerState();
    if (savedTimer) {
      // If the timer was running and the page was closed,
      // restore it as paused to prevent counting time when not practicing
      if (savedTimer.status === 'running') {
        const pausedTimer: TimerState = {
          ...savedTimer,
          status: 'paused',
          pausedAt: Date.now(),
        };
        setActiveTimer(pausedTimer);
        db.saveTimerState(pausedTimer);
      } else {
        setActiveTimer(savedTimer);
      }
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed values
  const skillProgress = useMemo(
    () => getAllSkillProgress(skills, sessions, milestones),
    [skills, sessions, milestones],
  );

  const streak = useMemo(() => calculateStreak(sessions), [sessions]);

  const totalSeconds = useMemo(
    () => getTotalSeconds(sessions),
    [sessions],
  );

  const totalHours = useMemo(
    () => secondsToHours(totalSeconds),
    [totalSeconds],
  );

  const todaySeconds = useMemo(
    () => getTodayTotalSeconds(sessions),
    [sessions],
  );

  const totalXP = useMemo(
    () => getGlobalTotalXP(sessions),
    [sessions],
  );

  const globalLevelInfo = useMemo(
    () => calculateLevelInfo(totalXP),
    [totalXP],
  );

  // ── Timer Actions ─────────────────────────────────────────

  const startTimer = useCallback(
    (skillId: string) => {
      const timer: TimerState = {
        skillId,
        startedAt: Date.now(),
        pausedAt: null,
        totalPausedMs: 0,
        status: 'running',
      };
      setActiveTimer(timer);
      db.saveTimerState(timer);
      setActiveView('timer');
    },
    [setActiveView],
  );

  const pauseTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.status !== 'running') return prev;
      const paused: TimerState = {
        ...prev,
        status: 'paused',
        pausedAt: Date.now(),
      };
      db.saveTimerState(paused);
      return paused;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.status !== 'paused' || !prev.pausedAt) return prev;
      const resumed: TimerState = {
        ...prev,
        status: 'running',
        totalPausedMs: prev.totalPausedMs + (Date.now() - prev.pausedAt),
        pausedAt: null,
      };
      db.saveTimerState(resumed);
      return resumed;
    });
  }, []);

  const completeTimer = useCallback(() => {
    if (!user || !activeTimer) return;

    const now = Date.now();
    let effectivePausedMs = activeTimer.totalPausedMs;

    // If currently paused, count time since pause
    if (activeTimer.status === 'paused' && activeTimer.pausedAt) {
      effectivePausedMs += now - activeTimer.pausedAt;
    }

    const durationMs = now - activeTimer.startedAt - effectivePausedMs;
    const durationSeconds = Math.max(0, Math.round(durationMs / 1000));

    // Discard sessions shorter than minimum
    if (durationSeconds < MIN_SESSION_DURATION_SECONDS) {
      setActiveTimer(null);
      db.saveTimerState(null);
      setActiveView('dashboard');
      return;
    }

    // Capture pre-completion progression states
    const preSessions = db.getSessions(user.id);
    const preGlobalXP = getGlobalTotalXP(preSessions);
    const preGlobalLevel = calculateLevelInfo(preGlobalXP);
    const preSkillXP = getSkillTotalXP(activeTimer.skillId, preSessions);
    const preSkillLevel = calculateLevelInfo(preSkillXP);

    // Save session
    db.createSession(
      user.id,
      activeTimer.skillId,
      activeTimer.startedAt,
      now,
      durationSeconds,
    );

    // Capture post-completion progression states
    const updatedSessions = db.getSessions(user.id);
    const postGlobalXP = getGlobalTotalXP(updatedSessions);
    const postGlobalLevel = calculateLevelInfo(postGlobalXP);
    const postSkillXP = getSkillTotalXP(activeTimer.skillId, updatedSessions);
    const postSkillLevel = calculateLevelInfo(postSkillXP);

    const xpBreakdown = getSessionXPBreakdown(durationSeconds, 'completed');
    const skill = skills.find((s) => s.id === activeTimer.skillId);

    if (skill) {
      // Set session reward modal data
      setSessionReward({
        skillName: skill.name,
        skillIcon: skill.icon,
        skillColor: skill.color,
        durationSeconds,
        earnedXP: xpBreakdown.totalXP,
        baseXP: xpBreakdown.baseXP,
        bonusXP: xpBreakdown.bonusXP,
        previousLevelInfo: preGlobalLevel,
        newLevelInfo: postGlobalLevel,
        didLevelUp: postGlobalLevel.level > preGlobalLevel.level,
        previousSkillLevelInfo: preSkillLevel,
        newSkillLevelInfo: postSkillLevel,
        didSkillLevelUp: postSkillLevel.level > preSkillLevel.level,
      });

      // Check for new milestone unlocks
      const totalSeconds = updatedSessions
        .filter((s) => s.skillId === skill.id)
        .reduce((acc, s) => acc + s.durationSeconds, 0);
      const totalHrs = secondsToHours(totalSeconds);

      const newMilestones = db.checkAndCreateMilestones(
        user.id,
        skill.id,
        totalHrs,
        skill.targetHours,
      );

      // Trigger milestone celebration for highest new milestone if reached
      if (newMilestones.length > 0) {
        const highest = newMilestones.reduce((a, b) =>
          a.percentage > b.percentage ? a : b,
        );
        setCelebration({
          skillName: skill.name,
          skillIcon: skill.icon,
          skillColor: skill.color,
          percentage: highest.percentage,
          totalHours: totalHrs,
          targetHours: skill.targetHours,
        });
      }
    }

    // Clear timer and refresh data
    setActiveTimer(null);
    db.saveTimerState(null);
    loadData();
    setActiveView('dashboard');
  }, [user, activeTimer, skills, loadData, setActiveView]);

  const cancelTimer = useCallback(() => {
    setActiveTimer(null);
    db.saveTimerState(null);
    setActiveView('dashboard');
  }, [setActiveView]);

  // ── Skill Actions ─────────────────────────────────────────

  const handleCreateSkill = useCallback(
    (data: NewSkillData) => {
      if (!user) return;
      db.createSkill(user.id, data);
      loadData();
    },
    [user, loadData],
  );

  const handleUpdateSkillCategory = useCallback(
    (skillId: string, category: SkillCategory) => {
      if (!user) return;
      db.updateSkillCategory(user.id, skillId, category);
      loadData();
    },
    [user, loadData],
  );

  const handleArchiveSkill = useCallback(
    (skillId: string) => {
      if (!user) return;
      db.archiveSkill(user.id, skillId);
      loadData();
    },
    [user, loadData],
  );

  const handleDeleteSkill = useCallback(
    (skillId: string) => {
      if (!user) return;
      db.deleteSkill(user.id, skillId);
      loadData();
    },
    [user, loadData],
  );

  // ── Celebration & Reward Dismissal ────────────────────────

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const dismissSessionReward = useCallback(() => {
    setSessionReward(null);
  }, []);

  // ── Refresh ───────────────────────────────────────────────

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <AppContext.Provider
      value={{
        skills,
        sessions,
        milestones,
        skillProgress,
        streak,
        totalHours,
        totalSeconds,
        todaySeconds,
        totalXP,
        globalLevelInfo,
        paletteId,
        corePalette,
        setPaletteId: handleSetPaletteId,
        activeView,
        setActiveView,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        completeTimer,
        cancelTimer,
        createSkill: handleCreateSkill,
        updateSkillCategory: handleUpdateSkillCategory,
        archiveSkill: handleArchiveSkill,
        deleteSkill: handleDeleteSkill,
        celebration,
        dismissCelebration,
        sessionReward,
        dismissSessionReward,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
