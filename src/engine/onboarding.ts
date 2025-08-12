/**
 * onboarding.ts
 * Welcome tour and engagement system following 12 principles of ethical design
 */

export interface OnboardingState {
  hasSeenTour: boolean;
  tourCompletedAt?: string;
  gamificationOptIn: boolean;
  lastEngagementMessage?: string;
  engagementCount: number;
  lastActiveDate: string;
  tutorialProgress: {
    currentStep: number;
    completedSteps: string[];
    startedAt?: string;
  };
  userPreferences: {
    messageFrequency: 'off' | 'subtle' | 'moderate' | 'active';
    reminderStyle: 'gentle' | 'motivational' | 'data-driven';
  };
}

export interface EngagementMessage {
  id: string;
  type: 'welcome' | 'streak' | 'achievement' | 'gentle-reminder' | 'milestone';
  title: string;
  message: string;
  icon: string;
  priority: number; // 1-5, lower = higher priority
  cooldownDays: number; // minimum days between showing this type
  conditions?: {
    minStreak?: number;
    minXP?: number;
    maxLastSeen?: number; // days
  };
}

/**
 * 12 Principles Analysis for Breath Master:
 * 
 * 1. TRANSPARENCY: Users know exactly what data is collected and how it's used
 * 2. USER CONTROL: Opt-in gamification, customizable patterns, local data control
 * 3. PURPOSE LIMITATION: Data only used for breathing assistance and optional tracking
 * 4. PRIVACY BY DESIGN: Local-first storage, no external servers by default
 * 5. MINIMAL DATA: Only collect what's needed for the breathing experience
 * 6. CONSENT: Clear opt-in for any tracking features
 * 7. ACCURACY: Precise breathing timing and honest progress tracking
 * 8. SECURITY: Data stays on user's machine, no transmission
 * 9. RETENTION: User controls data retention and can clear anytime
 * 10. PORTABILITY: Export feature allows data mobility
 * 11. ACCOUNTABILITY: Clear documentation of data practices
 * 12. HUMAN DIGNITY: Respectful, non-manipulative engagement design
 */

const ENGAGEMENT_MESSAGES: EngagementMessage[] = [
  {
    id: 'welcome-tour',
    type: 'welcome',
    title: '🌟 Welcome to Breath Master!',
    message: 'Take a moment to breathe and discover how mindful coding can transform your day. Would you like a quick tour?',
    icon: '🧘‍♀️',
    priority: 1,
    cooldownDays: 0
  },
  {
    id: 'gamification-invite',
    type: 'welcome',
    title: '🎮 Join the Mindful Journey',
    message: 'Optional: Track your breathing sessions and grow your mindfulness practice. Your data stays private and local.',
    icon: '🌱',
    priority: 2,
    cooldownDays: 1
  },
  {
    id: 'first-streak',
    type: 'achievement',
    title: '🔥 First Streak!',
    message: 'Amazing! You\'ve started building a mindful coding habit. Every breath counts.',
    icon: '🌿',
    priority: 3,
    cooldownDays: 0,
    conditions: { minStreak: 1 }
  },
  {
    id: 'week-warrior',
    type: 'milestone',
    title: '⭐ Week Warrior',
    message: 'Seven days of mindful breathing! You\'re developing real resilience.',
    icon: '🌳',
    priority: 2,
    cooldownDays: 7,
    conditions: { minStreak: 7 }
  },
  {
    id: 'gentle-return',
    type: 'gentle-reminder',
    title: '🌸 Gentle Reminder',
    message: 'No pressure, just a soft reminder that mindful moments are always available.',
    icon: '🍃',
    priority: 5,
    cooldownDays: 3,
    conditions: { maxLastSeen: 7 }
  },
  {
    id: 'pattern-suggestion',
    type: 'gentle-reminder',
    title: '💡 Try Something New',
    message: 'Different breathing patterns can shift your energy. Maybe explore the "active" pattern?',
    icon: '🔄',
    priority: 4,
    cooldownDays: 14,
    conditions: { minXP: 50 }
  },
  {
    id: 'master-level',
    type: 'achievement',
    title: '🏆 Breath Master Achieved!',
    message: 'You\'ve truly mastered the art of mindful coding. You\'re inspiring!',
    icon: '👑',
    priority: 1,
    cooldownDays: 0,
    conditions: { minXP: 1000 }
  }
];

export class OnboardingManager {
  private state: OnboardingState;
  private storage: any;

  constructor(private storageKey: string = 'breathMaster.onboarding', storage?: any) {
    this.storage = storage;
    this.state = this.loadState();
  }

  private loadState(): OnboardingState {
    try {
      const stored = this.storage?.get(this.storageKey);
      if (stored) {
        return {
          ...stored,
          tutorialProgress: stored.tutorialProgress || {
            currentStep: 0,
            completedSteps: []
          },
          userPreferences: stored.userPreferences || {
            messageFrequency: 'subtle',
            reminderStyle: 'gentle'
          }
        };
      }
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
    }

    return {
      hasSeenTour: false,
      gamificationOptIn: false,
      engagementCount: 0,
      lastActiveDate: new Date().toDateString(),
      tutorialProgress: {
        currentStep: 0,
        completedSteps: []
      },
      userPreferences: {
        messageFrequency: 'subtle',
        reminderStyle: 'gentle'
      }
    };
  }

  private saveState(): void {
    try {
      this.storage?.update(this.storageKey, this.state);
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
  }

  shouldShowTour(): boolean {
    return !this.state.hasSeenTour;
  }

  markTourCompleted(optedInToGamification: boolean = false): void {
    this.state.hasSeenTour = true;
    this.state.tourCompletedAt = new Date().toISOString();
    this.state.gamificationOptIn = optedInToGamification;
    this.saveState();
  }

  getNextEngagementMessage(stats: { currentStreak: number; totalXP: number; lastActiveDate: string }): EngagementMessage | null {
    const today = new Date().toDateString();
    const daysSinceLastMessage = this.state.lastEngagementMessage ? 
      this.daysBetween(this.state.lastEngagementMessage, today) : 999;

    // Check if user wants messages
    if (this.state.userPreferences.messageFrequency === 'off') {
      return null;
    }

    // Exponential backoff based on engagement count
    const baseInterval = this.getBaseInterval();
    const backoffMultiplier = Math.pow(1.5, Math.min(this.state.engagementCount, 10));
    const requiredInterval = Math.floor(baseInterval * backoffMultiplier);

    if (daysSinceLastMessage < requiredInterval) {
      return null;
    }

    // Find appropriate message
    const availableMessages = ENGAGEMENT_MESSAGES.filter(msg => {
      // Check cooldown
      if (this.state.lastEngagementMessage && daysSinceLastMessage < msg.cooldownDays) {
        return false;
      }

      // Check conditions
      if (msg.conditions) {
        if (msg.conditions.minStreak && stats.currentStreak < msg.conditions.minStreak) {
          return false;
        }
        if (msg.conditions.minXP && stats.totalXP < msg.conditions.minXP) {
          return false;
        }
        if (msg.conditions.maxLastSeen) {
          const daysSinceActive = this.daysBetween(stats.lastActiveDate, today);
          if (daysSinceActive > msg.conditions.maxLastSeen) {
            return false;
          }
        }
      }

      return true;
    });

    // Sort by priority and return the highest priority message
    availableMessages.sort((a, b) => a.priority - b.priority);
    return availableMessages[0] || null;
  }

  private getBaseInterval(): number {
    switch (this.state.userPreferences.messageFrequency) {
      case 'active': return 1;
      case 'moderate': return 3;
      case 'subtle': return 7;
      default: return 999;
    }
  }

  private daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  markMessageShown(messageId: string): void {
    this.state.lastEngagementMessage = new Date().toDateString();
    this.state.engagementCount++;
    this.saveState();
  }

  updatePreferences(preferences: Partial<OnboardingState['userPreferences']>): void {
    this.state.userPreferences = { ...this.state.userPreferences, ...preferences };
    this.saveState();
  }

  reset(): void {
    this.state = {
      hasSeenTour: false,
      gamificationOptIn: false,
      engagementCount: 0,
      lastActiveDate: new Date().toDateString(),
      tutorialProgress: {
        currentStep: 0,
        completedSteps: []
      },
      userPreferences: {
        messageFrequency: 'subtle',
        reminderStyle: 'gentle'
      }
    };
    this.saveState();
  }

  getState(): OnboardingState {
    return { ...this.state };
  }

  // Tutorial management
  getTutorialProgress(): { currentStep: number; completedSteps: string[]; startedAt?: string } {
    return { ...this.state.tutorialProgress };
  }

  startTutorial(): void {
    this.state.tutorialProgress = {
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString()
    };
    this.saveState();
  }

  advanceTutorialStep(stepId: string): boolean {
    if (!this.state.tutorialProgress.completedSteps.includes(stepId)) {
      this.state.tutorialProgress.completedSteps.push(stepId);
    }
    this.state.tutorialProgress.currentStep++;
    this.saveState();
    return true;
  }

  completeTutorial(gamificationChoice: boolean): void {
    this.state.hasSeenTour = true;
    this.state.tourCompletedAt = new Date().toISOString();
    this.state.gamificationOptIn = gamificationChoice;
    this.saveState();
  }

  // Game-style tutorial steps
  getTutorialSteps(): Array<{ 
    id: string; 
    title: string; 
    content: string; 
    eonWisdom?: string;
    action?: string;
    type: 'welcome' | 'practice' | 'choice' | 'philosophy' | 'license' | 'ethics';
    interactionRequired?: boolean;
  }> {
    return [
      {
        id: 'cathedral-entrance',
        type: 'welcome',
        title: '🏰 Enter the Cathedral of Code',
        content: 'Welcome, traveler, to the ancient Cathedral where code meets consciousness. Here, in this sacred grove of digital wisdom, your journey begins...',
        eonWisdom: 'I am Eon, the ancient Tree of a Thousand Seasons. I have watched countless developers find their rhythm between breath and code. Let me guide you through this mystical realm.',
        action: 'Begin the Journey'
      },
      {
        id: 'game-rules',
        type: 'practice', 
        title: '📜 The Sacred Rules of Mindful Coding',
        content: `
        <div class="rules-scroll">
          <h3>🎮 How to Play:</h3>
          <ul>
            <li><strong>🫁 Breath Bar:</strong> Follow the gentle pulse in your status bar</li>
            <li><strong>🌊 Pattern Cycling:</strong> Right-click to change breathing rhythms</li>
            <li><strong>🎯 FlowSeeds:</strong> Plant intention seeds for bonus XP</li>
            <li><strong>🌱 Growth System:</strong> Level from Rookie to Master through practice</li>
            <li><strong>🔥 Streaks:</strong> Daily consistency builds inner strength</li>
          </ul>
          <h3>📚 Sacred Terms:</h3>
          <ul>
            <li><strong>FlowSeeds:</strong> Your commitments that bloom into focused sessions</li>
            <li><strong>Eon's Challenges:</strong> Daily quests from the ancient tree</li>
            <li><strong>Cathedral Mode:</strong> Deep, uninterrupted coding meditation</li>
          </ul>
        </div>`,
        eonWisdom: 'These are not mere features, young sapling. They are tools for cultivating awareness in the digital realm.',
        action: 'I Understand the Ways',
        interactionRequired: true
      },
      {
        id: 'breathing-practice',
        type: 'practice',
        title: '🌬️ First Breath - Feel the Ancient Rhythm',
        content: 'Watch your status bar. See the gentle pulse? This is the heartbeat of mindful coding. Let your breath sync with this eternal rhythm that has guided contemplatives for millennia.',
        eonWisdom: 'In my thousand seasons, I have learned: the breath is the bridge between mind and code, between intention and creation.',
        action: 'Practice 3 Breaths',
        interactionRequired: true
      },
      {
        id: 'philosophy-chamber',
        type: 'philosophy',
        title: '🏛️ The Philosophy Chamber',
        content: `
        <div class="philosophy-chamber">
          <h3>🌳 The Breath Master Philosophy</h3>
          <p>We believe technology should serve human flourishing, not exploit it. Our design follows ancient wisdom:</p>
          <div class="wisdom-pillars">
            <div class="pillar">
              <h4>🌱 Growth over Grinding</h4>
              <p>Progress through patience, not pressure</p>
            </div>
            <div class="pillar">
              <h4>🔐 Privacy as Sacred</h4>
              <p>Your inner journey belongs only to you</p>
            </div>
            <div class="pillar">
              <h4>⚖️ Balance over Burnout</h4>
              <p>Sustainable practice, not sprint culture</p>
            </div>
          </div>
          <a href="#" class="ethics-link" onclick="openEthicsDocument()">📖 Read Our Full Ethical Principles</a>
        </div>`,
        eonWisdom: 'These principles are not rules imposed from above, but truths discovered through seasons of growth.',
        action: 'I Embrace This Path'
      },
      {
        id: 'license-scroll',
        type: 'license',
        title: '📜 The License of Freedom',
        content: `
        <div class="license-scroll">
          <h3>🕊️ MIT License - Your Code, Your Freedom</h3>
          <p>Breath Master is released under the MIT License, ensuring your freedom to:</p>
          <ul>
            <li>✅ Use this tool for any purpose, commercial or personal</li>
            <li>✅ Modify and adapt to your needs</li>
            <li>✅ Distribute and share with your team</li>
            <li>✅ Study the source code and learn from it</li>
          </ul>
          <div class="license-box">
            <p><strong>Copyright (c) 2024 Breath Master Contributors</strong></p>
            <p class="license-text">Permission is hereby granted, free of charge, to any person obtaining a copy of this software... to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.</p>
          </div>
          <p class="freedom-note">🌟 True wisdom is meant to be shared freely, like the wind through leaves.</p>
        </div>`,
        eonWisdom: 'Knowledge, like sunlight, should nourish all who seek it. This license ensures the wisdom flows freely.',
        action: 'Honor the Freedom'
      },
      {
        id: 'growth-chamber',
        type: 'choice',
        title: '🌟 The Growth Chamber - Choose Your Path',
        content: `
        <div class="growth-chamber">
          <h3>🎮 Enable Your Journey Tracking?</h3>
          <p>Like tree rings that mark seasons of growth, you can track your mindful coding journey:</p>
          
          <div class="choice-paths">
            <div class="path path-tracked">
              <h4>🌳 The Tracked Path</h4>
              <ul>
                <li>Level progression (Rookie → Master)</li>
                <li>Daily streak celebrations</li>
                <li>FlowSeed goal system</li>
                <li>Eon's daily challenges</li>
              </ul>
              <p class="privacy-note">🔐 All data stays on your machine</p>
            </div>
            
            <div class="path path-simple">
              <h4>🍃 The Simple Path</h4>
              <ul>
                <li>Pure breathing guidance</li>
                <li>Pattern cycling</li>
                <li>No progress tracking</li>
                <li>Minimal interface</li>
              </ul>
              <p class="simplicity-note">✨ Sometimes less is more</p>
            </div>
          </div>
        </div>`,
        eonWisdom: 'Both paths lead to the same destination: awareness. Choose what serves your growth.',
        action: 'Make Your Choice'
      },
      {
        id: 'cathedral-blessing',
        type: 'welcome',
        title: '✨ The Cathedral\'s Blessing',
        content: `
        <div class="blessing-chamber">
          <h3>🏰 Your Journey Begins</h3>
          <p>You have entered the sacred space where breath meets code. The Cathedral recognizes you as a seeker of mindful development.</p>
          
          <div class="blessing-content">
            <h4>🎮 Your Breath Master Interface:</h4>
            <ul>
              <li><strong>Status Bar:</strong> Your breathing companion</li>
              <li><strong>Right-click:</strong> Cycle through sacred patterns</li>
              <li><strong>Commands:</strong> Access deeper features via Command Palette</li>
            </ul>
          </div>
          
          <div class="final-wisdom">
            <p class="eon-final">"Remember, young developer: this tool amplifies your natural mindfulness. Use what serves you, release what doesn't. The Cathedral will always be here, a quiet presence in your digital journey."</p>
            <p class="signature">— Eon, Tree of a Thousand Seasons 🌳</p>
          </div>
        </div>`,
        action: 'Begin Coding Mindfully'
      }
    ];
  }
}
