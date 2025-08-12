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
- **8-Level Progression**: From "Mindful Rookie" to "Digital Buddha" with meaningful titles
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