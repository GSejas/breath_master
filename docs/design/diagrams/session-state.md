# Session State Machine

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Running: startSession
  Running --> Paused: pause
  Paused --> Running: resume
  Running --> Idle: stopSession
  Paused --> Idle: stopSession
  Running --> AutoPaused: idleTimeout
  AutoPaused --> Running: activity
  AutoPaused --> Idle: stopSession
```

ASCII Abstract:
```
[*] -> Idle -> Running <-> Paused
              |            ^
              v            |
           AutoPaused ------
              |
             Idle
```

Each transition is user-driven except idleTimeout (optional feature). No punitive transitions.
