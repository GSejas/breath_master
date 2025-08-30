# Complete Repository Generation Prompt: Breath Master VS Code Extension

## Project Overview
Generate a complete VS Code extension called "Breath Master" - a mindful breathing companion that integrates gamification, wellness tracking, and privacy-first design into the coding workflow.

## Core Philosophy
- **Mindful Technology**: Technology that serves human wellbeing, not the other way around
- **Privacy First**: All data stored locally, optional export only
- **Gentle Gamification**: Progress tracking without pressure or competition
- **Accessibility**: Works for all skill levels, from beginners to advanced users
- **Ethical Design**: No dark patterns, no addiction mechanics, genuine wellness focus

## Technical Architecture

### Project Structure
```
breath-master/
├── package.json                    # Extension manifest with commands, settings, contributions
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts               # Testing configuration (Vitest)
├── jest.config.js                 # Jest config for additional tests
├── README.md                      # Comprehensive documentation with ASCII art
├── CHANGELOG.md                   # Version history
├── LICENSE.md                     # MIT License
│
├── media/                         # Extension assets
│   ├── breath-master-iconic.png   # 200x200 icon
│   └── settings.css/.js           # Web view styling
│
├── resources/                     # Demo assets
│   ├── *.gif                      # Animation demos
│   ├── *.mp4                      # Video tutorials
│   └── *.png                      # Screenshots
│
├── src/
│   ├── engine/                    # Core business logic (framework-agnostic)
│   │   ├── breathe-engine.ts      # Breathing pattern algorithms
│   │   ├── gamification.ts        # XP, levels, challenges, pledges
│   │   ├── onboarding.ts          # User journey management
│   │   ├── tutorial-service.ts    # In-app guidance
│   │   └── settings/              # Modern settings system
│   │       ├── VSCodeSettingsAdapter.ts
│   │       ├── ModernSettingsManager.ts
│   │       ├── types.ts
│   │       ├── validators.ts
│   │       └── modules/
│   │           ├── BreathingModule.ts
│   │           ├── AnimationModule.ts
│   │           └── GamificationModule.ts
│   │
│   ├── vscode/                    # VS Code integration layer
│   │   ├── extension.ts           # Main extension entry point
│   │   ├── MicroMeditationBar.ts  # Status bar component
│   │   ├── journey-coverage.ts    # Feature usage tracking
│   │   └── storage-wrapper.ts     # Workspace state management
│   │
│   ├── commands/                  # Modular command system
│   │   ├── index.ts              # Command registry and utilities
│   │   ├── sessions/             # Session lifecycle
│   │   │   ├── startSessionCommand.ts
│   │   │   ├── endSessionCommand.ts
│   │   │   ├── pauseSessionCommand.ts
│   │   │   └── resumeSessionCommand.ts
│   │   ├── breathing/            # Core breathing controls
│   │   │   ├── toggleCommand.ts
│   │   │   └── cyclePatternCommand.ts
│   │   ├── gamification/         # Progress & engagement
│   │   │   ├── changeGoalCommand.ts
│   │   │   ├── makePledgeCommand.ts
│   │   │   ├── cancelPledgeCommand.ts
│   │   │   └── viewChallengesCommand.ts
│   │   ├── internal/             # System controls
│   │   │   ├── stopAnyCommand.ts
│   │   │   └── universalControlCommand.ts
│   │   ├── data/                 # Data management
│   │   │   ├── exportDataCommand.ts
│   │   │   ├── clearDataCommand.ts
│   │   │   └── showTourCommand.ts
│   │   ├── stretch/              # Physical wellness
│   │   │   ├── startStretchPresetCommand.ts
│   │   │   └── cancelStretchPresetCommand.ts
│   │   ├── micro/                # Micro-meditation
│   │   │   └── microMeditationToggleCommand.ts
│   │   └── helpers/              # Shared utilities
│   │       └── reminderHelpers.ts
│   │
│   └── test/                     # Test suites
│       ├── runTest.ts            # Test runner
│       └── suite/                # Integration tests
│
├── test/
│   └── unit/                     # Unit tests (Vitest)
│       ├── *.test.ts             # Engine tests
│       └── settings/             # Settings system tests
│
├── docs/                         # Documentation
│   ├── README.md                 # Documentation overview
│   ├── USER-GUIDE.md            # User manual
│   ├── TESTING.md               # Testing guide
│   └── design/                  # Technical documentation
│       ├── architecture/        # System design docs
│       ├── diagrams/           # Visual documentation
│       └── reports/            # Analysis reports
│
└── scripts/                     # Build and utility scripts
    ├── create-banner.js         # Asset generation
    ├── ensure-test-headers.mjs  # Test validation
    └── audit-headers.js         # Code quality checks
```

## Core Features Implementation

### 1. Breathing Engine (`src/engine/breathe-engine.ts`)
- **Patterns**: chill (6s-8s), medium (5s-5s), active (4s-2s-4s-1s), boxing (4s-4s-4s-4s), relaxing (4s-7s-8s), custom
- **Animation System**: Smooth raised-cosine curves, VS Code codicon integration
- **Phase Tracking**: inhale/hold1/exhale/hold2 with precise timing
- **Customization**: User-defined patterns with validation

### 2. Gamification System (`src/engine/gamification.ts`)
- **XP System**: Points based on session completion, consistency bonuses
- **Levels**: Progressive skill levels with meaningful thresholds
- **Challenges**: Daily breathing goals, streak tracking
- **Pledges**: Voluntary commitments with XP multipliers
- **Privacy**: All data stored locally, optional export

### 3. Modern Settings Architecture (`src/engine/settings/`)
- **Modular Design**: Separate modules for breathing, animation, gamification
- **Type Safety**: Full TypeScript validation with runtime checks
- **Migration Support**: Automatic version migration with fallbacks
- **User Levels**: BASIC/INTERMEDIATE/ADVANCED feature filtering
- **Validation**: Comprehensive error handling and user feedback

### 4. Command System (`src/commands/`)
- **Modular Architecture**: Grouped by functionality (sessions, breathing, gamification)
- **Dependency Injection**: Clean separation of concerns
- **Error Handling**: Graceful degradation and user-friendly messages
- **Auto-cleanup**: Resource management and memory optimization

### 5. VS Code Integration (`src/vscode/`)
- **Status Bar**: Multiple status bar items with breathing animations
- **Commands**: 20+ commands registered in Command Palette
- **Settings UI**: Web view panel for configuration
- **Workspace State**: Persistent data storage
- **Notifications**: Auto-disappearing messages with 9-second timeout

## Key Components Detail

### Breathing Engine Algorithm
```typescript
// Raised cosine smoothing for natural breathing feel
private getRaisedCosineAmplitude(t: number, duration: number): number {
  const normalized = Math.max(0, Math.min(1, t / duration));
  return 0.5 * (1 - Math.cos(Math.PI * normalized));
}

// Pattern definitions with precise timing
const PATTERNS = {
  chill: { inhale: 6000, hold1: 0, exhale: 8000, hold2: 0 },
  medium: { inhale: 5000, hold1: 0, exhale: 5000, hold2: 0 },
  active: { inhale: 4000, hold1: 2000, exhale: 4000, hold2: 1000 },
  boxing: { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 },
  relaxing: { inhale: 4000, hold1: 7000, exhale: 8000, hold2: 0 }
};
```

### Gamification Mechanics
```typescript
// XP calculation with diminishing returns to prevent addiction
private calculateSessionXP(durationMinutes: number): number {
  const baseXP = Math.min(durationMinutes * 2, 20); // Cap at 20 XP
  const consistencyBonus = this.getConsistencyMultiplier();
  return Math.floor(baseXP * consistencyBonus);
}

// Level progression with meaningful thresholds
private calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}
```

### Settings Validation System
```typescript
// Type-safe validation with detailed error reporting
export class Validator {
  static object<T>(schema: ValidationSchema<T>): ValidatorFunction<T> {
    return (value: unknown) => {
      // Comprehensive validation with path-based error tracking
      const result = {} as T;
      const errors: ValidationError[] = [];
      // ... validation logic
      return errors.length ? { success: false, errors } : { success: true, data: result };
    };
  }
}
```

## Package.json Configuration
```json
{
  "name": "breath-master",
  "displayName": "Breath Master",
  "description": "Master your breathing and coding flow with gentle gamification and mindful tracking.",
  "version": "0.3.4",
  "publisher": "GSejas",
  "engines": { "vscode": "^1.102.0" },
  "activationEvents": ["onStartupFinished"],
  "main": "./dist/vscode/extension.js",
  "contributes": {
    "commands": [
      { "command": "breathMaster.startSession", "title": "🚀 Start Meditation Session", "category": "Breath Master" },
      { "command": "breathMaster.toggle", "title": "🌊 Toggle Breathing", "category": "Breath Master" },
      { "command": "breathMaster.cyclePattern", "title": "🔄 Cycle Breathing Pattern", "category": "Breath Master" }
      // ... 20+ more commands
    ],
    "configuration": {
      "title": "Breath Master",
      "properties": {
        "breathMaster.breathing.pattern": {
          "type": "string",
          "enum": ["chill", "medium", "active", "boxing", "relaxing", "custom"],
          "default": "chill"
        }
        // ... comprehensive settings schema
      }
    }
  }
}
```

## Testing Strategy
- **Unit Tests**: Vitest for engine logic, pure functions
- **Integration Tests**: Jest for VS Code API integration
- **Coverage**: 80%+ coverage for core engine functionality
- **Manual Testing**: Automated test headers and validation scripts

## Documentation Requirements
- **README.md**: Comprehensive with ASCII art, feature overview, installation
- **USER-GUIDE.md**: Step-by-step usage instructions
- **TESTING.md**: Development and testing procedures
- **Architecture docs**: Visual diagrams and technical specifications

## Build & Development
- **TypeScript**: Strict mode with comprehensive type checking
- **Build**: Compile to `dist/` with source maps
- **Watch Mode**: Development with hot reload
- **Package**: VSIX generation for marketplace
- **Scripts**: npm scripts for all common tasks

## Visual Design Elements
- **ASCII Art**: Decorative elements throughout documentation
- **Icons**: VS Code codicons for animations (circle-small-filled, circle-filled, record)
- **Animations**: Smooth transitions with raised-cosine curves
- **Colors**: Gentle, calming palette with accessibility compliance
- **Layout**: Clean, minimal interface respecting VS Code design language

## Error Handling Strategy
- **Graceful Degradation**: Continue operation even when features fail
- **User-Friendly Messages**: Clear, actionable error messages
- **Logging**: Comprehensive logging for debugging
- **Recovery**: Automatic retry and fallback mechanisms
- **Validation**: Prevent invalid states before they occur

## Privacy & Ethics
- **Local Storage**: All personal data remains on user's machine
- **Optional Export**: User-controlled data export in JSON format
- **No Tracking**: Zero telemetry, analytics, or external data transmission
- **Transparent**: Open source, auditable code
- **User Control**: Full control over all features and data

## Performance Optimization
- **Lazy Loading**: Load features only when needed
- **Memory Management**: Automatic cleanup of timers and resources
- **Efficient Animations**: Optimized timing loops with proper disposal
- **Minimal Startup**: Fast activation with deferred initialization
- **Tree Shaking**: Optimized bundle size with unused code elimination

Generate this complete repository with all files, maintaining the exact architecture, naming conventions, and implementation patterns described above. Include comprehensive comments, proper TypeScript types, full test coverage, and polished documentation with ASCII art elements.
