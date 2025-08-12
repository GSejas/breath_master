# Ethics Alignment Mapping

This document maps each gamification mechanic to ethical design principles and guardrails.

| Mechanic | Principle Alignment | Risk | Mitigation |
|----------|---------------------|------|-----------|
| XP per cycle | Minimal Data / Transparency | Over-focus on numbers | Keep small & secondary |
| Time goals | Purpose Limitation / User Control | Escalation pressure | Always optional, 3 choices |
| Pledges | Autonomy / Intentionality | Self-shame on miss | Neutral outcome copy |
| Streak | Habit Support | Loss aversion | No harsh reset messaging |
| Level titles | Human Dignity | Identity over-attachment | Calm, poetic naming |
| Narrative layer | Engagement | Distraction | Toggle to suppress |
| Bonuses | Motivation | Reward chasing | Linear, capped values |
| Session history | Transparency | Data creep | Local-only, export/clear |

## Dark Pattern Avoidance
- No variable ratio rewards
- No scarcity timers
- No infinite scroll views
- No social comparison leaderboards

## Consent & Control
- Tracking opt-in only
- Pledge requires explicit initiation
- Time goal selection always user-driven

## Data Boundary
All structures stored in VS Code globalState under `breathMaster.*` keys; no network I/O.

## Future Additions Checklist
Before adding a mechanic, verify:
1. Does it increase pressure? If yes, redesign.
2. Is data stored minimal & transparent?
3. Can user disable or ignore it easily?
4. Does copy remain non-judgmental?

---
Ethical alignment is a living practice; revisit this map with each iteration.
