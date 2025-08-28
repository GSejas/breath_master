# Breath Master Changelog

All notable changes to the Breath Master extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-08-25

### 🎯 Major Animation & Storage Improvements

#### ✨ Added
- **Cross-Window Storage Sync**: Implemented versioned storage wrapper with file-based notifications
- **Real-time Multi-Window Updates**: Changes in one VS Code window now sync to all other windows within ~1 second
- **Optimistic Concurrency Control**: Automatic conflict resolution prevents lost updates when multiple windows modify data
- **Storage Wrapper API**: New `StorageWrapper` class with version control and touch file notifications
- **FileSystemWatcher Integration**: Monitors storage changes across extension hosts

#### 🔧 Fixed
- **Animation Direction Consistency**: Fixed exhale animations to properly shrink (large → small) instead of growing
- **Intensity Scaling**: Removed overly aggressive 0.49 scaling cap that prevented large icons from appearing
- **Smoothing Order**: Apply amplitude smoothing before intensity scaling to preserve full range
- **Index Flicker**: Added low-pass filtering to reduce rapid icon transitions at amplitude boundaries
- **Array Ordering**: Normalized all breathing phase arrays to consistent small→large progression

#### 🏗️ Technical Architecture
- **Atomic File Operations**: Touch file writes use temp-file + rename for atomic updates
- **Backward Compatibility**: Automatic detection of storage type maintains compatibility with existing tests
- **Error Resilience**: Touch file failures don't break main functionality
- **Version Conflict Handling**: Retry logic with exponential backoff for storage conflicts

### 🧪 Testing & Quality
- **All 76 Unit Tests Passing**: Maintained 100% test compatibility
- **TypeScript Compilation**: Zero compilation errors
- **Mock Storage Detection**: Smart detection distinguishes between test mocks and production storage

### 📁 Files Changed
- `src/vscode/storage-wrapper.ts` - New versioned storage implementation
- `src/engine/gamification.ts` - Dual-mode storage support with reload capabilities
- `src/engine/onboarding.ts` - Dual-mode storage support with reload capabilities
- `src/vscode/extension.ts` - Integrated storage wrapper and cross-window watcher
- `src/engine/breathe-engine.ts` - Fixed exhale array directions in all presets

---

## [0.3.2] - 2025-08-15

### 🔧 Fixed
- Enhanced stretch preset completion flows with better UX messaging
- Improved notification timing to prevent toast pile-up
- Refined session completion confirmations

### 📚 Documentation
- Updated README with corrected animated demonstrations
- Enhanced installation and usage instructions

---

## [0.3.1] - 2025-08-12

### 🔧 Fixed
- Fixed animation GIFs in README to display correct versions
- Updated documentation links and references

### 📚 Documentation
- Improved README with correct animated demonstrations
- Updated installation instructions
- Enhanced visual documentation

---

## [0.3.0] - 2025-08-12

### 🚀 Major Release - Complete Rebranding to Breath Master

#### ✨ Added
- **Complete Rebranding**: BreatheGlow → Breath Master with updated branding, icons, and messaging
- **Enhanced Onboarding**: Tutorial system with cathedral-themed progressive disclosure
- **Improved Visual Design**: Modern interface with consistent iconography
- **Updated Installation**: New extension packaging and distribution

#### 🔧 Changed
- Extension name changed to "Breath Master"
- Updated icon and branding elements throughout
- Modernized user experience flows
- Enhanced tooltip and status bar messaging

---

## [0.2.2] - 2025-08-12

### ✨ Added
- **Session Completion Flows**: Toast notifications with follow-up actions (Start Another / Set Goal / View Challenges)
- **Stretch Preset Completion**: Acknowledge or restart flows with improved timed teardown
- **Unified Post-Session UX**: Rich messaging including XP, pledge status, and goal bonuses

### 🔧 Changed
- **Staggered Notifications**: Challenge completion toasts spaced to avoid notification pile-up
- **Integration Test Updates**: Migrated to breathMaster.* namespace with relaxed timing assertions

### 🏗️ Internal
- Refactored endSession notification logic for better flow continuity
- Improved session state management and cleanup

---

## [0.2.1] - 2025-08-11

### ✨ Added
- **Pledge System**: Optional commitment feature with bonus XP multipliers
- **Goal Setting**: Configurable session duration targets
- **Challenge System**: Daily mindfulness challenges from "Eon"
- **Enhanced Gamification**: 8-level progression from "Mindful Rookie" to "Breath Master"

### 🔧 Fixed
- Improved streak calculation accuracy
- Enhanced XP award timing and consistency
- Better session state persistence

---

## [0.2.0] - 2025-08-11

### 🚀 Major Release - Ethical Gamification System

#### ✨ Added

##### Core Gamification
- **8-Level Progression System**: Meaningful advancement from "Mindful Rookie" to "Breath Master"
- **Daily Streak Tracking**: Gentle encouragement without manipulation or pressure
- **Session Timer**: Track meditation progress throughout the day
- **XP System**: Experience points earned through completed breathing cycles during active sessions
- **Achievement Notifications**: Celebratory messages for genuine milestones

##### Privacy & Ethics
- **12 Principles Compliance**: Follows comprehensive ethical design framework
- **Local-Only Storage**: All data stored in VS Code's secure globalState, no external servers
- **Opt-In Design**: Gamification disabled by default, requires explicit user consent
- **Full Data Control**: Export progress as JSON, clear all data anytime
- **User-Controlled Engagement**: Adjustable notification frequency (off/subtle/moderate/active)

##### Advanced Features
- **Custom Breathing Patterns**: Create patterns with format: `"4-4-4-4"` (inhale-hold-exhale-pause)
- **Interactive Onboarding**: 6-step guided tour explaining features and privacy practices
- **Stretch Presets**: Timed movement reminders with nature-inspired wisdom quotes
- **Meditation Sessions**: Formal practice tracking with pause/resume/goal features

#### 🔧 Changed
- **Configuration Namespace**: Migrated from `breatheGlow.*` to `breathMaster.*`
- **Enhanced Privacy Controls**: New settings for data management and engagement levels
- **Improved Visual Design**: Updated status bar items and tooltip messaging

#### 📚 Documentation
- **12 Principles Analysis**: Comprehensive ethical design documentation
- **MIT License**: Proper open-source licensing and attribution
- **Privacy Policy**: Transparent data handling documentation

---

## [0.1.1] - 2025-08-10

### 🔧 Fixed
- Improved breathing curve smoothness with raised-cosine easing
- Enhanced status bar icon transitions
- Better configuration validation and error handling

### ✨ Added
- Additional breathing pattern presets
- Enhanced tooltip information
- Better visual feedback for phase transitions

---

## [0.1.0] - 2025-08-09

### 🚀 Initial Release - BreatheGlow Foundation

#### ✨ Core Features
- **5 Breathing Patterns**: Chill (6-0-8-0), Medium (5-0-5-0), Active (4-2-4-1), Boxing (4-4-4-4), Relaxing (4-7-8-0)
- **Dual Status Bar Indicators**: Left-aligned breathing display, right-aligned pattern cycling
- **Visual Breathing Cues**: Directional icons (↑ Inhale, — Hold, ↓ Exhale) with size progression
- **Smooth Animation**: Raised-cosine curve for natural breathing rhythm
- **Configurable Settings**: Enable/disable, pattern selection, intensity control, tick rate

#### 🏗️ Technical Foundation
- **Framework-Agnostic Engine**: Pure TypeScript breathing logic (`BreatheEngine`)
- **VS Code Integration**: Extension adapter with status bar management
- **Configuration System**: Workspace and user-level settings support
- **Test Coverage**: Comprehensive unit tests for core functionality

#### 📋 Configuration Options
- `breathMaster.enabled`: Enable/disable the breathing indicator
- `breathMaster.pattern`: Select breathing pattern
- `breathMaster.intensity`: Visual intensity (0-1)
- `breathMaster.tickMs`: Animation update frequency
- `breathMaster.showBoth`: Dual status bar display

---

## Development Notes

### Version Numbering
- **0.1.x**: Initial BreatheGlow foundation
- **0.2.x**: Ethical gamification system
- **0.3.x**: Rebranding to Breath Master
- **Unreleased**: Animation fixes and cross-window storage

### Architecture Evolution
1. **Phase 1**: Basic breathing animation with VS Code integration
2. **Phase 2**: Comprehensive gamification with privacy-first design
3. **Phase 3**: Professional rebranding and enhanced UX
4. **Phase 4**: Technical improvements (animation consistency, multi-window sync)

### Privacy Commitment
Throughout all versions, Breath Master maintains:
- **Zero external dependencies**: No network requests or data transmission
- **Local-only storage**: All data remains on user's machine
- **Transparent practices**: Open-source codebase and clear documentation
- **User control**: Complete ownership of personal data with export/clear capabilities