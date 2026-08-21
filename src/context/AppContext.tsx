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
  FocusSession,
  MilestoneRecord,
  TimerState,
  SkillProgress,
  StreakData,
  ActiveView,
  NewSkillData,
  CelebrationData,
} from '../types';
import { useAuth } from './AuthContext';
import * as db from '../lib/database';
import {
  getAllSkillProgress,
  calculateStreak,
  getTodayTotalSeconds,
  getTotalSeconds,
  secondsToHours,
} from '../utils/calculations';
import { MIN_SESSION_DURATION_SECONDS } from '../lib/constants';

interface AppContextValue {
  // Data
  skills: Skill[];
  sessions: FocusSession[];
  milestones: MilestoneRecord[];
  skillProgress: SkillProgress[];
  streak: StreakData;
  totalHours: number;
  todaySeconds: number;

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
  archiveSkill: (skillId: string) => void;

  // Celebration
  celebration: CelebrationData | null;
  dismissCelebration: () => void;

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

  const totalHours = useMemo(
    () => secondsToHours(getTotalSeconds(sessions)),
    [sessions],
  );

  const todaySeconds = useMemo(
    () => getTodayTotalSeconds(sessions),
    [sessions],
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

    // Save session
    db.createSession(
      user.id,
      activeTimer.skillId,
      activeTimer.startedAt,
      now,
      durationSeconds,
    );

    // Check for new milestones
    const updatedSessions = db.getSessions(user.id);
    const skill = skills.find((s) => s.id === activeTimer.skillId);

    if (skill) {
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

      // Trigger celebration for the highest new milestone
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

  const handleArchiveSkill = useCallback(
    (skillId: string) => {
      if (!user) return;
      db.archiveSkill(user.id, skillId);
      loadData();
    },
    [user, loadData],
  );

  // ── Celebration ───────────────────────────────────────────

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
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
        todaySeconds,
        activeView,
        setActiveView,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        completeTimer,
        cancelTimer,
        createSkill: handleCreateSkill,
        archiveSkill: handleArchiveSkill,
        celebration,
        dismissCelebration,
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
