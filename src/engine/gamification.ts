/**
 * gamification.ts
 * Meditation tracking and gamification features for BreatheGlow
 */

export interface MeditationStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  todaySessionTime: number; // in milliseconds
  lastMeditationDate: string;
  totalMeditationTime: number; // lifetime in milliseconds
  sessionsToday: number;
  // Extended (may be absent in older stored versions)
  sessions?: SessionRecord[];
  lastGoalMinutes?: number;
}

export interface MeditationLevel {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

// Session & pledge related interfaces
export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  activeMs: number;
  cycles: number;
  goalMinutes?: number;
  goalBonusXP?: number;
  pledgeMultiplier?: number;
  finalXP: number;
  pledgeHonored?: boolean;
}

export type SessionState = 'idle' | 'running' | 'paused';

export interface ActiveSessionRuntime {
  id: string;
  startedAt: number;
  lastResumeAt: number;
  accumulatedActiveMs: number;
  cycles: number;
  state: SessionState;
  goalMinutes?: number;
  bonusApplied: boolean;
}

export interface ActivePledge {
  templateId: string; // simple id e.g. pledge-15m-115
  startedAt: string;
  goalMinutes: number;
  multiplier: number; // e.g. 1.15
  completed?: boolean;
  cancelled?: boolean;
}

const MEDITATION_LEVELS: MeditationLevel[] = [
  { level: 1, title: "Mindful Rookie", xpRequired: 0, icon: "🌱" },
  { level: 2, title: "Breathing Novice", xpRequired: 50, icon: "🌿" },
  { level: 3, title: "Calm Coder", xpRequired: 150, icon: "🍃" },
  { level: 4, title: "Zen Developer", xpRequired: 300, icon: "🌳" },
  { level: 5, title: "Mindful Master", xpRequired: 500, icon: "✨" },
  { level: 6, title: "Breathing Sage", xpRequired: 750, icon: "🧘" },
  { level: 7, title: "Code Mystic", xpRequired: 1000, icon: "⭐" },
  // Renamed final level to align with product branding
  { level: 8, title: "Breath Master", xpRequired: 1500, icon: "🌌" }
];

export class MeditationTracker {
  private stats: MeditationStats;
  private isHovering: boolean = false;
  private hoverStartTime: number = 0;
  private completedCycles: number = 0;
  private storage: any; // VS Code's ExtensionContext.globalState
  private activeSession: ActiveSessionRuntime | null = null;
  private activePledge: ActivePledge | null = null;

  constructor(private storageKey: string = 'breatheGlow.meditationStats', storage?: any) {
    this.storage = storage;
    this.stats = this.loadStats();
  }

  private loadStats(): MeditationStats {
    try {
      let stored;
      if (this.storage) {
        // Use VS Code storage
        stored = this.storage.get(this.storageKey);
      } else {
        // Fallback to in-memory
        stored = null;
      }
      
      if (stored) {
        // Check if it's a new day and reset daily stats
        const today = new Date().toDateString();
        if (stored.lastMeditationDate !== today) {
          return {
            ...stored,
            todaySessionTime: 0,
            sessionsToday: 0,
            currentStreak: this.shouldIncrementStreak(stored.lastMeditationDate) ? 
              stored.currentStreak + 1 : 0
          };
        }
        return stored;
      }
    } catch (error) {
      console.warn('Failed to load meditation stats:', error);
    }
    
    return {
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      todaySessionTime: 0,
      lastMeditationDate: '',
      totalMeditationTime: 0,
      sessionsToday: 0
    };
  }

  private saveStats(): void {
    try {
      if (this.storage) {
        // Use VS Code storage
        this.storage.update(this.storageKey, this.stats);
      }
      // If no storage available, stats remain in memory only
    } catch (error) {
      console.warn('Failed to save meditation stats:', error);
    }
  }

  private shouldIncrementStreak(lastDate: string): boolean {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return last.toDateString() === yesterday.toDateString();
  }

  startHovering(): void {
    if (!this.isHovering) {
      this.isHovering = true;
      this.hoverStartTime = Date.now();
    }
  }

  stopHovering(): void {
    if (this.isHovering) {
      this.isHovering = false;
      const sessionTime = Date.now() - this.hoverStartTime;
      
      // Only count sessions longer than 3 seconds to avoid accidental hovers
      if (sessionTime > 3000) {
        this.addMeditationTime(sessionTime);
      }
    }
  }

  onBreathingCycleComplete(): void {
    // Legacy mode (hover tracking) still supported
    if (this.isHovering) {
      this.completedCycles++;
      this.addXP(1);
    }
    // New session mode
    if (this.activeSession && this.activeSession.state === 'running') {
      this.activeSession.cycles++;
      this.addXP(1); // cycle XP always immediate & linear
    }
  }

  private addMeditationTime(timeMs: number): void {
    const today = new Date().toDateString();
    
    // Update daily stats
    this.stats.todaySessionTime += timeMs;
    this.stats.totalMeditationTime += timeMs;
    this.stats.sessionsToday++;
    
    // Update streak if this is first session today
    if (this.stats.lastMeditationDate !== today) {
      if (this.shouldIncrementStreak(this.stats.lastMeditationDate)) {
        this.stats.currentStreak++;
      } else {
        this.stats.currentStreak = 1;
      }
      
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
      
      this.stats.lastMeditationDate = today;
    }
    
    this.saveStats();
  }

  private addXP(amount: number): void {
    this.stats.totalXP += amount;
    this.saveStats();
  }

  getCurrentLevel(): MeditationLevel {
    for (let i = MEDITATION_LEVELS.length - 1; i >= 0; i--) {
      if (this.stats.totalXP >= MEDITATION_LEVELS[i].xpRequired) {
        return MEDITATION_LEVELS[i];
      }
    }
    return MEDITATION_LEVELS[0];
  }

  getProgressToNextLevel(): { current: number; required: number; percentage: number } {
    const currentLevel = this.getCurrentLevel();
    const nextLevelIndex = MEDITATION_LEVELS.findIndex(l => l.level === currentLevel.level + 1);
    
    if (nextLevelIndex === -1) {
      // Max level reached
      return { current: this.stats.totalXP, required: currentLevel.xpRequired, percentage: 100 };
    }
    
    const nextLevel = MEDITATION_LEVELS[nextLevelIndex];
    const progress = this.stats.totalXP - currentLevel.xpRequired;
    const required = nextLevel.xpRequired - currentLevel.xpRequired;
    
    return {
      current: progress,
      required: required,
      percentage: Math.round((progress / required) * 100)
    };
  }

  getStats(): MeditationStats {
    return { ...this.stats };
  }

  getDailyGoalProgress(): number {
    const DAILY_GOAL_MS = 10 * 60 * 1000; // 10 minutes
    return Math.min(100, Math.round((this.stats.todaySessionTime / DAILY_GOAL_MS) * 100));
  }

  formatSessionTime(timeMs: number): string {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  getStreakIcon(): string {
    if (this.stats.currentStreak === 0) return "○";
    if (this.stats.currentStreak < 3) return "🌱";
    if (this.stats.currentStreak < 7) return "🌿";
    if (this.stats.currentStreak < 14) return "🌳";
    if (this.stats.currentStreak < 30) return "✨";
    return "🏆";
  }

  getGamificationDisplay(): { primary: string; secondary: string } {
    const level = this.getCurrentLevel();
    const todayTime = this.formatSessionTime(this.stats.todaySessionTime);
    const streak = this.stats.currentStreak;
    
    return {
      primary: `${level.icon} ${level.title}`,
      secondary: `${this.getStreakIcon()} ${streak}d • ${todayTime} today • ${this.stats.totalXP} XP`
    };
  }

  reset(): void {
    this.stats = {
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      todaySessionTime: 0,
      lastMeditationDate: '',
      totalMeditationTime: 0,
      sessionsToday: 0,
      sessions: []
    };
    this.saveStats();
  }

  // ---------------- Session Goal Logic ----------------
  getGoalOptions(): { options: number[]; defaultMinutes: number } {
    const level = this.getCurrentLevel().level;
    if (level <= 2) return { options: [3,5,10], defaultMinutes: 5 };
    if (level <= 4) return { options: [5,10,15], defaultMinutes: 10 };
    if (level <= 6) return { options: [10,15,20], defaultMinutes: 15 };
    if (level === 7) return { options: [15,20,25], defaultMinutes: 20 };
    return { options: [20,30,40], defaultMinutes: 30 };
  }

  getActiveSession(): ActiveSessionRuntime | null { return this.activeSession ? { ...this.activeSession } : null; }
  getActivePledge(): ActivePledge | null { return this.activePledge ? { ...this.activePledge } : null; }

  startSession(goalMinutes?: number): { started: boolean; reason?: string; session?: ActiveSessionRuntime } {
    if (this.activeSession) {
      return { started: false, reason: 'Session already running or paused' };
    }
    const id = `sess-${Date.now()}`;
    const chosenGoal = goalMinutes ?? this.stats.lastGoalMinutes ?? this.getGoalOptions().defaultMinutes;
    this.stats.lastGoalMinutes = chosenGoal;
    this.activeSession = {
      id,
      startedAt: Date.now(),
      lastResumeAt: Date.now(),
      accumulatedActiveMs: 0,
      cycles: 0,
      state: 'running',
      goalMinutes: chosenGoal,
      bonusApplied: false
    };
    this.saveStats();
    return { started: true, session: { ...this.activeSession } };
  }

  pauseSession(): boolean {
    if (!this.activeSession || this.activeSession.state !== 'running') return false;
    const now = Date.now();
    this.activeSession.accumulatedActiveMs += now - this.activeSession.lastResumeAt;
    this.activeSession.state = 'paused';
    return true;
  }

  resumeSession(): boolean {
    if (!this.activeSession || this.activeSession.state !== 'paused') return false;
    this.activeSession.lastResumeAt = Date.now();
    this.activeSession.state = 'running';
    return true;
  }

  endSession(): SessionRecord | null {
    if (!this.activeSession) return null;
    // Finalize active time
    if (this.activeSession.state === 'running') {
      const now = Date.now();
      this.activeSession.accumulatedActiveMs += now - this.activeSession.lastResumeAt;
    }
    const active = this.activeSession;
    const goalMs = (active.goalMinutes ?? 0) * 60000;
    const completion = goalMs > 0 ? Math.min(1, active.accumulatedActiveMs / goalMs) : 0;
    const timeBonusXP = goalMs > 0 ? Math.round(completion * ( (active.goalMinutes ?? 0) * 0.5 )) : 0;
    // Apply pledge multiplier if honored
    let pledgeMultiplier: number | undefined;
    let pledgeHonored: boolean | undefined;
    if (this.activePledge && !this.activePledge.cancelled) {
      if (this.activePledge.goalMinutes === active.goalMinutes && completion >= 1) {
        pledgeMultiplier = this.activePledge.multiplier;
        pledgeHonored = true;
      } else {
        pledgeHonored = false;
      }
    }
    const baseCycleXP = 0; // cycles already incrementally added
    if (timeBonusXP) this.addXP(timeBonusXP);
    if (pledgeMultiplier && pledgeHonored) {
      const pre = this.stats.totalXP;
      const bonus = Math.round((this.stats.totalXP - pre) * (pledgeMultiplier - 1));
      if (bonus > 0) this.addXP(bonus); // practically 0 because baseCycleXP=0; left for future composite XP
    }
    const record: SessionRecord = {
      id: active.id,
      startedAt: new Date(active.startedAt).toISOString(),
      endedAt: new Date().toISOString(),
      activeMs: active.accumulatedActiveMs,
      cycles: active.cycles,
      goalMinutes: active.goalMinutes,
      goalBonusXP: timeBonusXP,
      pledgeMultiplier,
      finalXP: this.stats.totalXP,
      pledgeHonored
    };
    if (!this.stats.sessions) this.stats.sessions = [];
    this.stats.sessions.push(record);
    // Update daily/session time
    this.addMeditationTime(active.accumulatedActiveMs);
    this.activeSession = null;
    if (this.activePledge && pledgeHonored) this.activePledge.completed = true; else if (this.activePledge) this.activePledge.completed = false;
    this.saveStats();
    return record;
  }

  // ---------------- Pledge Logic ----------------
  makePledge(goalMinutes: number, multiplier: number = 1.15): { ok: boolean; reason?: string; pledge?: ActivePledge } {
    if (this.activePledge && !this.activePledge.cancelled && !this.activePledge.completed) {
      return { ok: false, reason: 'Pledge already active' };
    }
    this.activePledge = {
      templateId: `pledge-${goalMinutes}m-${Math.round((multiplier-1)*100)}`,
      startedAt: new Date().toISOString(),
      goalMinutes,
      multiplier
    };
    return { ok: true, pledge: { ...this.activePledge } };
  }

  cancelPledge(): boolean {
    if (!this.activePledge || this.activePledge.cancelled) return false;
    this.activePledge.cancelled = true;
    return true;
  }

  // Display helpers
  getSessionStatusBarText(): string {
    if (this.activeSession) {
      let activeMs = this.activeSession.accumulatedActiveMs;
      if (this.activeSession.state === 'running') {
        activeMs += Date.now() - this.activeSession.lastResumeAt;
      }
      const t = this.formatSessionTime(activeMs);
      const prefix = this.activeSession.state === 'paused' ? '⏸️' : '🧘';
      return `${prefix} ${t}` + (this.activeSession.goalMinutes ? ` / ${this.activeSession.goalMinutes}m` : '');
    }
    if (this.stats.lastGoalMinutes) {
      return `🎯 ${this.stats.lastGoalMinutes}m goal`;
    }
    return '🎯 Set goal';
  }
}
