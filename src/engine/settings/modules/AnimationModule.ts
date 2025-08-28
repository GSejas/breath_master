import { SettingsModule, SettingsCategory, ExperienceLevel, ValidationResult } from '../types';
import { Validator } from '../validators';

export interface AnimationSettings {
  preset: 'default' | 'minimal' | 'nature' | 'custom';
  intensity: number; // 0-1 scale
  figures: {
    inhale: string[];
    hold1: string[];
    exhale: string[];
    hold2: string[];
  };
  smoothing: {
    enabled: boolean;
    factor: number; // 0-1 scale
  };
  statusBar: {
    showPhase: boolean;
    showProgress: boolean;
    position: 'left' | 'right';
  };
}

export class AnimationModule implements SettingsModule<AnimationSettings> {
  readonly id = 'animation';
  readonly displayName = 'Animation & Visuals';
  readonly description = 'Customize breathing animations and visual feedback';
  readonly category = SettingsCategory.ANIMATION;
  readonly experienceLevel = ExperienceLevel.INTERMEDIATE;

  private readonly presetValidator = Validator.string({ 
    enum: [
      'default', 'minimal', 'nature', 'leaves', 'cosmic', 'lunar', 'pulse', 'heartbeat',
      'diamond', 'flow', 'zen', 'aurora', 'matrix', 'binary', 'ocean', 'coffee',
      'game', 'music', 'robot', 'rainbow', 'custom'
    ] 
  });

  private readonly figureArrayValidator = Validator.array(Validator.string({ minLength: 1, maxLength: 50 }));

  private readonly settingsValidator = Validator.object({
    preset: this.presetValidator,
    intensity: Validator.number({ min: 0, max: 1 }),
    figures: Validator.object({
      inhale: this.figureArrayValidator,
      hold1: this.figureArrayValidator,
      exhale: this.figureArrayValidator,
      hold2: this.figureArrayValidator
    }),
    smoothing: Validator.object({
      enabled: Validator.boolean(),
      factor: Validator.number({ min: 0, max: 1 })
    }),
    statusBar: Validator.object({
      showPhase: Validator.boolean(),
      showProgress: Validator.boolean(),
      position: Validator.string({ enum: ['left', 'right'] })
    })
  });

  getDefaults(): AnimationSettings {
    return {
      preset: 'default',
      intensity: 0.7,
      figures: this.getPresetFigures('default'),
      smoothing: {
        enabled: true,
        factor: 0.3
      },
      statusBar: {
        showPhase: true,
        showProgress: false,
        position: 'left'
      }
    };
  }

  private getPresetFigures(preset: string): AnimationSettings['figures'] {
    const presets = {
      // Classic breathing patterns
      default: {
        inhale: ['$(circle-small)', '$(circle)', '$(circle-filled)', '$(record)', '$(circle-large-filled)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(circle-large-filled)', '$(record)', '$(circle-filled)', '$(circle)', '$(circle-small)'],
        hold2: ['$(circle-small)', '$(circle-small)', '$(circle-small)']
      },
      
      minimal: {
        inhale: ['$(primitive-dot)', '$(circle-small)', '$(circle-small-filled)'],
        hold1: ['$(circle-small-filled)', '$(circle-small-filled)'],
        exhale: ['$(circle-small-filled)', '$(circle-small)', '$(primitive-dot)'],
        hold2: ['$(primitive-dot)', '$(primitive-dot)']
      },

      // Nature & organic themes
      nature: {
        inhale: ['$(squirrel)', '$(symbol-event)', '$(lightbulb)', '$(sparkle)', '$(sparkle-filled)'],
        hold1: ['$(sparkle-filled)', '$(sparkle-filled)', '$(sparkle-filled)'],
        exhale: ['$(sparkle-filled)', '$(sparkle)', '$(lightbulb)', '$(symbol-event)', '$(squirrel)'],
        hold2: ['$(squirrel)', '$(squirrel)', '$(squirrel)']
      },

      leaves: {
        inhale: ['$(symbol-misc)', '$(symbol-event)', '$(symbol-color)', '$(symbol-field)', '$(symbol-namespace)'],
        hold1: ['$(symbol-namespace)', '$(symbol-namespace)', '$(symbol-namespace)'],
        exhale: ['$(symbol-namespace)', '$(symbol-field)', '$(symbol-color)', '$(symbol-event)', '$(symbol-misc)'],
        hold2: ['$(symbol-misc)', '$(symbol-misc)', '$(symbol-misc)']
      },

      // Celestial & space themes
      cosmic: {
        inhale: ['$(circle-small)', '$(radio-tower)', '$(telescope)', '$(star-half)', '$(star-full)'],
        hold1: ['$(star-full)', '$(star-full)', '$(star-full)'],
        exhale: ['$(star-full)', '$(star-half)', '$(telescope)', '$(radio-tower)', '$(circle-small)'],
        hold2: ['$(circle-small)', '$(circle-small)', '$(circle-small)']
      },

      lunar: {
        inhale: ['$(circle)', '$(circle-large)', '$(circle-filled)', '$(circle-large-filled)', '$(record)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(record)', '$(circle-large-filled)', '$(circle-filled)', '$(circle-large)', '$(circle)'],
        hold2: ['$(circle)', '$(circle)', '$(circle)']
      },

      // Energy & flow themes  
      pulse: {
        inhale: ['$(pulse)', '$(radio-tower)', '$(broadcast)', '$(megaphone)', '$(bell)'],
        hold1: ['$(bell)', '$(bell)', '$(bell)'],
        exhale: ['$(bell)', '$(megaphone)', '$(broadcast)', '$(radio-tower)', '$(pulse)'],
        hold2: ['$(pulse)', '$(pulse)', '$(pulse)']
      },

      heartbeat: {
        inhale: ['$(heart)', '$(heart-filled)', '$(pulse)', '$(vm-active)', '$(record)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(record)', '$(vm-active)', '$(pulse)', '$(heart-filled)', '$(heart)'],
        hold2: ['$(heart)', '$(heart)', '$(heart)']
      },

      // Geometric & abstract
      diamond: {
        inhale: ['$(chevron-up)', '$(triangle-up)', '$(stop)', '$(primitive-square)', '$(record)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(record)', '$(primitive-square)', '$(stop)', '$(triangle-down)', '$(chevron-down)'],
        hold2: ['$(chevron-down)', '$(chevron-down)', '$(chevron-down)']
      },

      flow: {
        inhale: ['$(arrow-small-up)', '$(arrow-up)', '$(chevron-up)', '$(triangle-up)', '$(stop)'],
        hold1: ['$(stop)', '$(stop)', '$(stop)'],
        exhale: ['$(stop)', '$(triangle-down)', '$(chevron-down)', '$(arrow-down)', '$(arrow-small-down)'],
        hold2: ['$(arrow-small-down)', '$(arrow-small-down)', '$(arrow-small-down)']
      },

      // Mystical & zen themes
      zen: {
        inhale: ['$(symbol-misc)', '$(circle-small)', '$(lightbulb-empty)', '$(lightbulb)', '$(lightbulb-sparkle)'],
        hold1: ['$(lightbulb-sparkle)', '$(lightbulb-sparkle)', '$(lightbulb-sparkle)'],
        exhale: ['$(lightbulb-sparkle)', '$(lightbulb)', '$(lightbulb-empty)', '$(circle-small)', '$(symbol-misc)'],
        hold2: ['$(symbol-misc)', '$(symbol-misc)', '$(symbol-misc)']
      },

      aurora: {
        inhale: ['$(wand)', '$(sparkle)', '$(color-mode)', '$(paintcan)', '$(beaker)'],
        hold1: ['$(beaker)', '$(beaker)', '$(beaker)'],
        exhale: ['$(beaker)', '$(paintcan)', '$(color-mode)', '$(sparkle)', '$(wand)'],
        hold2: ['$(wand)', '$(wand)', '$(wand)']
      },

      // Tech & code themes
      matrix: {
        inhale: ['$(terminal)', '$(code)', '$(bracket-dot)', '$(debug)', '$(chip)'],
        hold1: ['$(chip)', '$(chip)', '$(chip)'],
        exhale: ['$(chip)', '$(debug)', '$(bracket-dot)', '$(code)', '$(terminal)'],
        hold2: ['$(terminal)', '$(terminal)', '$(terminal)']
      },

      binary: {
        inhale: ['$(circle-small)', '$(primitive-dot)', '$(circle)', '$(circle-filled)', '$(record)'],
        hold1: ['$(record)', '$(primitive-dot)', '$(record)'],
        exhale: ['$(record)', '$(circle-filled)', '$(circle)', '$(primitive-dot)', '$(circle-small)'],
        hold2: ['$(circle-small)', '$(primitive-dot)', '$(circle-small)']
      },

      // Fun & playful themes
      ocean: {
        inhale: ['$(circle-small)', '$(radio-tower)', '$(globe)', '$(cloud)', '$(star-full)'],
        hold1: ['$(star-full)', '$(star-full)', '$(star-full)'],
        exhale: ['$(star-full)', '$(cloud)', '$(globe)', '$(radio-tower)', '$(circle-small)'],
        hold2: ['$(circle-small)', '$(circle-small)', '$(circle-small)']
      },

      coffee: {
        inhale: ['$(coffee)', '$(symbol-misc)', '$(flame)', '$(vm-active)', '$(ruby)'],
        hold1: ['$(ruby)', '$(ruby)', '$(ruby)'],
        exhale: ['$(ruby)', '$(vm-active)', '$(flame)', '$(symbol-misc)', '$(coffee)'],
        hold2: ['$(coffee)', '$(coffee)', '$(coffee)']
      },

      game: {
        inhale: ['$(game)', '$(target)', '$(shield)', '$(rocket)', '$(trophy)'],
        hold1: ['$(trophy)', '$(trophy)', '$(trophy)'],
        exhale: ['$(trophy)', '$(rocket)', '$(shield)', '$(target)', '$(game)'],
        hold2: ['$(game)', '$(game)', '$(game)']
      },

      music: {
        inhale: ['$(music)', '$(radio-tower)', '$(megaphone)', '$(bell)', '$(piano)'],
        hold1: ['$(piano)', '$(piano)', '$(piano)'],
        exhale: ['$(piano)', '$(bell)', '$(megaphone)', '$(radio-tower)', '$(music)'],
        hold2: ['$(music)', '$(music)', '$(music)']
      },

      robot: {
        inhale: ['$(robot)', '$(chip)', '$(circuit-board)', '$(gear)', '$(tools)'],
        hold1: ['$(tools)', '$(tools)', '$(tools)'],
        exhale: ['$(tools)', '$(gear)', '$(circuit-board)', '$(chip)', '$(robot)'],
        hold2: ['$(robot)', '$(robot)', '$(robot)']
      },

      rainbow: {
        inhale: ['$(paintcan)', '$(color-mode)', '$(symbol-color)', '$(beaker)', '$(sparkle-filled)'],
        hold1: ['$(sparkle-filled)', '$(sparkle-filled)', '$(sparkle-filled)'],
        exhale: ['$(sparkle-filled)', '$(beaker)', '$(symbol-color)', '$(color-mode)', '$(paintcan)'],
        hold2: ['$(paintcan)', '$(paintcan)', '$(paintcan)']
      },

      // Custom placeholder
      custom: {
        inhale: ['$(circle-small)', '$(circle)', '$(circle-filled)', '$(record)', '$(circle-large-filled)'],
        hold1: ['$(record)', '$(record)', '$(record)'],
        exhale: ['$(circle-large-filled)', '$(record)', '$(circle-filled)', '$(circle)', '$(circle-small)'],
        hold2: ['$(circle-small)', '$(circle-small)', '$(circle-small)']
      }
    };

    return presets[preset as keyof typeof presets] || presets.default;
  }

  validate(value: unknown): ValidationResult<AnimationSettings> {
    const result = this.settingsValidator(value) as ValidationResult<AnimationSettings>;
    if (!result.success) return result;

    const settings = result.data!;
    
    // Additional validation: ensure all figure arrays have at least one item
    for (const [phase, figures] of Object.entries(settings.figures)) {
      if (figures.length === 0) {
        return {
          success: false,
          errors: [{
            path: `figures.${phase}`,
            message: `${phase} figures array cannot be empty`,
            code: 'EMPTY_ARRAY'
          }]
        };
      }
    }

    return { success: true, data: settings };
  }

  migrate(from: unknown, version: string): AnimationSettings {
    if (version === '0.3.2') {
      const legacy = from as any;
      const defaults = this.getDefaults();
      
      const preset = legacy?.animationPreset || 'default';
      return {
        ...defaults,
        preset: preset as AnimationSettings['preset'],
        intensity: legacy?.intensity || 0.7,
        figures: this.migrateFigures(legacy?.animationFigures) || this.getPresetFigures(preset)
      };
    }
    
    return this.getDefaults();
  }

  private migrateFigures(figures: unknown): AnimationSettings['figures'] | null {
    if (!figures || typeof figures !== 'object') return null;
    
    const obj = figures as any;
    if (obj.inhale && obj.hold1 && obj.exhale && obj.hold2 &&
        Array.isArray(obj.inhale) && Array.isArray(obj.hold1) && 
        Array.isArray(obj.exhale) && Array.isArray(obj.hold2)) {
      return {
        inhale: obj.inhale.filter((f: unknown) => typeof f === 'string'),
        hold1: obj.hold1.filter((f: unknown) => typeof f === 'string'),
        exhale: obj.exhale.filter((f: unknown) => typeof f === 'string'),
        hold2: obj.hold2.filter((f: unknown) => typeof f === 'string')
      };
    }
    
    return null;
  }
}