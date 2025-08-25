# BreatheGlow CHANGELOG.md

# Changelog

## [Unreleased]
- Initial development of the BreatheGlow extension.
- Implemented core features including breathing pattern management and status bar integration.

## [0.1.0] - YYYY-MM-DD
- Added command registration for toggling breathing effect and cycling through patterns.
- Implemented breathing timer logic with smooth raised-cosine curve for inhale, hold, exhale, and hold durations.
- Created status bar management to reflect breathing intensity.
- Defined configuration settings for enabling the extension, selecting patterns, and adjusting intensity.
- Added simple logging utility for debugging purposes.
- Set up testing environment and wrote unit tests for core functionalities.

# Breath Master Changelog

All notable changes to the Breath Master extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2025-08-25

### 🔧 Fixed
- **Animation Smoothness**: Fixed breathing animation to properly grow and shrink with breathing phases
  - Corrected exhale figure arrays to maintain consistent small→large ordering across all presets
  - Removed overly aggressive intensity scaling that limited animation to 30% of range
  - Reordered smoothing to apply before intensity scaling, preserving full amplitude range
  - Fixed MINIMAL_FIGURES exhale array direction for consistent visual progression
- **Visual Breathing Flow**: Animation now properly shows:
  - Inhale: smooth growth from small → medium → large icons
  - Hold1: maintains large size consistently  
  - Exhale: smooth shrinkage from large → medium → small icons
  - Hold2: maintains small size consistently

### 🚀 Enhanced
- **Custom Animation Figures**: Added normalization and validation for user-defined animation figures
- **Reduced Flicker**: Implemented low-pass smoothing to reduce jarring transitions between icon indices
- **Performance**: Optimized figure validation to occur once per animation start rather than per frame

## [0.3.1] - 2025-08-12

### 🔧 Fixed
- Fixed animation GIFs in README to display correct versions
- Updated documentation links and references

### 📚 Documentation
- Improved README with correct animated demonstrations
- Updated installation instructions
- Enhanced visual documentation

## [0.3.0] - 2025-08-12

### 🚀 Major Release - Complete Rebranding to Breath Master

#### ✨ Added
- Complete rebranding from BreatheGlow to Breath Master
- Enhanced onboarding experience with tutorial system
- Improved user interface and visual design
- Updated installation files and documentation

#### 🔧 Changed
- Extension name changed to "Breath Master"
- Updated icon and branding elements
- Modernized user experience flows

## [0.1.0] - 2025-08-11

### 🚀 Major Release - Complete Rebranding & Ethical Gamification

This release transforms BreatheGlow into **Breath Master**, introducing comprehensive ethical gamification while maintaining privacy-first principles.

### ✨ Added

#### Core Features
- **Complete Rebranding**: BreatheGlow → Breath Master with updated branding, icons, and messaging
- **Custom Breathing Patterns**: Create your own patterns with simple format: `"4-4-4-4"` (inhale-hold-exhale-pause)
- **Interactive Onboarding Tour**: 6-step guided introduction explaining all features and privacy practices
- **Ethical Gamification System**: Optional meditation tracking with 8-level progression system
- **Privacy-First Design**: All data stays local, opt-in tracking, full export/clear capabilities

#### Gamification Features
- **8-Level Progression**: From "Mindful Rookie" to "Breath Master" with meaningful titles
- **Daily Streak Tracking**: Gentle encouragement without pressure or manipulation
- **Session Timer**: Track today's meditation progress
- **XP System**: Earn experience through completed breathing cycles during meditation sessions
- **Achievement Messages**: Celebratory notifications for genuine milestones

#### Privacy & Ethics
- **12 Principles Compliance**: Follows comprehensive ethical design principles ([documented](./12-PRINCIPLES-ANALYSIS.md))
- **Local-Only Storage**: Uses VS Code's secure globalState, no external servers
- **Opt-In Everything**: Gamification disabled by default, requires explicit user consent
- **Full Data Control**: Export progress as JSON, clear all data anytime
- **Exponential Backoff**: Messages become less frequent over time to prevent notification fatigue
- **User-Controlled Engagement**: Set frequency to off/subtle/moderate/active

### 🔧 Changed

#### Configuration
- **Namespace Change**: All settings moved from `breatheGlow.*` to `breathMaster.*`
- **Enhanced Pattern Support**: Added custom pattern configuration
- **Privacy Controls**: New settings for data management and engagement

### 📚 Documentation

- **12 Principles Analysis**: Comprehensive ethical design documentation
- **Production README**: Professional documentation with badges
- **MIT License**: Proper attribution and licensing

### 🛡️ Security & Privacy

- **No External Dependencies**: Zero runtime dependencies
- **Air-Gapped Design**: No network requests or data transmission
- **Transparent Storage**: Clear documentation of data practices
- **User Sovereignty**: Complete control over personal data

---

## [0.0.3] - Previous BreatheGlow Releases

### Legacy Features
- Initial breathing animation system
- 5 preset breathing patterns (chill, medium, active, boxing, relaxing)
- Dual status bar indicators
- Basic configuration options
- Visual breathing cues with directional icons

**Note**: Versions 0.0.1-0.0.3 were released under the "BreatheGlow" branding. Version 0.1.0 represents a complete rebranding and architectural enhancement to "Breath Master".

## [0.2.2] - 2025-08-12

### Added
- Meditation session completion confirmation toast with follow-up actions (Start Another / Set Goal / View Challenges / Dismiss).
- Stretch preset completion confirmation with acknowledge or start another flow; improved timed teardown of stretch state.

### Changed
- Unified post-session UX: richer messaging including XP, pledge honor, and goal bonus in a single actionable notification.
- Staggered challenge completion toasts after session end to avoid notification pile-up.

### Internal
- Updated integration tests to new namespace (breathMaster.*) and relaxed config mutation assertions for VS Code test harness timing.
- Minor refactor around endSession notification logic.

### Notes
This release focuses on closure & flow continuity—users now get an intentional completion moment without intrusive modals, preserving calm while offering next-step choices.