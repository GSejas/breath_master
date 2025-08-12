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

  // Tour content
  getTourSteps(): Array<{ title: string; content: string; action?: string }> {
    return [
      {
        title: '🌟 Welcome to Breath Master',
        content: 'Transform your coding experience with mindful breathing. This gentle tool helps you maintain focus and reduce stress while you work.',
        action: 'Continue'
      },
      {
        title: '👀 Breathing Indicator',
        content: 'See the subtle breathing animation in your status bar? It guides your breath rhythm with visual cues that won\'t distract from your code.',
        action: 'Show me'
      },
      {
        title: '🔄 Breathing Patterns',
        content: 'Try different patterns: Chill for relaxation, Active for energy, Boxing for focus, or create your own custom pattern.',
        action: 'Explore patterns'
      },
      {
        title: '🎮 Optional Gamification',
        content: 'Want to track your mindful moments? Opt-in to gentle progress tracking. Your data stays completely private and local to your machine.',
        action: 'Maybe later'
      },
      {
        title: '🔐 Your Privacy',
        content: 'Your breathing data never leaves your computer. You have full control: export, clear, or keep it private. No accounts, no tracking, no ads.',
        action: 'I understand'
      },
      {
        title: '🧘‍♀️ Start Breathing',
        content: 'Ready to begin? Just breathe along with the gentle animation. Click the status bar to toggle, right-click to cycle patterns.',
        action: 'Let\'s breathe'
      }
    ];
  }
}
