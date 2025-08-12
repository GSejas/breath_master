# Progression & Adaptive Time Goals

This document defines how session time goals scale alongside level progression while preserving user agency and avoiding compulsive escalation.

## Design Principles
- Gentle Scaling: Time expectations widen; never force increases.
- Choice Set Size: Always exactly 3 quick-pick options → fast, balanced, deep.
- Unlocks, Not Demands: New durations appear; old ones remain.
- No Punishment: Choosing shorter sessions still grants proportional XP.
- Calm Copy: Avoid pressure words ("grind", "maximize").

## Goal Option Matrix
| Level Band | Label Framing | Options (min) | Default | Rationale |
|------------|---------------|---------------|---------|-----------|
| 1–2 | Getting Started | 3 / 5 / 10 | 5 | Onboarding comfort |
| 3–4 | Settling In | 5 / 10 / 15 | 10 | Expands depth gently |
| 5–6 | Deep Practice | 10 / 15 / 20 | 15 | Longer focus emerges |
| 7 | Flow Expansion | 15 / 20 / 25 | 20 | Advanced pacing |
| 8 | Mastery Range | 20 / 30 / 40 | 30 | Sustained optional flow |

All earlier options remain accessible via a "Custom..." future enhancement if desired.

## XP Mapping
Base XP = Breathing Cycles (unchanged)
Bonus XP = Time Goal Multiplier
```text
Completion % = activeSessionMs / (goalMinutes * 60_000)
If Completion % ≥ 1.0 → Goal Achieved Bonus = + (goalMinutes * 0.5) XP (flat)
Partial Credit → (Completion % * goalMinutes * 0.5) XP (linear, capped at full bonus)
```
Ethical Guardrail: No streak multipliers stacking on goal multipliers (to avoid runaway compulsion).

## UI Surfacing
- Status bar when idle (tracking enabled): "Goal: 5m (Tap to change)"
- During session: Timer only (avoid clutter). Tooltip includes goal.
- On completion toast: "Session 12m • Goal 10m Achieved • +5 bonus XP" [Start Another] [Change Goal]

## Configuration (Planned)
```jsonc
{
  "breathMaster.sessionGoal.autosuggest": true, // show adaptive suggestion when level changes
  "breathMaster.sessionGoal.rememberLast": true, // prefer last manually chosen
  "breathMaster.sessionGoal.showInStatus": true  // toggle goal display
}
```

## Edge Cases
| Case | Handling |
|------|----------|
| User stops early | Apply proportional bonus |
| User exceeds goal | Cap bonus at 100% completion; extra time still earns cycle XP |
| Goal changed mid-session | Recalculate baseline from new goal start timestamp |
| Level down (never happens) | No change; system only adds |

## Data Additions
```ts
interface SessionRuntimeState {
  goalMinutes: number;
  goalStartAt: number;  // epoch ms
  accumulatedActiveMs: number;
  bonusApplied: boolean;
}
```

## Example Calculation
Level 5 user selects 15m goal.
Completes 12m active time.
Completion % = 12/15 = 0.8 → Bonus XP = 0.8 * (15 * 0.5) = 6 XP.

---
Supports habit formation by offering meaningful but gentle commitments.
