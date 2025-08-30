![Integration Architecture Banner](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIAogICAgPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFmMjkzNyIvPgogICAgICA8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIyIiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjMiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2siIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbnRlZ3JhdGlvbiBBcmNoaXRlY3R1cmU8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMTBiOTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EYXRhIEZsb3cgJiBTeXN0ZW0gUGF0dGVybnM8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNykiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfj5fvuI8gQ29tcG9uZW50IEludGVyYWN0aW9uIE1hcHM8L3RleHQ+Cjwvc3ZnPg==)

**Date:** August 29, 2025  
**Focus:** Data flow and integration patterns in the refactored command system

## System Integration Overview

```mermaid
graph TB
    subgraph "VS Code Extension Host"
        A[extension.ts]
        B[CommandRegistry]
        C[StatusBar Items]
    end
    
    subgraph "Core Engines"
        D[BreatheEngine]
        E[MeditationTracker]
        F[OnboardingManager]
        G[VSCodeSettingsAdapter]
    end
    
    subgraph "Command Modules"
        H[SessionCommands]
        I[BreathingCommands]
        J[GamificationCommands]
        K[UtilityCommands]
    end
    
    subgraph "UI Components"
        L[MicroMeditationBar]
        M[StatusBarDisplay]
        N[NotificationSystem]
    end
    
    A --> B
    B --> H
    B --> I
    B --> J
    B --> K
    
    H --> E
    I --> D
    J --> E
    K --> F
    
    E --> M
    D --> M
    L --> E
    
    H --> N
    I --> N
    J --> N
    K --> N
```

## Command Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant VSC as VS Code
    participant CR as CommandRegistry
    participant CMD as Command
    participant CTX as CommandContext
    participant ENG as Engine/Tracker
    participant UI as UI System
    
    U->>VSC: Trigger Command
    VSC->>CR: Execute Command ID
    CR->>CMD: Call Command Function
    CMD->>CTX: Access Dependencies
    CTX->>ENG: Perform Business Logic
    ENG->>CTX: Return Results
    CMD->>UI: Show Auto Message
    UI->>U: Display Feedback
    CMD->>VSC: Return Success
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        A1[Command Palette]
        A2[Status Bar Click]
        A3[Keyboard Shortcut]
        A4[Context Menu]
    end
    
    subgraph "Command Processing"
        B1[Command Router]
        B2[Parameter Validation]
        B3[Context Resolution]
    end
    
    subgraph "Business Logic"
        C1[Session Management]
        C2[Settings Updates]
        C3[State Persistence]
        C4[Gamification Logic]
    end
    
    subgraph "Output Layer"
        D1[Status Messages]
        D2[UI Updates]
        D3[State Storage]
        D4[Animation Control]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    
    B1 --> B2
    B2 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
    B3 --> C4
    
    C1 --> D1
    C1 --> D2
    C2 --> D3
    C4 --> D4
```

## Command Dependencies Matrix

| Command Category | MeditationTracker | OnboardingManager | Settings | BreatheEngine | StatusBar |
|------------------|-------------------|-------------------|----------|---------------|-----------|
| **Session**      | ✅ Primary        | ⚠️ Reminders     | ✅ Goals  | ❌            | ✅        |
| **Breathing**    | ❌                | ❌                | ✅ Patterns | ✅ Primary   | ✅        |
| **Gamification** | ✅ Primary        | ⚠️ Tour Status   | ⚠️ Privacy | ❌           | ✅        |
| **Data**         | ✅ Export/Clear   | ✅ Export/Clear   | ⚠️ Privacy | ❌           | ⚠️        |
| **Internal**     | ✅ Stop Logic     | ❌                | ❌        | ⚠️ Stop      | ✅        |

**Legend:**
- ✅ Primary dependency (command cannot function without)
- ⚠️ Conditional dependency (used in specific scenarios)
- ❌ No dependency

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> SessionActive: startSession
    Idle --> StretchActive: startStretch
    Idle --> MicroActive: startMicro
    
    SessionActive --> SessionPaused: pauseSession
    SessionPaused --> SessionActive: resumeSession
    SessionActive --> Idle: endSession
    SessionActive --> Idle: stopAny
    
    StretchActive --> Idle: cancelStretch
    StretchActive --> Idle: stopAny
    
    MicroActive --> Idle: microComplete
    MicroActive --> Idle: stopAny
    
    state SessionActive {
        [*] --> Running
        Running --> XPCalculation: onEnd
        XPCalculation --> PledgeCheck
        PledgeCheck --> StatUpdate
        StatUpdate --> [*]
    }
```

## Message Flow Architecture

```mermaid
graph TB
    subgraph "Message Sources"
        A1[Command Success]
        A2[Command Error]
        A3[State Changes]
        A4[Timer Events]
    end
    
    subgraph "Message Processing"
        B1[showAutoMessage]
        B2[Duration Timer]
        B3[Status Bar Manager]
        B4[Info Message]
    end
    
    subgraph "Display Systems"
        C1[Status Bar Text]
        C2[Toast Notification]
        C3[Progress Indicator]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    
    B1 --> B2
    B1 --> B3
    B1 --> B4
    
    B3 --> C1
    B4 --> C2
    B2 --> C3
```

## Error Handling Flow

```mermaid
graph TD
    A[Command Execution] --> B{Error Occurs?}
    B -->|No| C[Success Message]
    B -->|Yes| D[Error Type Check]
    
    D --> E{User Error?}
    D --> F{System Error?}
    D --> G{Validation Error?}
    
    E -->|Yes| H[Friendly User Message]
    F -->|Yes| I[Technical Error + Fallback]
    G -->|Yes| J[Input Correction Prompt]
    
    H --> K[showAutoMessage]
    I --> L[Console.error + showAutoMessage]
    J --> M[Re-prompt User]
    
    C --> N[Auto-disappear in 9s]
    K --> N
    L --> N
```

## Performance Optimization Points

### Command Registration Optimization

```mermaid
graph LR
    A[Extension Activation] --> B[Batch Registration]
    B --> C[Dependency Resolution]
    C --> D[Command Factory Creation]
    D --> E[VS Code Registration]
    
    subgraph "Optimization Techniques"
        F[Lazy Loading]
        G[Dependency Injection]
        H[Factory Pattern]
        I[Batch Processing]
    end
    
    B -.-> I
    C -.-> G
    D -.-> H
    E -.-> F
```

### Memory Management Flow

```mermaid
graph TB
    A[Command Execution] --> B[Create Context]
    B --> C[Execute Business Logic]
    C --> D[Update UI]
    D --> E[Cleanup Resources]
    
    subgraph "Resource Management"
        F[Disposable Commands]
        G[Timer Cleanup]
        H[Event Listeners]
        I[Status Messages]
    end
    
    E --> F
    E --> G
    E --> H
    E --> I
```

## Integration Testing Strategy

### Test Pyramid for Commands

```mermaid
graph TB
    subgraph "Integration Tests"
        A1[End-to-End Command Flow]
        A2[Multi-Component Interaction]
        A3[State Persistence Tests]
    end
    
    subgraph "Component Tests"
        B1[Command Factory Tests]
        B2[Context Resolution Tests]
        B3[Dependency Injection Tests]
    end
    
    subgraph "Unit Tests"
        C1[Individual Command Logic]
        C2[Utility Function Tests]
        C3[Validation Tests]
    end
    
    C1 --> B1
    C2 --> B2
    C3 --> B3
    
    B1 --> A1
    B2 --> A2
    B3 --> A3
```

## Extension Points for Future Development

```mermaid
graph TB
    subgraph "Current Architecture"
        A[CommandRegistry]
        B[Command Modules]
        C[Core Engines]
    end
    
    subgraph "Future Extensions"
        D[Plugin System]
        E[Custom Commands]
        F[External Integrations]
        G[Advanced Analytics]
    end
    
    A -.-> D
    B -.-> E
    C -.-> F
    C -.-> G
    
    subgraph "Extension Mechanisms"
        H[Command Provider API]
        I[Event System]
        J[Configuration Extensions]
        K[UI Component Registry]
    end
    
    D --> H
    E --> I
    F --> J
    G --> K
```

This integration flow documentation provides a comprehensive view of how the refactored command system integrates with the broader Breath Master architecture, ensuring maintainability and extensibility while preserving the extension's core mindful user experience philosophy.