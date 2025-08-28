# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Breath Master** is a VS Code extension that provides breathing guidance and mindful meditation tracking with ethical gamification. It combines a breathing animation engine with privacy-first progress tracking, featuring breathing patterns, session management, challenges, and stretch presets.

## Essential Commands

### Development
- `npm run compile` - Compile TypeScript to dist/
- `npm run watch` - Watch mode compilation
- `npm run package` - Create .vsix package
- `npm run dev:install` - Build and install extension locally

### Testing
- `npm run test` - Run both unit and integration tests
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:unit:watch` - Watch mode for unit tests
- `npm run test:integration` - Run VS Code integration tests
- `npm run test:cov` - Run tests with coverage report
- `npm run pretest` - Compile before integration tests

### Coverage Thresholds
- Statements: 55%
- Branches: 45% 
- Lines: 55%
- Functions: 50%

## Architecture

### Core Engine (`src/engine/`)
- **`breathe-engine.ts`** - Pure TypeScript breathing engine with smooth raised-cosine transitions, supports 5 patterns plus custom
- **`gamification.ts`** - MeditationTracker class handling XP, levels, streaks, challenges, and pledges
- **`onboarding.ts`** - OnboardingManager for first-time user experience and engagement levels
- **`settings/`** - Modern settings architecture with ModernSettingsManager, SettingsAdapter, and modular validation

### VS Code Integration (`src/vscode/`)
- **`extension.ts`** - Main extension entry point, status bar management, command registration, and stretch presets

### Testing Structure
- **Unit tests**: `test/unit/` - Vitest-based pure logic tests
- **Integration tests**: `src/test/` - VS Code extension API tests

## Key Architecture Patterns

### Breathing Engine
- Framework-agnostic pure TypeScript
- Raised-cosine easing for smooth transitions
- 4-phase breathing: inhale → hold1 → exhale → hold2
- Patterns: chill (6-0-8-0), medium (5-0-5-0), active (4-2-4-1), boxing (4-4-4-4), relaxing (4-7-8-0), custom

### Gamification System
- Privacy-first: all data stored locally in VS Code workspace state
- Level progression: 8 levels from "Mindful Rookie" to "Breath Master"
- XP calculation: base rate + time multipliers + challenge bonuses + pledge multipliers
- Daily challenges: morning sessions, consistency streaks, long sessions
- Pledge system: voluntary commitments for bonus XP

### Status Bar Interface
- Left item: breathing phase indicator with animation
- Right cluster: dual-button design with configurable styling
  - Separate stop indicator (⏹) - appears only when sessions/stretch active, always stops
  - Level display with configurable commitment level styling
  - Universal control button (▶/⏸) - context-aware start/pause/resume
- Background color coding for active states (warning/error themes)
- Rich markdown tooltips with progress information

## Modern Settings System

**Settings Architecture:** Uses `ModernSettingsManager` with modular, validated settings instead of VS Code configuration.

### Settings Modules:
- **`BreathingModule`** - Breathing patterns, custom patterns, session duration, reminders
- **`AnimationModule`** - Visual presets, intensity, custom figures, smoothing, status bar settings  
- **`GamificationModule`** - Tracking enabled, commitment level, privacy, challenges, pledges, progression display

### Key Settings:
- **Pattern:** chill, medium, active, boxing, relaxing, custom
- **Custom Pattern:** [inhale, hold1, exhale, hold2] in seconds  
- **Animation Preset:** default, minimal, nature, custom
- **Commitment Level:** minimal, balanced, nature (affects status bar styling)
- **Privacy:** local-only, export-allowed

## Data Export Format
```json
{
  "exportDate": "2025-08-11T...",
  "breathMaster": {
    "meditation": {
      "totalXP": 150,
      "currentStreak": 5,
      "todaySessionTime": 600000
    },
    "onboarding": {
      "hasSeenTour": true,
      "gamificationOptIn": true
    }
  }
}
```

## Testing Guidelines

Manual QA focus areas (see TESTING.md):
- Stretch presets with compact mode variations
- Challenge completion and XP calculation
- Pledge creation, honoring, and cancellation
- Tooltip accuracy across all states
- Data export/import functionality

## Development Notes

- Uses VS Code workspace state for persistence
- No external dependencies beyond VS Code API
- Ethical design principles: no manipulation, user control, local-first privacy
- Extension activates `onStartupFinished` for minimal performance impact
- Stretch presets use timer-based notifications with parsing for compact display
- Dual status bar items: separate stop indicator (statusBarItemSquare) + main display (statusBarItemGamification)
- Universal control system with context-aware actions and configurable commitment levels

## Common Patterns

### Adding New Commands
1. Add to `contributes.commands` in package.json
2. Register handler in extension.ts `activate()` function
3. Use `vscode.commands.registerCommand()`

### Adding New Settings
1. Add to appropriate settings module in `src/engine/settings/modules/`
2. Update module's interface, defaults, and validation
3. Access via `SettingsAdapter` methods like `settings.getBreathingPattern()`

### Extending Gamification
- All progression logic in `gamification.ts`
- Challenge definitions in `DAILY_CHALLENGES` array
- Level definitions in `LEVELS` array with XP thresholds

### Status Bar Control Architecture
- `statusBarItemSquare` - Stop indicator (⏹), only visible when active, command: `breathMaster.stopAny`
- `statusBarItemGamification` - Main display with level + control, command: `breathMaster.universalControl`
- Commitment levels affect display: minimal ("L 2"), balanced ("Lvl: 2"), nature ("🌱 2")
- Background colors: warning (stretch presets), error (sessions), default (idle)