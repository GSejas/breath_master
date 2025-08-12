# Gamification System Overview

The Breath Master gamification layer is intentionally calm, opt-in, and ethically constrained. It rewards consistent mindful engagement without triggering compulsive loops.

## Core Pillars
1. Respect Autonomy – User chooses whether to engage; no lock-ins.
2. Support Mindful Habits – Gentle reinforcement for presence, not grinding.
3. Minimize Cognitive Load – Single status bar control; low-interruption messaging.
4. Transparent Value – XP mapping and progression are explicit.
5. Elastic Goals – Goals scale with user growth but remain optional.

## Components
- Levels (1–8) culminating in "Breath Master" identity.
- XP from completed breathing cycles during active sessions.
- Streak tracking (days with any meaningful session > 1 minute).
- Session Goals (adaptive time goals unlocked with levels).
- Pledges (self-chosen commitment contracts that amplify XP if honored).
- Narrative Framing (world-building metaphors that remain subtle and ignorable).

## User Journey Snapshot
| Phase | Player Identity | Focus | Gamification Surface |
|-------|-----------------|-------|----------------------|
| Onboarding | Curious Coder | Try breathing | Single welcome prompt |
| Habit Formation | Mindful Rookie → Calm Coder | Build consistency | Streak + Level tooltip |
| Deepening | Zen Developer → Breathing Sage | Longer intentional sessions | Time Goal selector |
| Mastery | Code Mystic → Breath Master | Self-directed flow | Optional pledge contracts |

## Opt-In Flow
1. Install extension → breathing works immediately.
2. Single welcome prompt offers enabling tracking.
3. If enabled: XP + streak + session timer appear.
4. Pledges and advanced goals only shown after Level ≥ 3.

## Non-Dark Pattern Guardrails
- No variable ratio reward schedules.
- No urgency countdowns.
- No loss framing; streak protects previous longest streak in UI.
- All reminders rate-limited and user-configurable.

## Data Model Extensions (Planned)
```ts
interface SessionGoalProfile {
  levelMin: number;              // minimum level to unlock
  optionsMinutes: number[];      // selectable goal durations
  defaultMinutes: number;        // preselected default
}

interface ActivePledge {
  id: string;
  createdAt: string;
  goalMinutes: number;
  multiplier: number;            // XP multiplier (e.g. 1.15)
  expiresAt?: string;            // optional horizon
  completed?: boolean;
  broken?: boolean;
}
```

## Future Safe Extensibility
- Session history panel (optional, not default UI).
- Breath pattern analytics (on-device only).
- Positive reflection prompts (weekly, opt-in).

---
See detailed breakdowns in individual documents.
