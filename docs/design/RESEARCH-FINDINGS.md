# Evidence & Research Findings (v0.2.2)

Curated synthesis of external evidence informing current and upcoming Breath Master design decisions. Organized by theme with actionable implications.

## 1. Timing & Dose
- Session timing: Just-in-time during stress yields immediate affect relief; calm benefits flexible across day. (Bolinski 2025)
- Morning + consistent timing predicts longer-term adherence. (Berardi 2023)
- Minimal effective dose: 5–10 min/day slow or breathwork practice over 2–4 weeks improves mood, stress, anxiety; small–medium effects. (Yilmaz Balban 2023; Zou 2023)
- Micro-break (≤2–3 min) sessions produce acute stress & rumination reductions; potential gateway, no cannibalization evidence. (Schwerdtfeger 2025)

Design Implications:
- Offer “Start When Stressed” quick action.
- Nudge toward a consistent preferred time (gentle morning anchor) after 5 sessions.
- Highlight science-backed 5–10 min daily target in pledge UI.
- Track micro-break to longer-session conversion funnel.

## 2. Breathing Pattern Personalization & Guidance
- Individual resonance pacing (≈4.5–6.5 bpm personalized) improves HRV vs static averages. (Spalding 2025; Zaccaro 2018)
- Adaptive/JIT prompts triggered by low HRV amplify benefits vs random timing. (Schwerdtfeger 2025)
- Longer exhalation or balanced coherent breathing common in effective protocols; limited superiority for complex visuals.
- Audio guidance prevalent in successful trials; direct audio vs silent visual comparisons scarce. (Zou 2023)

Design Implications:
- Future: Resonance scan experiment (progressively sample comfortable paces, pick HRV surrogate best).
- Keep visuals minimal by default; optional “rich” theme toggle.
- Provide optional soft auditory cues (off by default, highlight potential adherence help).
- Consider adaptive suggestion engine once lightweight HRV proxy or behavioral signal (abort rate) exists.

## 3. UX Friction & Early Abandonment
- Ultra-short (1 min) guided tasks can deliver measurable affect benefit, implying early abandonment often friction/context rather than inefficacy. (Schwerdtfeger 2025)
- Predictors of <60s abandonment underreported—evidence gap.

Design Implications:
- Instrument first 60s: capture abort reason codes (manual stop, window change, pattern tweak).
- Progressive disclosure: hide advanced settings until 3+ completions.

## 4. Gamification Ethics & Messaging
- Compassion/self-compassion framing preserves or elevates HRV vs self-critical framing which depresses it. (Steffen 2021)
- Identity-based commitments increase habit persistence in broader behavior literature; direct breath app RCT lacking.
- Growth framing after missed days likely superior to guilt/shame. (Steffen 2021)

Design Implications:
- Missed-day toast: “Growth takes pauses—ready to breathe again?”
- Pledge wording variant test: Identity (“I am a steady breather”) vs Impact (“I will restore daily calm”).
- Avoid any copy implying loss or failure; use regrowth metaphor.

## 5. Challenges, Notifications & Achievement Delivery
- Consistent timing improves adherence; batching achievements evidence limited but notification overload risk noted. (Huckins 2024)
- No established frequency threshold; user control and context awareness recommended. (Huberty 2023)

Design Implications:
- Maintain current staggered challenge toasts; prototype achievement batching A/B.
- Add notification frequency preference (daily max reminders).
- Delay non-critical achievement toasts if a session completion dialog is active.

## 6. Accessibility & Visual Ergonomics
- Dark mode preference strong in low light; must ensure contrast without harsh glare. (NNG 2023)
- Low-motion / simplified visual impact unstudied (gap).

Design Implications:
- Add contrast-safe palette audit; avoid pure #000 for large areas.
- Provide “Low Motion” toggle (reduce scaling/opacity transitions).
- Log adoption & completion delta for low-motion users.

## 7. Social Proof, Feedback & Reflection
- Progress visuals motivate; aggregate community milestones plausibly supportive though direct causal evidence thin. (Crane 2025)
- Single-question mood or affect check may aid reflection; survey fatigue risk if overused. (Huberty 2023; Crane 2025)

Design Implications:
- Add optional weekly community stat (“Collective minutes breathed this week”).
- Offer opt-in 1Q post-session mood slider (throttle: max 1/day).

## 8. Privacy & Trust
- Privacy/security concerns common adoption barrier; transparency and local control valued. (Huberty 2023)

Design Implications:
- Default local-only; explicit consent gate for any future sync.
- Plain-language data usage section in user guide.

## 9. Key Evidence Gaps (Internal Experiment Targets)
1. Visual complexity vs minimal pacing (entrainment, distraction score).
2. Audio cues ON/OFF impact on adherence & early abort rate.
3. Early customization (pattern tweak) effect on 30-day retention.
4. Micro-break laddering: conversion to ≥5 min sessions.
5. Achievement batching vs immediate multi-toast (next-day session delta).
6. Ramp-in pace for anxious users aborting early.
7. Low-motion mode effect on completion & comfort.
8. Single-key quick start effect on daily active sessions.
9. 1Q mood check influence on reflective adherence.
10. Notification frequency dose-response (mute/disable threshold).

## 10. Immediate Roadmap Recommendations (Post v0.2.2)
- v0.2.3: Low Motion mode, notification frequency setting, experiment scaffolding (abandonment logging, basic A/B infra).
- v0.2.4: Audio cue toggle + visual minimal vs rich theme A/B.
- v0.2.5: Resonance pacing prototype (behavioral surrogate) & identity pledge test.

## Source References
Bolinski 2025; Yilmaz Balban 2023; Zou 2023; Schwerdtfeger 2025; Spalding 2025; Zaccaro 2018; Steffen 2021; Huckins 2024; Huberty 2023; Berardi 2023; Macrynikola 2024; Nielsen Norman Group 2023; Crane 2025.

(Full citation URLs retained in internal research notes; abbreviations used here for brevity.)

## Glossary of Terms

### A
 - Adaptive Prompting – Dynamically triggering an intervention (e.g., breathing session) based on a real‑time or near real‑time signal (physiological proxy, behavior) to maximize contextual relevance.
 - Activation Event – A VS Code extension lifecycle hook that determines when the extension code is loaded (e.g., `onStartupFinished`).
 - Adherence – Degree to which a user follows a suggested protocol (minutes/day, sessions/week, or goal completion %).
 - Affect Check – A lightweight self‑report (often 1 question) capturing current mood or emotional state post‑session.
 - Amplitude (Breathing Engine) – Normalized scalar (0–1) representing current position within the inhalation/exhalation waveform used to drive UI animation intensity.
 - Async Determinism – Technique of structuring asynchronous code (promises, timers) so tests can assert outcomes without race conditions (e.g., polling predicates rather than fixed sleeps).

### B
 - Batching (Notifications) – Aggregating multiple achievement or challenge messages into a single surface to reduce cognitive load and alert fatigue.
 - Behavioral Funnel – Sequential user progression (e.g., micro‑break → pledged session → stretch preset) used to analyze conversion.
 - Breathing Cycle – Complete sequence of inhale → (optional hold) → exhale → (optional pause).
 - Breathing Pattern – Structured timing schema for inhale, hold, exhale, pause phases (e.g., 4‑7‑8‑0).
 - Burn‑In (Metric) – Initial stabilization period excluded from longitudinal analysis to avoid skew from onboarding novelty.

### C
 - Cadence (Reminder) – Average scheduled frequency of background encouragement messages (low/standard/high).
 - Challenge – Time‑bounded, XP‑rewarded task surfaced to promote engagement variety (e.g., “Complete 3 micro sessions today”).
 - Coherent Breathing – Slow, evenly balanced breathing around the individual’s resonance frequency producing increased heart rate variability (HRV) coherence.
 - Completion Dialog – Actionable notification shown at the terminus of a session or stretch preset offering follow‑up choices.
 - Context Entropy (Temporal) – Measure of variability in when a user launches sessions (high entropy = irregular timing).
 - Coverage (Journey) – Percentage of canonical steps for a defined high‑value journey that have occurred at least once in telemetry or internal tracker.
 - Cycle Adherence – Degree to which user’s actual breathing sync (estimated indirectly) matches the guided pattern timing.

### D
 - Dark Mode Ergonomics – UX principle ensuring reduced glare and appropriate contrast in low‑light conditions; not equivalent to “pure black.”
 - Deterministic Clock – Test abstraction replacing real time with controllable virtual time (e.g., fake timers) for predictable outcomes.
 - Drop‑Off (Early Abandonment) – User terminates or leaves a session within an initial threshold (e.g., first 60 seconds).

### E
 - Entrainment – Process by which the user’s respiration synchronizes with the guided pacing stimulus.
 - Evidence Gap – Design or product area with insufficient published or internal data requiring experiment.
 - Exploratory Testing – Manual probing of novel or complex UX beyond scripted test coverage.
 - Export Boundary – Controlled interface for exporting local data with explicit privacy setting enabling the action.

### F
 - Fake Random (Seeded RNG) – Reproducible random sequence used in tests to stabilize variation (e.g., challenge selection ordering).
 - Fidelity (Intervention) – Degree to which delivered breathing guidance matches experimental or theoretical parameters.
 - Focus Reset – Short combined breath + posture sequence intended to restore attentional control quickly.
 - Friction (UX) – Any interactional overhead increasing cognitive or time cost prior to session initiation (extra dialogs, unclear labels, long lists).

### G
 - Gamification Layer – Systemic augmentation (XP, levels, streaks, challenges, pledges) designed to encourage sustained, ethical engagement.
 - Gateway Effect (Positive) – Phenomenon where micro‑interventions increase probability of later, longer interventions.
 - Goal Bonus XP – Extra XP awarded for meeting or exceeding a pre‑selected session goal.
 - Growth Framing – Messaging style emphasizing progress, learning, and resilience over loss or failure.

### H
 - HRV (Heart Rate Variability) – Variation in time between heartbeats; often elevated by slow, coherent breathing and used as a resilience proxy.
 - HRV Proxy (Behavioral) – Indirect measure (e.g., sustained session duration, reduced early aborts) used when direct biometric data unavailable.

### I
 - Identity‑Based Pledge – Commitment statement framed in terms of self‑concept ("I am a steady breather") rather than only outcome.
 - Idle Reminder – Low‑intrusion message delivered only when no active session is running.
 - Instrumentation – Implementation of structured event logging or tracking to observe in‑product behaviors.
 - Interval Jitter – Randomized offset in scheduling (e.g., reminders) to reduce user habituation.

### J
 - Journey – Defined end‑to‑end user behavior path representing product value (e.g., pledge honored session).
 - Journey Coverage Tracker – Internal module persisting which steps of core journeys have been performed to identify testing or usage gaps.
 - JIT (Just‑In‑Time) Intervention – Triggered precisely when a contextual cue (stress signal, inactivity) indicates maximum potential benefit.

### K
 - Key Outcome Metric (KOM) – Primary quantitative measure indicating success for a feature experiment (e.g., session completion rate, pledge honor rate).
 - Knowledge Debt – Accumulated set of unanswered evidence gaps potentially risking misaligned features.

### L
 - Laddering (Habit) – Strategy where small actions intentionally lead to larger, sustained habits (micro session → standard session).
 - Latency (UX Feedback) – Time between user action and feedback surface (should be minimal for start/end confirmations).
 - Local‑Only Mode – Privacy configuration restricting all data to local storage with no external transmission.

### M
 - Micro‑Break Session – Very short (≤3 min) guided breathing intended for acute regulation or focus restoration.
 - Minimal Pattern Display – Reduced visual representation focused on timing cues without decorative color animations.
 - Momentum Metric – Composite indicator combining streak status, recent session frequency, and pledge honor %.
 - Mood Slider – Single‑item affect capture UI (often 5–11 point semantic differential).

### N
 - Notification Fatigue – User desensitization or annoyance due to excessive frequency or perceived irrelevance of alerts.
 - Nudging – Subtle UI intervention encouraging beneficial behavior without coercion (e.g., gentle morning anchor suggestion).

### O
 - Onboarding Manager – Component tracking initial user progression to deliver or suppress tutorial flows appropriately.
 - Outcome Framing – Messaging structured around resulting benefits ("restore daily calm") as opposed to identity or process.
 - Overhead (Test) – Combined time cost of environment boot, dependency load, and scenario execution within CI.

### P
 - Pacing Visual – Animated element encoding breathing rhythm (icons resizing, phase arrows) to aid entrainment.
 - Pledge – Intentional time/goal commitment offering conditional bonus XP when honored (neutral if unmet).
 - Pledge Honored – State where session goal equals or exceeds pledged target with no cancellation.
 - Privacy Boundary – Guardrail ensuring sensitive data (meditation stats) remains within user's machine unless explicit export permission given.
 - Progress Visual – UI element showing advancement (level bar, time logged, streak) reinforcing continued engagement.

### Q
 - Quick Pledge Command – Single command palette entry combining pledge selection and session start to reduce friction.
 - Qualitative Insight – Non‑numerical user feedback (e.g., interview quotes) used to contextualize quantitative metrics.

### R
 - Randomization (Experiment) – Assigning users or sessions to different treatment variants to test causal impact.
 - Resonance Frequency – Individual breathing rate (approx. 4.5–6.5 breaths/min) maximizing baroreflex and HRV amplitude.
 - Retention Cohort – Group of users starting in the same period tracked over time for continued engagement metrics.
 - Roadmap Recommendation – Prioritized design or development action derived from synthesized evidence.

### S
 - Session Goal – Target duration a user aims to reach during a meditation session.
 - Snapshot Assertion – Stored serialized state (config/data) compared in tests; should be small and stable to avoid flake.
 - Staggered Notification – Sequenced delivery of multiple toasts spaced to reduce overlap and overload.
 - Streak – Count of consecutive days with at least one qualifying session.
 - Stretch Preset – Time‑distributed sequence of mobility prompts scheduled during coding work.
 - Surrogate Metric – Indirect measure predicting a harder‑to‑measure outcome (e.g., early abort reduction as proxy for comfort).

### T
 - Telemetry Adapter – Indirection layer enabling swap between real analytics and test capture sink.
 - Temporal Consistency – Regularity of session start times (low entropy = high consistency).
 - Test Pyramid – Distribution strategy: many unit tests, fewer integration, minimal essential end‑to‑end.
 - Time Provider – Abstraction exposing current time allowing deterministic manipulation in tests.
 - Titration (Ramp‑In) – Gradual adjustment (e.g., slightly faster initial breathing pace) to enhance comfort for sensitive users.
 - Toast – Transient notification UI surface (VS Code information message) with optional action buttons.

### U
 - Usage Entropy – Statistical dispersion of user event timing; used to identify routine formation.
 - User Journey Coverage – Proportion of defined journeys executed at least once in a period; helps target test or feature gaps.
 - UX Debt – Accumulated unresolved usability issues affecting cognitive load or clarity.

### V
 - Variance Reduction – Experimental design technique (blocking, paired comparisons) to reduce noise and increase statistical power.
 - Visual Complexity Index – Relative heuristic score of animation density, color changes, and textual elements in guidance UI.

### W
 - Wellbeing Metric – Subjective or objective indicator of stress, calm, focus, or mood tracked longitudinally.
 - Window of Opportunity – Contextual time span where a prompt is likely to be accepted (e.g., post-task completion idle window).

### X
 - XP (Experience Points) – Quantitative progression token awarded for session completion, challenges, and goal/pledge honors.
 - XP Multiplier – Scalar applying bonus XP when pledge conditions are met.

### Y
 - Yield (Experiment) – Ratio of actionable insights produced relative to experiment runtime and user exposure cost.

### Z
 - Zero Data Sync – Principle where no personal telemetry leaves the device unless explicitly exported or user toggles future sync feature.
 - Z‑Index (Metaphorical) – Prioritization layer stacking multiple notifications; here managed by sequencing rather than literal CSS stacking.

### Symbols & Abbreviations
 - HRV – Heart Rate Variability.
 - bpm – Breaths per minute (in this context) or beats per minute (cardiac) – disambiguate in UI.
 - JIT – Just‑In‑Time.
 - XP – Experience Points.
 - CI – Continuous Integration.
 - RCT – Randomized Controlled Trial.
 - UI / UX – User Interface / User Experience.
 - JSON – JavaScript Object Notation (structured export format).

---

Glossary Maintenance: Review each minor release; add new terms with succinct, actionable definitions; prune deprecated feature names after removal.

