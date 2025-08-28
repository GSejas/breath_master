import { SettingsModule, SettingsCategory, ExperienceLevel, ValidationResult } from '../types';
import { Validator } from '../validators';

export interface StretchSettings {
  compactMode: 'auto' | 'on' | 'off';
  showEonQuotes: boolean;
  iconStyle: 'emoji' | 'none';
  enabled: boolean;
}

export class StretchModule implements SettingsModule<StretchSettings> {
  readonly id = 'stretch';
  readonly displayName = 'Stretch Presets';
  readonly description = 'Configure stretch preset notifications and display';
  readonly category = SettingsCategory.INTERFACE;
  readonly experienceLevel = ExperienceLevel.INTERMEDIATE;

  private readonly settingsValidator = Validator.object({
    compactMode: Validator.string({ enum: ['auto', 'on', 'off'] }),
    showEonQuotes: Validator.boolean(),
    iconStyle: Validator.string({ enum: ['emoji', 'none'] }),
    enabled: Validator.boolean()
  });

  getDefaults(): StretchSettings {
    return {
      compactMode: 'auto',
      showEonQuotes: true,
      iconStyle: 'emoji',
      enabled: true
    };
  }

  validate(value: unknown): ValidationResult<StretchSettings> {
    return this.settingsValidator(value) as ValidationResult<StretchSettings>;
  }

  migrate(from: unknown, version: string): StretchSettings {
    if (version === '0.3.2') {
      // Migrate from old flat structure
      const legacy = from as any;
      return {
        compactMode: legacy?.['stretch.compactMode'] || 'auto',
        showEonQuotes: legacy?.['stretch.showEonQuotes'] ?? true,
        iconStyle: legacy?.['stretch.iconStyle'] || 'emoji',
        enabled: true
      };
    }
    
    return this.getDefaults();
  }
}