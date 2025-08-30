import * as vscode from 'vscode';
import { BreathingModule } from './modules/BreathingModule';
import { AnimationModule, AnimationSettings } from './modules/AnimationModule';
import { GamificationModule } from './modules/GamificationModule';
import { ISettingsAdapter } from './ISettingsAdapter';

/**
 * VS Code Settings Adapter
 *
 * Bridge between VS Code native settings and our modular validation system.
 * Uses vscode.workspace.getConfiguration() but applies our module validation.
 */
export class VSCodeSettingsAdapter implements ISettingsAdapter {
  private breathingModule = new BreathingModule();
  private animationModule = new AnimationModule();
  private gamificationModule = new GamificationModule();
  
  // For compatibility with existing code that expects settingsManager
  public settingsManager: null = null;

  private getConfig() {
    return vscode.workspace.getConfiguration('breathMaster');
  }

  // Helper to validate and fallback to defaults
  private validateSetting<T>(value: unknown, validator: (val: unknown) => { success: boolean; data?: T }, defaultValue: T): T {
    const result = validator(value);
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    return defaultValue;
  }

  // Breathing settings
  async getBreathingEnabled(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('breathing.enabled', this.breathingModule.getDefaults().enabled);
  }

  async getBreathingPattern(): Promise<string> {
    const config = this.getConfig();
    const value = config.get<string>('breathing.pattern', this.breathingModule.getDefaults().pattern);
    
    // Simple validation for pattern string
    const validPatterns = ['chill', 'medium', 'active', 'boxing', 'relaxing', 'custom'];
    if (validPatterns.includes(value)) {
      return value;
    }
    return 'chill';
  }

  async getCustomPattern(): Promise<[number, number, number, number]> {
    const config = this.getConfig();
    const value = config.get<string>('breathing.customPattern', '4-4-4-4');
    
    // Parse and validate the pattern string
    const parts = value.split('-').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n) && n >= 0 && n <= 30)) {
      return [parts[0], parts[1], parts[2], parts[3]];
    }
    
    return this.breathingModule.getDefaults().customPattern;
  }

  async getSessionDuration(): Promise<number> {
    const config = this.getConfig();
    return config.get<number>('breathing.sessionDuration', this.breathingModule.getDefaults().sessionDuration);
  }

  // Animation settings
  async getAnimationIntensity(): Promise<number> {
    const config = this.getConfig();
    return config.get<number>('animation.intensity', this.animationModule.getDefaults().intensity);
  }

  async getAnimationPreset(): Promise<string> {
    const config = this.getConfig();
    return config.get<string>('animation.preset', this.animationModule.getDefaults().preset);
  }

  async getAnimationTickRate(): Promise<number> {
    const config = this.getConfig();
    return config.get<number>('animation.tickMs', this.animationModule.getDefaults().timing.tickRate);
  }

  async getAnimationSettings(): Promise<AnimationSettings> {
    const intensity = await this.getAnimationIntensity();
    const preset = await this.getAnimationPreset();
    const tickRate = await this.getAnimationTickRate();
    
    return {
      preset: preset as any,
      intensity,
      figures: {
        inhale: ['$(circle-small-filled)', '$(circle-filled)', '$(record)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(record)', '$(circle-filled)', '$(circle-small-filled)'],
        hold2: ['$(circle-small-filled)', '$(circle-small-filled)', '$(circle-small-filled)']
      },
      timing: { tickRate },
      statusBar: {
        position: 'left',
        showPhase: true,
        showProgress: false
      },
      notifications: {
        phaseChanges: await this.getShowNotifications()
      },
      smoothing: {
        enabled: true,
        factor: 0.1
      }
    };
  }

  async getAnimationFigures(): Promise<AnimationSettings['figures']> {
    return {
      inhale: ['$(circle-small-filled)', '$(circle-filled)', '$(record)'],
      hold1: ['$(record)', '$(record)', '$(record)'],
      exhale: ['$(record)', '$(circle-filled)', '$(circle-small-filled)'],
      hold2: ['$(circle-small-filled)', '$(circle-small-filled)', '$(circle-small-filled)']
    };
  }

  async shouldShowPhase(): Promise<boolean> {
    return true; // Default to showing phase
  }

  async shouldShowPhaseChangeNotifications(): Promise<boolean> {
    return await this.getShowNotifications();
  }

  async getStatusBarPosition(): Promise<'left' | 'right'> {
    return 'left'; // Default to left
  }

  async getSmoothingEnabled(): Promise<boolean> {
    return true; // Default enabled
  }

  async getSmoothingFactor(): Promise<number> {
    return 0.1; // Default smoothing
  }

  // Gamification settings
  async getGamificationEnabled(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('gamification.enabled', this.gamificationModule.getDefaults().enabled);
  }

  async getGamificationCommitment(): Promise<string> {
    const config = this.getConfig();
    return config.get<string>('gamification.commitment', this.gamificationModule.getDefaults().commitment);
  }

  async getDataPrivacy(): Promise<string> {
    const config = this.getConfig();
    return config.get<string>('gamification.dataPrivacy', this.gamificationModule.getDefaults().privacy);
  }

  async getChallengesEnabled(): Promise<boolean> {
    return true; // Default enabled, could be added to VS Code settings later
  }

  async getGamificationSettings(): Promise<any> {
    const config = this.getConfig();
    const defaults = this.gamificationModule.getDefaults();
    return {
      enabled: config.get<boolean>('gamification.enabled', defaults.enabled),
      commitment: config.get<string>('gamification.commitment', defaults.commitment),
      privacy: config.get<string>('gamification.dataPrivacy', defaults.privacy),
      challenges: {
        enabled: config.get<boolean>('gamification.challenges.enabled', defaults.challenges.enabled),
        difficulty: config.get<string>('gamification.challenges.difficulty', defaults.challenges.difficulty),
        notifications: config.get<boolean>('gamification.challenges.notifications', defaults.challenges.notifications)
      },
      pledges: {
        enabled: config.get<boolean>('gamification.pledges.enabled', defaults.pledges.enabled),
        maxActive: config.get<number>('gamification.pledges.maxActive', defaults.pledges.maxActive),
        defaultDuration: config.get<number>('gamification.pledges.defaultDuration', defaults.pledges.defaultDuration)
      },
      progression: {
        showLevel: config.get<boolean>('gamification.progression.showLevel', defaults.progression.showLevel),
        showXP: config.get<boolean>('gamification.progression.showXP', defaults.progression.showXP),
        showStreak: config.get<boolean>('gamification.progression.showStreak', defaults.progression.showStreak),
        celebrateAchievements: config.get<boolean>('gamification.progression.celebrateAchievements', defaults.progression.celebrateAchievements)
      },
      insights: {
        weeklyReports: config.get<boolean>('gamification.insights.weeklyReports', defaults.insights.weeklyReports),
        monthlyReports: config.get<boolean>('gamification.insights.monthlyReports', defaults.insights.monthlyReports),
        trendAnalysis: config.get<boolean>('gamification.insights.trendAnalysis', defaults.insights.trendAnalysis)
      },
      microMeditation: {
        enabled: config.get<boolean>('gamification.microMeditation.enabled', defaults.microMeditation.enabled),
        timing: config.get<string>('gamification.microMeditation.timing', defaults.microMeditation.timing),
        icon: config.get<string>('gamification.microMeditation.icon', defaults.microMeditation.icon)
      }
    };
  }

  async updateGamificationSettings(settings: any): Promise<void> {
    const config = this.getConfig();
    await config.update('gamification.microMeditation.enabled', settings.microMeditation.enabled, vscode.ConfigurationTarget.Global);
    await config.update('gamification.microMeditation.timing', settings.microMeditation.timing, vscode.ConfigurationTarget.Global);
    await config.update('gamification.microMeditation.icon', settings.microMeditation.icon, vscode.ConfigurationTarget.Global);
  }

  // Stretch settings
  async getStretchCompactMode(): Promise<'auto' | 'on' | 'off'> {
    const config = this.getConfig();
    return config.get<'auto' | 'on' | 'off'>('stretch.compactMode', 'auto');
  }

  async getStretchShowQuotes(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('stretch.showEonQuotes', true);
  }

  async getStretchIconStyle(): Promise<'emoji' | 'none'> {
    const config = this.getConfig();
    return config.get<'emoji' | 'none'>('stretch.iconStyle', 'emoji');
  }

  // Display settings
  async getShowSessionTimer(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('display.showSessionTimer', true);
  }

  async getShowBoth(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('display.showBoth', true);
  }

  async getShowNotifications(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('display.showNotifications', false);
  }

  async getTickMs(): Promise<number> {
    const config = this.getConfig();
    return config.get<number>('animation.tickMs', 100);
  }

  async getDisplayEnabled(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('breathing.enabled', true);
  }

  async getGentleReminderCadence(): Promise<'off' | 'low' | 'standard' | 'high'> {
    const config = this.getConfig();
    return config.get<'off' | 'low' | 'standard' | 'high'>('display.gentleReminderCadence', 'low');
  }

  // Sync/Auth settings (future)
  async getSyncEnabled(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('sync.enabled', false);
  }

  async getSyncSettings(): Promise<string[]> {
    const config = this.getConfig();
    return config.get<string[]>('sync.syncSettings', ['breathing', 'gamification']);
  }

  async getLeaderboardEnabled(): Promise<boolean> {
    const config = this.getConfig();
    return config.get<boolean>('leaderboard.enabled', false);
  }

  // Setters - update VS Code settings
  async setBreathingPattern(pattern: string): Promise<void> {
    const config = this.getConfig();
    await config.update('breathing.pattern', pattern, vscode.ConfigurationTarget.Global);
  }

  async setBreathingEnabled(enabled: boolean): Promise<void> {
    const config = this.getConfig();
    await config.update('breathing.enabled', enabled, vscode.ConfigurationTarget.Global);
  }

  async setCustomPattern(pattern: [number, number, number, number]): Promise<void> {
    const config = this.getConfig();
    const patternString = pattern.join('-');
    await config.update('breathing.customPattern', patternString, vscode.ConfigurationTarget.Global);
  }

  async setAnimationIntensity(intensity: number): Promise<void> {
    const config = this.getConfig();
    await config.update('animation.intensity', intensity, vscode.ConfigurationTarget.Global);
  }

  async setGamificationEnabled(enabled: boolean): Promise<void> {
    const config = this.getConfig();
    await config.update('gamification.enabled', enabled, vscode.ConfigurationTarget.Global);
  }

  async setDataPrivacy(privacy: string): Promise<void> {
    const config = this.getConfig();
    await config.update('gamification.dataPrivacy', privacy, vscode.ConfigurationTarget.Global);
  }

  // Get all settings (for compatibility)
  async getAllSettings(): Promise<any> {
    return {
      breathing: {
        enabled: await this.getBreathingEnabled(),
        pattern: await this.getBreathingPattern(),
        customPattern: await this.getCustomPattern(),
        sessionDuration: await this.getSessionDuration()
      },
      animation: await this.getAnimationSettings(),
      gamification: {
        enabled: await this.getGamificationEnabled(),
        commitment: await this.getGamificationCommitment(),
        privacy: await this.getDataPrivacy(),
        progression: {
          showLevel: true,
          showXP: true,
          showStreak: true,
          celebrateAchievements: true
        }
      },
      stretch: {
        compactMode: await this.getStretchCompactMode(),
        showEonQuotes: await this.getStretchShowQuotes(),
        iconStyle: await this.getStretchIconStyle(),
        enabled: true
      },
      display: {
        showSessionTimer: await this.getShowSessionTimer(),
        showBoth: await this.getShowBoth(),
        showNotifications: await this.getShowNotifications(),
        gentleReminder: {
          cadence: await this.getGentleReminderCadence()
        }
      }
    };
  }
}