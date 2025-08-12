# Pledge & Commitment Contracts

A lightweight, self-directed mechanic allowing users to *intentionally* commit to a mindful focus block. No penalties for failure—only scaled rewards for honoring a pledge.

## Purpose
Shift intrinsic commitment into a gentle ritual, reinforcing autonomy and intention rather than compliance.

## Ethical Constraints
- No countdown anxiety
- No loss aversion or penalty framing
- Cancel anytime (counts as neutral, not failure)

## Flow
1. User (Level ≥ 3) chooses "Make a Pledge"
2. Quick pick: Select Goal (from adaptive set) + Optional Reflection Tag ("focus", "calm", "reset")
3. System displays confirmation message (non-modal): "Pledge started: 10m focus • +15% XP if honored"
4. Completion: When goal reached → bonus applied; toast with reflective, non-judgmental copy.
5. Early Stop: Toast: "Session ended early—still progress. Continue when ready." (no negative feedback).

```
Minimal Interface Flow
User clicks gamification bar
   ↓
If session active -> Quick Controls (Pause / Resume / End / Pledge)
Else -> Goal Select / Pledge Start
   ↓
Session Running -> cycles tracked -> XP + Challenges auto progress
   ↓
End Session -> XP calc (+pledge bonus if honored)
```

## Data Model
```ts
interface PledgeTemplate {
  id: string;            // e.g. goal-10m-v1
  multiplier: number;    // 1.15 = +15%
  minLevel: number;      // unlock gating
}

interface ActivePledge {
  templateId: string;
  startedAt: string;
  goalMinutes: number;
  reflectionTag?: string;
  multiplier: number;
  completed?: boolean;
  cancelled?: boolean;
}
```

## XP Application
```
baseXP = cycleXP + timeBonusXP
if (pledge.completed) totalXP *= multiplier (rounded)
```

## UI Elements
- Command: "Breath Master: Make Pledge"
- Status Bar (if active): Adds small badge 🔒 or 🎯 (configurable) → tooltip explains pledge.
- Completion toast: "Pledge honored: 15m calm • +15% bonus"

## Copy Guidelines
Positive, reflective, non-performative.
| Event | Example Copy |
|-------|--------------|
| Start | "Intention set: 10m focus. Breathe into it." |
| Complete | "Intention honored. Full presence for 10m." |
| Early stop | "You paused early—that's okay. Return when ready." |
| Cancel | "Pledge cleared. Your practice is still valid." |

## Edge Cases
- Starting new pledge while one active → prompt to replace or keep current.
- Changing goal mid-pledge → treat as new pledge.
- App reload mid-pledge → restore state from storage.

---
Pledges encourage mindful agency, not extrinsic pressure.
