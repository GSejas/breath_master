import { SettingsModule, SettingsCategory, ExperienceLevel, ValidationResult } from '../types';
import { Validator } from '../validators';

export interface GamificationSettings {
  enabled: boolean;
  commitment: 'minimal' | 'balanced' | 'nature';
  privacy: 'local-only' | 'export-allowed';
  challenges: {
    enabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    notifications: boolean;
  };
  pledges: {
    enabled: boolean;
    maxActive: number;
    defaultDuration: number; // days
  };
  progression: {
    showLevel: boolean;
    showXP: boolean;
    showStreak: boolean;
    celebrateAchievements: boolean;
  };
  insights: {
    weeklyReports: boolean;
    monthlyReports: boolean;
    trendAnalysis: boolean;
  };
}

export class GamificationModule implements SettingsModule<GamificationSettings> {
  readonly id = 'gamification';
  readonly displayName = 'Meditation Tracking';
  readonly description = 'Configure progress tracking, challenges, and insights';
  readonly category = SettingsCategory.GAMIFICATION;
  readonly experienceLevel = ExperienceLevel.BASIC;

  private readonly settingsValidator = Validator.object({
    enabled: Validator.boolean(),
    commitment: Validator.string({ enum: ['minimal', 'balanced', 'nature'] }),
    privacy: Validator.string({ enum: ['local-only', 'export-allowed'] }),
    challenges: Validator.object({
      enabled: Validator.boolean(),
      difficulty: Validator.string({ enum: ['easy', 'medium', 'hard'] }),
      notifications: Validator.boolean()
    }),
    pledges: Validator.object({
      enabled: Validator.boolean(),
      maxActive: Validator.number({ min: 1, max: 10, integer: true }),
      defaultDuration: Validator.number({ min: 1, max: 365, integer: true })
    }),
    progression: Validator.object({
      showLevel: Validator.boolean(),
      showXP: Validator.boolean(),
      showStreak: Validator.boolean(),
      celebrateAchievements: Validator.boolean()
    }),
    insights: Validator.object({
      weeklyReports: Validator.boolean(),
      monthlyReports: Validator.boolean(),
      trendAnalysis: Validator.boolean()
    })
  });

  getDefaults(): GamificationSettings {
    return {
      enabled: true,
      commitment: 'balanced',
      privacy: 'local-only',
      challenges: {
        enabled: true,
        difficulty: 'medium',
        notifications: true
      },
      pledges: {
        enabled: true,
        maxActive: 3,
        defaultDuration: 7
      },
      progression: {
        showLevel: true,
        showXP: false,
        showStreak: true,
        celebrateAchievements: true
      },
      insights: {
        weeklyReports: false,
        monthlyReports: false,
        trendAnalysis: false
      }
    };
  }

  validate(value: unknown): ValidationResult<GamificationSettings> {
    return this.settingsValidator(value) as ValidationResult<GamificationSettings>;
  }

  migrate(from: unknown, version: string): GamificationSettings {
    if (version === '0.3.2') {
      const legacy = from as any;
      const defaults = this.getDefaults();
      
      return {
        ...defaults,
        enabled: legacy?.enableGamification !== false,
        commitment: legacy?.gamificationCommitment || 'balanced',
        privacy: legacy?.dataPrivacy || 'local-only'
      };
    }
    
    return this.getDefaults();
  }
}