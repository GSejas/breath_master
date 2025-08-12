# Breath Master Testing Guide

Purpose: Provide a practical manual QA checklist plus automated coverage tracking notes.

---
## 1. Manual QA Scenarios

### 1.1 Stretch Presets
- Start preset (Gentle Break) -> observe notifications.
- Switch modes: compact (on/off/auto), toggle quotes, icon style none.
- Cancel mid-way: no more notifications.
- Edge: attempt second start while active -> warning.

### 1.2 Challenges / Sessions
- Enable gamification; start short session; end early -> normal XP.
- Start pledged session; meet goal -> bonus XP & pledge honored note.
- Morning session before noon -> morning challenge auto-complete.
- Long session (or simulate) -> deep_session challenge completion.

### 1.3 Pledges
- Create pledge then cancel -> end session -> no multiplier.
- Pause/resume pledge session -> multiplier intact.

### 1.4 Tooltip Accuracy
- After each event verify: level bar, streak, time, pledge line, challenge counts, session state.
- Toggle showXP/showStreak/showSessionTimer individually off -> formatting still clean.

### 1.5 Gentle Reminders
- Set cadence high (idle) -> subtle status bar message appears (no popups).
- Start session -> reminders cease.
- Set cadence off -> none appear.

### 1.6 Data Export / Reset
- Export data -> open JSON -> contains stats + onboarding.
- Clear data -> values reset (level 1, streak 0).

### 1.7 Patterns & Intensity
- Cycle patterns through entire list; verify label matches pattern.
- Set custom pattern valid & invalid -> invalid rejected.
- Intensity extremes -> amplitude visual difference.

### 1.8 Stretch + Session Interaction
- Simultaneously run a preset & a session -> no conflicts.
- Cancel preset during session -> session unaffected.

### 1.9 Documentation Links
- README / DIAGRAMS conservation links open externally.
- Search commands -> no donation command present.

### 1.10 Edge/Resilience
- Rapid start/end sessions (race) -> no duplicate notifications.
- Restart VS Code -> persistent stats (unless cleared).
- Narrow window (optional) -> status bar truncates gracefully.

---
## 2. Automated Test Coverage Roadmap

Planned unit test targets (additional to existing):
| Area | Focus | Priority |
|------|-------|----------|
| Stretch formatting | parse & compact logic variants | High |
| Challenge edge | morning/deep/streak conditions | High |
| Pledge multiplier | honored vs not honored | High |
| Tooltip builder | conditional lines composition | Medium |
| Reminder scheduler | suppression during active session | Medium |
| Pattern cycle | correct next pattern order | Medium |
| Data export shape | required keys present | Low |

### 2.1 Adding Coverage
Vitest configuration updated to collect coverage. Run:
```
npm run test:cov
```
Generates coverage report (text + lcov) in `./coverage`.

Target thresholds (initial, lenient):
- Statements: 55%
- Branches: 45%
- Lines: 55%
- Functions: 50%

Increase gradually as new pure utility modules are extracted.

### 2.2 Suggested Refactors for Testability
- Extract stretch formatting into `src/engine/stretch-format.ts` (pure).
- Extract tooltip build logic into `src/engine/tooltip.ts` returning Markdown string.
- Introduce `Clock` interface for challenge timing / reminder scheduler.

### 2.3 Coverage Interpretation
- Low branches in challenge generation acceptable early (random slot logic).
- Focus first on deterministic pure helpers to raise baseline quickly.
- Ignore integration-heavy extension activation path (manual QA sufficient).

---
## 3. Manual Regression Checklist (Pre-Release)
- Build succeeds (npm run compile).
- Unit tests + coverage run green.
- Gamification disabled mode acts inert (no stats increment).
- No stray console errors in Developer Tools.
- README & marketplace excerpt aligned (no donation commands).

---
## 4. Issue Templates (Suggestion)
Open an issue with:
- Repro steps
- Expected vs Actual
- Logs / screenshots (if applicable)
- VS Code & Extension version

---
## 5. Escalation Path
1. Confirm reproducibility with fresh data reset.
2. Capture minimal scenario (strip unrelated settings).
3. Tag component: breathing | session | pledge | challenge | stretch | reminder | doc.
4. Add to CHANGELOG once fixed.

---
## 6. Future Enhancements
- Add playwright-driven UI smoke (optional, low priority).
- Snapshot test tooltip Markdown.
- Lint rule to block accidental donation command reintroduction.

---
Happy mindful testing. 🌳
