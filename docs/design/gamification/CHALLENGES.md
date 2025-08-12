# Daily Challenges System

## Overview

The Daily Challenges system in Breath Master provides level-scaled, randomized mindfulness tasks that award XP. Each challenge is imbued with wisdom from Eon, the ancient sequoia who serves as your meditation guide.

## Challenge Types

### Cycles Challenges
- **Target**: 20-120+ breath cycles depending on level
- **Description**: Complete a specific number of breathing cycles throughout the day
- **XP Reward**: Base level XP + cycle bonus
- **Eon's Teaching**: "Each cycle weaves strength into your roots"

### Minutes Challenges  
- **Target**: 5-35+ minutes of continuous meditation
- **Description**: Maintain focused breathing for extended periods
- **XP Reward**: High reward for sustained practice
- **Eon's Teaching**: "Patience, young one. I have stood here for a thousand years"

### Deep Session Challenges
- **Target**: 15-60+ minute sessions (unlocked at level 4+)
- **Description**: Extended meditation sessions that test commitment
- **XP Reward**: Highest XP rewards for deep practice
- **Eon's Teaching**: "Deep practice creates the heartwood of wisdom"

### Morning Breath (Time-based)
- **Target**: Complete any meditation before noon
- **Availability**: Random time 0-2 hours into day
- **XP Reward**: Consistency bonus
- **Eon's Teaching**: "I have witnessed ten thousand dawns"

### Evening Flow (Time-based)
- **Target**: Complete meditation after 6 PM
- **Availability**: Appears 4-10 PM
- **XP Reward**: Reflection bonus  
- **Eon's Teaching**: "Night is not darkness but deep listening"

### Streak Challenges (Level 6+)
- **Target**: Maintain daily practice consistency
- **Description**: Continue unbroken meditation practice
- **XP Reward**: Exponential streak bonuses
- **Eon's Teaching**: "Be constant like the earth's turning"

## Challenge Generation

### Level Scaling
- **Levels 1-3**: 1-2 gentle challenges
- **Levels 4-6**: 2-3 challenges, deep sessions unlocked
- **Levels 7-8**: 3-4 challenges, streak challenges unlocked

### Randomization
- **Count**: Random +/- 1 from base level count
- **Targets**: Base + random variation for difficulty
- **Scheduling**: Staggered availability throughout day
- **Messages**: Random selection from Eon's wisdom pools

### Auto-Completion
Challenges automatically complete when conditions are met:
- Cycle challenges: Track total daily cycles
- Minute challenges: Track total daily meditation time
- Deep sessions: Check individual session lengths
- Time-based: Verify meditation occurred in time window
- Streaks: Monitor daily practice consistency

## User Experience

### Discovery
- Challenges appear in status bar tooltip count
- `breathMaster.viewChallenges` shows available tasks
- Time-locked challenges appear as "coming soon"

### Completion
- Automatic detection and notification with Eon's blessing
- Manual completion option for edge cases
- Rich completion messages with spiritual context

### Visual Integration
- Status bar shows challenge count: "🌳 2 challenges from Eon"
- Progress reflected in XP tooltip progress bars
- Completion notifications include XP awards

## Technical Implementation

### Storage
```typescript
interface DailyChallenge {
  id: string;
  date: string;
  type: 'cycles' | 'minutes' | 'deep_session' | 'morning_breath' | 'evening_flow' | 'streak';
  target: number;
  rewardXP: number;
  availableFrom: number;
  completed?: boolean;
  expired?: boolean;
  title: string;
  description: string;
  eonMessage: string;
  completionMessage: string;
}
```

### Key Methods
- `ensureDailyChallenges()`: Generate challenges for current day
- `checkChallengeAutoCompletion()`: Evaluate and complete eligible challenges
- `getAvailableChallenges()`: Filter challenges by time and completion status
- `completeChallenge(id)`: Mark challenge complete and award XP

## Design Philosophy

The challenge system embodies ethical gamification principles:

1. **Intrinsic Motivation**: Challenges inspire deeper practice, not compulsive achievement
2. **Wisdom Integration**: Each challenge includes meaningful spiritual context
3. **Respectful Pacing**: Level-appropriate difficulty prevents overwhelm
4. **Authentic Growth**: XP rewards reflect genuine meditation development
5. **Cultural Sensitivity**: Eon's teachings draw from universal mindfulness principles

The ancient sequoia Eon serves as a non-denominational wisdom keeper, offering guidance that transcends specific spiritual traditions while honoring the deep contemplative heritage shared across cultures.
