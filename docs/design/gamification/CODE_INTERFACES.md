# Code Interface Specification (Gamification Layer)

This document enumerates the primary TypeScript interfaces, types, and methods exposed internally for the Breath Master gamification system (version 0.2.0).

## Data Interfaces

```ts
interface MeditationStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  todaySessionTime: number;      // ms accumulated today
  lastMeditationDate: string;    // toDateString()
  totalMeditationTime: number;   // lifetime ms
  sessionsToday: number;         // count of sessions completed today
  sessions?: SessionRecord[];    // historical sessions (optional for older data)
  lastGoalMinutes?: number;      // last chosen time goal
}

interface MeditationLevel {
  level: number;      // 1..8
  title: string;      // level name
  xpRequired: number; // threshold cumulative XP
  icon: string;       // emoji icon
}

interface SessionRecord {
  id: string;                 // unique session id
  startedAt: string;          // ISO timestamp
  endedAt: string;            // ISO timestamp
  activeMs: number;           // active time (excludes pauses)
  cycles: number;             // breathing cycles counted
  goalMinutes?: number;       // selected goal (if any)
  goalBonusXP?: number;       // XP from time goal completion fraction
  pledgeMultiplier?: number;  // applied pledge multiplier
  finalXP: number;            // total XP after session ends
  pledgeHonored?: boolean;    // whether pledge criteria met
}

type SessionState = 'idle' | 'running' | 'paused';

interface ActiveSessionRuntime {
  id: string;
  startedAt: number;          // epoch ms
  lastResumeAt: number;       // epoch ms (for accumulating active time)
  accumulatedActiveMs: number;// sum of active intervals
  cycles: number;
  state: SessionState;
  goalMinutes?: number;
  bonusApplied: boolean;      // reserved for future incremental bonus awarding
}

interface ActivePledge {
  templateId: string;  // semantic id e.g. pledge-15m-15
  startedAt: string;   // ISO
  goalMinutes: number; // pledge target duration
  multiplier: number;  // XP multiplier if honored (e.g. 1.15)
  completed?: boolean; // true if resolved (honored or not)
  cancelled?: boolean; // true if user cancelled
}
```

## Core Class: MeditationTracker

Selected public / de-facto public methods (stable intent; internal structure may evolve):

```ts
constructor(storageKey?: string, storage?: GlobalMementoLike)
getStats(): MeditationStats
getCurrentLevel(): MeditationLevel
getProgressToNextLevel(): { current: number; required: number; percentage: number }
formatSessionTime(ms: number): string
getGamificationDisplay(): { primary: string; secondary: string }
reset(): void

// Legacy hover tracking (compat layer)
startHovering(): void
stopHovering(): void
onBreathingCycleComplete(): void

// Sessions
getGoalOptions(): { options: number[]; defaultMinutes: number }
startSession(goalMinutes?: number): { started: boolean; reason?: string; session?: ActiveSessionRuntime }
pauseSession(): boolean
resumeSession(): boolean
endSession(): SessionRecord | null
getActiveSession(): ActiveSessionRuntime | null
getSessionStatusBarText(): string

// Pledges
makePledge(goalMinutes: number, multiplier?: number): { ok: boolean; reason?: string; pledge?: ActivePledge }
cancelPledge(): boolean
getActivePledge(): ActivePledge | null
```

## Behavior Notes
- XP is added immediately per cycle (1 XP).
- Time goal bonus XP is calculated upon session end (linear partial credit).
- Pledge multiplier currently only marks pledgeHonored; multiplier hook reserved for future composite reward layering.
- Streak increments on first qualifying meditation time each new day; no punitive messaging.

## Extension Integration Points
- Status bar shows combined gamification + session/goal state via `getSessionStatusBarText`.
- Commands (start/pause/resume/end/change goal / pledge actions) orchestrate session lifecycle.

## Future Stability Guarantees
Additions will be backward-compatible; removals or signature changes will be version-gated and documented in CHANGELOG.

---
This spec provides a stable reference for adding tests, UI layers, or external documentation.
