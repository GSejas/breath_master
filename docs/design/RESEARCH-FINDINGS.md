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
