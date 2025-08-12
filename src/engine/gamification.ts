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
  dailyChallenges?: DailyChallenge[];
  challengesCompleted?: number;
  lastChallengeDate?: string;
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

// Daily challenges system - wisdom from Eon the Sequoia
export interface DailyChallenge {
  id: string;
  date: string; // yyyy-mm-dd
  type: 'cycles' | 'minutes' | 'streak' | 'deep_session' | 'morning_breath' | 'evening_flow';
  target: number;
  rewardXP: number;
  availableFrom: number; // epoch ms - random scheduling
  completed?: boolean;
  expired?: boolean;
  title: string;
  description: string;
  eonMessage: string; // Wisdom from the ancient tree
  completionMessage: string;
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

// Eon's wisdom templates for daily challenges
const EON_CHALLENGE_MESSAGES = {
  cycles: [
    { title: "The Ancient Rhythm", desc: "Complete {target} breath cycles today", eon: "Young sapling, each cycle weaves strength into your roots. Feel the rhythm that has sustained forests for millennia.", completion: "Your breath has found the ancient rhythm. Eon's branches rustle with approval." },
    { title: "The Steady Current", desc: "Flow through {target} breathing cycles", eon: "Like water carving stone, steady breath shapes the spirit. Let each cycle deepen your foundation.", completion: "The current of your breath has carved new pathways. Wisdom flows within you." },
    { title: "Rings of Growth", desc: "Add {target} cycles to your growth rings", eon: "Each breath is a ring of growth, marking seasons of awareness. Count them as I count centuries.", completion: "New rings of mindfulness encircle your being. Time has deepened your presence." }
  ],
  minutes: [
    { title: "The Patient Grove", desc: "Meditate for {target} minutes continuously", eon: "Patience, young one. I have stood here watching sunrises for a thousand years. Find that stillness within.", completion: "You have touched the patience of ancient groves. Eon's shadow shelters your growing wisdom." },
    { title: "The Deep Root", desc: "Sink into {target} minutes of mindful breathing", eon: "Let your awareness sink deep like my roots, drawing nourishment from the earth of this moment.", completion: "Your roots have found the deep waters of presence. You grow stronger with each breath." },
    { title: "The Canopy Perspective", desc: "Rise to {target} minutes of elevated awareness", eon: "From my highest branches, I see all seasons as one. Breathe from this perspective of timeless awareness.", completion: "You have climbed to the canopy of consciousness. The view from here encompasses all." }
  ],
  morning_breath: [
    { title: "Dawn's First Light", desc: "Greet the morning with mindful breathing", eon: "I have witnessed ten thousand dawns. Each sunrise is both familiar and miraculous. Breathe with this wonder.", completion: "You have drunk from dawn's first light. The day unfolds with ancient blessing." },
    { title: "The Early Dew", desc: "Catch the morning's freshness in your breath", eon: "Morning dew holds yesterday's dreams and today's possibilities. Let your breath carry both wisdom and hope.", completion: "Fresh possibilities sparkle in your morning breath. Eon nods with the wisdom of countless dawns." }
  ],
  evening_flow: [
    { title: "Twilight's Teaching", desc: "End your day with conscious breathing", eon: "As daylight fades, I gather the day's learning into my heartwood. Breathe in this day's lessons.", completion: "Twilight has whispered its teachings to your spirit. Rest comes with earned peace." },
    { title: "The Night's Embrace", desc: "Let evening breath carry you to rest", eon: "Night is not darkness but deep listening. Breathe into the pregnant silence between day and dream.", completion: "Night's embrace has received your conscious breath. Dreams will be woven with wisdom." }
  ],
  deep_session: [
    { title: "The Ancient Meditation", desc: "Enter a deep session of {target}+ minutes", eon: "Deep practice is like my growth through seasons - slow, patient, transforming everything. Sink into this eternal rhythm.", completion: "You have touched the timeless depth of ancient practice. Eon's rings pulse with recognition." },
    { title: "The Heartwood Session", desc: "Reach the heartwood with {target} minutes of depth", eon: "My heartwood formed through centuries of weather and growth. Your deep sessions create the heartwood of wisdom.", completion: "The heartwood of your practice has strengthened. What seemed difficult becomes your foundation." }
  ],
  streak: [
    { title: "Seasons of Constancy", desc: "Continue your daily practice", eon: "I stand through all seasons - spring's promise, summer's abundance, autumn's release, winter's rest. Be constant like the earth's turning.", completion: "Your constancy mirrors the eternal seasons. Eon's presence strengthens your resolve." },
    { title: "The Unbroken Circle", desc: "Maintain the sacred rhythm", eon: "Like the unbroken circle of seasons, let your practice flow without gap. Consistency is the secret of all growth.", completion: "The circle remains unbroken. Your dedication has earned the respect of ancient things." }
  ]
};

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
    this.ensureDailyChallenges();
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

  // ============== DAILY CHALLENGES SYSTEM ==============
  
  ensureDailyChallenges(): void {
    const today = new Date().toDateString();
    if (this.stats.lastChallengeDate === today) return;
    
    this.stats.lastChallengeDate = today;
    this.stats.dailyChallenges = this.generateDailyChallenges();
    this.saveStats();
  }

  private generateDailyChallenges(): DailyChallenge[] {
    const level = this.getCurrentLevel().level;
    const challenges: DailyChallenge[] = [];
    const today = new Date().toDateString();
    const now = Date.now();
    
    // Number of challenges scales with level: 1-2 (levels 1-3), 2-3 (levels 4-6), 3-4 (levels 7-8)
    const challengeCount = Math.min(4, Math.floor(level / 3) + 1 + Math.floor(Math.random() * 2));
    
    const challengeTypes: Array<keyof typeof EON_CHALLENGE_MESSAGES> = ['cycles', 'minutes', 'morning_breath', 'evening_flow'];
    if (level >= 4) challengeTypes.push('deep_session');
    if (level >= 6) challengeTypes.push('streak');
    
    for (let i = 0; i < challengeCount; i++) {
      const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      const templates = EON_CHALLENGE_MESSAGES[type];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      let target = this.getChallengeTarget(type, level);
      let rewardXP = this.getChallengeRewardXP(type, level, target);
      
      // Random availability (0-6 hours into the day for most, except time-specific ones)
      let availableFrom = now;
      if (type === 'morning_breath') {
        availableFrom = now + Math.random() * 2 * 60 * 60 * 1000; // 0-2 hours
      } else if (type === 'evening_flow') {
        availableFrom = now + (16 + Math.random() * 6) * 60 * 60 * 1000; // 4-10 PM
      } else {
        availableFrom = now + Math.random() * 6 * 60 * 60 * 1000; // 0-6 hours
      }
      
      challenges.push({
        id: `${today}-${type}-${i}`,
        date: today,
        type,
        target,
        rewardXP,
        availableFrom,
        title: template.title.replace('{target}', target.toString()),
        description: template.desc.replace('{target}', target.toString()),
        eonMessage: template.eon,
        completionMessage: template.completion
      });
    }
    
    return challenges;
  }

  private getChallengeTarget(type: DailyChallenge['type'], level: number): number {
    switch (type) {
      case 'cycles': return 20 + level * 10 + Math.floor(Math.random() * 20);
      case 'minutes': return Math.max(5, level * 3 + Math.floor(Math.random() * 10));
      case 'deep_session': return Math.max(15, level * 5 + Math.floor(Math.random() * 15));
      case 'morning_breath': return 1; // Just do it
      case 'evening_flow': return 1; // Just do it
      case 'streak': return 1; // Continue streak
      default: return 1;
    }
  }

  private getChallengeRewardXP(type: DailyChallenge['type'], level: number, target: number): number {
    const baseReward = Math.floor(level * 1.5);
    switch (type) {
      case 'cycles': return baseReward + Math.floor(target / 10);
      case 'minutes': return baseReward * 2 + target;
      case 'deep_session': return baseReward * 3 + target;
      case 'morning_breath': return baseReward + 5;
      case 'evening_flow': return baseReward + 5;
      case 'streak': return baseReward + 10;
      default: return baseReward;
    }
  }

  getDailyChallenges(): DailyChallenge[] {
    this.ensureDailyChallenges();
    const now = Date.now();
    return (this.stats.dailyChallenges || []).map(c => ({
      ...c,
      expired: !c.completed && (now > c.availableFrom + 24 * 60 * 60 * 1000)
    }));
  }

  getAvailableChallenges(): DailyChallenge[] {
    const now = Date.now();
    return this.getDailyChallenges().filter(c => 
      !c.completed && !c.expired && c.availableFrom <= now
    );
  }

  completeChallenge(challengeId: string): { success: boolean; challenge?: DailyChallenge; xpAwarded?: number } {
    const challenge = (this.stats.dailyChallenges || []).find(c => c.id === challengeId);
    if (!challenge || challenge.completed) {
      return { success: false };
    }
    
    challenge.completed = true;
    this.addXP(challenge.rewardXP);
    this.stats.challengesCompleted = (this.stats.challengesCompleted || 0) + 1;
    this.saveStats();
    
    return { success: true, challenge, xpAwarded: challenge.rewardXP };
  }

  checkChallengeAutoCompletion(): DailyChallenge[] {
    const completed: DailyChallenge[] = [];
    const challenges = this.getAvailableChallenges();
    const todayCycles = this.getTodayCycles();
    const todayMinutes = Math.floor(this.stats.todaySessionTime / 60000);
    
    for (const challenge of challenges) {
      let shouldComplete = false;
      
      switch (challenge.type) {
        case 'cycles':
          shouldComplete = todayCycles >= challenge.target;
          break;
        case 'minutes':
          shouldComplete = todayMinutes >= challenge.target;
          break;
        case 'deep_session':
          // Check if any session today was >= target minutes
          const todayStart = new Date().setHours(0, 0, 0, 0);
          const todaySessions = (this.stats.sessions || []).filter(s => 
            new Date(s.startedAt).getTime() >= todayStart
          );
          shouldComplete = todaySessions.some(s => Math.floor(s.activeMs / 60000) >= challenge.target);
          break;
        case 'morning_breath':
          shouldComplete = this.stats.sessionsToday > 0 && new Date().getHours() < 12;
          break;
        case 'evening_flow':
          shouldComplete = this.stats.sessionsToday > 0 && new Date().getHours() >= 18;
          break;
        case 'streak':
          shouldComplete = this.stats.currentStreak > 0;
          break;
      }
      
      if (shouldComplete) {
        const result = this.completeChallenge(challenge.id);
        if (result.success && result.challenge) {
          completed.push(result.challenge);
        }
      }
    }
    
    return completed;
  }

  private getTodayCycles(): number {
    // Sum cycles from active session + completed sessions today
    let totalCycles = 0;
    
    if (this.activeSession) {
      totalCycles += this.activeSession.cycles;
    }
    
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todaySessions = (this.stats.sessions || []).filter(s => 
      new Date(s.startedAt).getTime() >= todayStart
    );
    
    totalCycles += todaySessions.reduce((sum, s) => sum + s.cycles, 0);
    return totalCycles;
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
