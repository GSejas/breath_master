# Game Theory & Incentive Design

The Breath Master system uses *soft commitments* and *linear transparent rewards* (giving users/humans, `gamified agency`) to avoid exploitative reinforcement structures (patterns we are tring to `unlearn`).

## Design Goals
- Encourage consistent mindful engagement
- Avoid variable ratio dopamine loops
- Make reward math legible & predictable
- Support escalating mastery without coercion

## Core Mechanisms
| Mechanism | Type | Incentive Rationale | Anti-Exploitation Safeguard |
|-----------|------|---------------------|-----------------------------|
| XP per Cycle | Linear | Rewards actual breathing presence | Small value; can't be farmed via idle |
| Time Goal Bonus | Linear capped | Encourages completing an intentional block | Proportional; no jackpots |
| Pledge Multiplier | Fixed % | Ritualizes intention & reflection | Available only at higher levels |
| Streak | Daily Boolean | Habit salience | No punishment; streak loss not dramatized |

## Why Not Variable Ratio?
We intentionally reject slot-machine reward timing. All reinforcement is deterministic or proportional so user can *predict outcome* → reduces compulsive checking.

## Utility Curve Adoption
We assume diminishing marginal utility of XP beyond habit anchor. Therefore pacing becomes flatter at high levels—progress remains meaningful but less central to experience.

## Formal Reward Model
```
Let C = cycles completed during active session
Let G = goalMinutes (optional)
Let B_time = min(1, activeMs / (G*60k)) * (G * 0.5)
Let baseXP = C
Let XP_total_prePledge = baseXP + B_time
If pledge honored: XP_total = round(XP_total_prePledge * pledgeMultiplier)
Else: XP_total = XP_total_prePledge
```
No cross-multiplying with streak to avoid runaway growth.

## Contract Framing
Pledges behave like *voluntary pre-commitment* (game theory): increases completion likelihood via identity alignment, not external penalty.

## Failure Handling
Failure to complete a pledge yields neutral outcome (no XP multiplier). Neutral outcomes reduce shame loops; user more likely to re-engage.

## World Cohesion
Level titles map to a journey archetype; progression speed tuned for early momentum then spaced for reflection.

## Exploit Checks
| Exploit Attempt | Mitigation |
|-----------------|------------|
| Start/stop spam for XP | Minimum session length for time bonus; cycles required |
| Fake long sessions (idle) | Optional idle auto-pause (future) |
| Inflating pledge multiplier | Multipliers capped (e.g., ≤ 1.25) and predefined |

---
Transparent, predictable, agency-centered incentives encourage sustainable use.
