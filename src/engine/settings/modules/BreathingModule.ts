import { SettingsModule, SettingsCategory, ExperienceLevel, ValidationResult } from '../types';
import { Validator } from '../validators';

export interface BreathingSettings {
  pattern: 'chill' | 'medium' | 'active' | 'boxing' | 'relaxing' | 'custom';
  customPattern: [number, number, number, number];
  sessionDuration: number; // minutes
  autoStart: boolean;
  reminders: {
    enabled: boolean;
    frequency: number; // hours
    message: string;
  };
}

export class BreathingModule implements SettingsModule<BreathingSettings> {
  readonly id = 'breathing';
  readonly displayName = 'Breathing Patterns';
  readonly description = 'Configure breathing patterns and session preferences';
  readonly category = SettingsCategory.BREATHING;
  readonly experienceLevel = ExperienceLevel.BASIC;

  private readonly patternValidator = Validator.string({ 
    enum: ['chill', 'medium', 'active', 'boxing', 'relaxing', 'custom'] 
  });

  private readonly customPatternValidator = Validator.array(
    Validator.number({ min: 0, max: 30, integer: true })
  );

  private readonly settingsValidator = Validator.object({
    pattern: this.patternValidator,
    customPattern: (value: unknown) => {
      const result = this.customPatternValidator(value);
      if (!result.success) return result;
      
      if (result.data!.length !== 4) {
        return { 
          success: false, 
          errors: [{ path: '', message: 'Custom pattern must have exactly 4 values', code: 'ARRAY_LENGTH' }] 
        };
      }
      
      return { success: true, data: result.data as [number, number, number, number] };
    },
    sessionDuration: Validator.number({ min: 1, max: 120, integer: true }),
    autoStart: Validator.boolean(),
    reminders: Validator.object({
      enabled: Validator.boolean(),
      frequency: Validator.number({ min: 1, max: 24, integer: true }),
      message: Validator.string({ maxLength: 100 })
    })
  });

  getDefaults(): BreathingSettings {
    return {
      pattern: 'chill',
      customPattern: [4, 4, 4, 4],
      sessionDuration: 5,
      autoStart: false,
      reminders: {
        enabled: false,
        frequency: 4,
        message: 'Time for a mindful breathing session'
      }
    };
  }

  validate(value: unknown): ValidationResult<BreathingSettings> {
    return this.settingsValidator(value) as ValidationResult<BreathingSettings>;
  }

  migrate(from: unknown, version: string): BreathingSettings {
    if (version === '0.3.2') {
      // Migrate from old flat structure
      const legacy = from as any;
      return {
        pattern: legacy?.pattern || 'chill',
        customPattern: this.parseCustomPattern(legacy?.customPattern) || [4, 4, 4, 4],
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Time for a mindful breathing session'
        }
      };
    }
    
    return this.getDefaults();
  }

  private parseCustomPattern(pattern: unknown): [number, number, number, number] | null {
    if (typeof pattern === 'string') {
      const parts = pattern.split('-').map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n) && n >= 0 && n <= 30)) {
        return parts as [number, number, number, number];
      }
    }
    return null;
  }
}