import { SettingsModule, SettingsCategory, ExperienceLevel, ValidationResult } from '../types';
import { Validator } from '../validators';

export interface DisplaySettings {
  showSessionTimer: boolean;
  showBoth: boolean;
  showNotifications: boolean;
  tickMs: number;
  enabled: boolean;
  gentleReminder: {
    cadence: 'off' | 'low' | 'standard' | 'high';
    messages: string[];
  };
}

export class DisplayModule implements SettingsModule<DisplaySettings> {
  readonly id = 'display';
  readonly displayName = 'Display & Notifications';
  readonly description = 'Configure status bar display, notifications, and gentle reminders';
  readonly category = SettingsCategory.INTERFACE;
  readonly experienceLevel = ExperienceLevel.BASIC;

  private readonly settingsValidator = Validator.object({
    showSessionTimer: Validator.boolean(),
    showBoth: Validator.boolean(),
    showNotifications: Validator.boolean(),
    tickMs: Validator.number({ min: 16, max: 1000, integer: true }),
    enabled: Validator.boolean(),
    gentleReminder: Validator.object({
      cadence: Validator.string({ enum: ['off', 'low', 'standard', 'high'] }),
      messages: Validator.array(Validator.string({ maxLength: 200 }))
    })
  });

  getDefaults(): DisplaySettings {
    return {
      showSessionTimer: true,
      showBoth: true,
      showNotifications: false,
      tickMs: 100,
      enabled: true,
      gentleReminder: {
        cadence: 'low',
        messages: [
          '🌳 A moment of mindfulness awaits...',
          '🍃 Perhaps a breathing break?',
          '✨ Your well-being matters',
          '🧘‍♀️ Time for a mindful pause'
        ]
      }
    };
  }

  validate(value: unknown): ValidationResult<DisplaySettings> {
    return this.settingsValidator(value) as ValidationResult<DisplaySettings>;
  }

  migrate(from: unknown, version: string): DisplaySettings {
    if (version === '0.3.2') {
      // Migrate from old flat structure
      const legacy = from as any;
      return {
        showSessionTimer: legacy?.showSessionTimer ?? true,
        showBoth: legacy?.showBoth ?? true,
        showNotifications: legacy?.showNotifications ?? false,
        tickMs: legacy?.tickMs || 100,
        enabled: legacy?.enabled ?? true,
        gentleReminder: {
          cadence: legacy?.['gentleReminder.cadence'] || 'low',
          messages: this.getDefaults().gentleReminder.messages
        }
      };
    }
    
    return this.getDefaults();
  }
}