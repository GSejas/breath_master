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
}

export interface MeditationLevel {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

const MEDITATION_LEVELS: MeditationLevel[] = [
  { level: 1, title: "Mindful Rookie", xpRequired: 0, icon: "🌱" },
  { level: 2, title: "Breathing Novice", xpRequired: 50, icon: "🌿" },
  { level: 3, title: "Calm Coder", xpRequired: 150, icon: "🍃" },
  { level: 4, title: "Zen Developer", xpRequired: 300, icon: "🌳" },
  { level: 5, title: "Mindful Master", xpRequired: 500, icon: "✨" },
  { level: 6, title: "Breathing Sage", xpRequired: 750, icon: "🧘" },
  { level: 7, title: "Code Mystic", xpRequired: 1000, icon: "⭐" },
  { level: 8, title: "Digital Buddha", xpRequired: 1500, icon: "🌌" }
];

export class MeditationTracker {
  private stats: MeditationStats;
  private isHovering: boolean = false;
  private hoverStartTime: number = 0;
  private completedCycles: number = 0;
  private storage: any; // VS Code's ExtensionContext.globalState

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
    if (this.isHovering) {
      this.completedCycles++;
      this.addXP(1); // 1 XP per completed cycle while hovering
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
      sessionsToday: 0
    };
    this.saveStats();
  }
}
