import { describe, it, expect } from 'vitest';
import { BreathingModule } from '../../../src/engine/settings/modules/BreathingModule';
import { SettingsCategory, ExperienceLevel } from '../../../src/engine/settings/types';

describe('BreathingModule', () => {
  let module: BreathingModule;

  beforeEach(() => {
    module = new BreathingModule();
  });

  describe('module properties', () => {
    it('should have correct metadata', () => {
      expect(module.id).toBe('breathing');
      expect(module.displayName).toBe('Breathing Patterns');
      expect(module.category).toBe(SettingsCategory.BREATHING);
      expect(module.experienceLevel).toBe(ExperienceLevel.BASIC);
    });
  });

  describe('default values', () => {
    it('should return sensible defaults', () => {
      const defaults = module.getDefaults();
      
      expect(defaults).toEqual({
        pattern: 'chill',
        customPattern: [4, 4, 4, 4],
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Time for a mindful breathing session'
        }
      });
    });
  });

  describe('validation', () => {
    it('should validate correct settings', () => {
      const validSettings = {
        pattern: 'medium',
        customPattern: [6, 2, 8, 0],
        sessionDuration: 10,
        autoStart: true,
        reminders: {
          enabled: true,
          frequency: 2,
          message: 'Breathe!'
        }
      };

      const result = module.validate(validSettings);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validSettings);
    });

    it('should reject invalid pattern', () => {
      const invalidSettings = {
        pattern: 'invalid',
        customPattern: [4, 4, 4, 4],
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Test'
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.path === 'pattern')).toBe(true);
    });

    it('should reject invalid custom pattern length', () => {
      const invalidSettings = {
        pattern: 'custom',
        customPattern: [4, 4, 4], // Missing fourth value
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Test'
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.message.includes('exactly 4 values'))).toBe(true);
    });

    it('should reject custom pattern values out of range', () => {
      const invalidSettings = {
        pattern: 'custom',
        customPattern: [4, 4, 35, 4], // 35 is > 30 max
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Test'
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid session duration', () => {
      const invalidSettings = {
        pattern: 'chill',
        customPattern: [4, 4, 4, 4],
        sessionDuration: 0, // Below minimum
        autoStart: false,
        reminders: {
          enabled: false,
          frequency: 4,
          message: 'Test'
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.path === 'sessionDuration')).toBe(true);
    });

    it('should reject invalid reminder frequency', () => {
      const invalidSettings = {
        pattern: 'chill',
        customPattern: [4, 4, 4, 4],
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: true,
          frequency: 25, // Above maximum
          message: 'Test'
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.path === 'reminders.frequency')).toBe(true);
    });

    it('should reject overly long reminder message', () => {
      const longMessage = 'a'.repeat(101); // > 100 char limit
      const invalidSettings = {
        pattern: 'chill',
        customPattern: [4, 4, 4, 4],
        sessionDuration: 5,
        autoStart: false,
        reminders: {
          enabled: true,
          frequency: 4,
          message: longMessage
        }
      };

      const result = module.validate(invalidSettings);
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.path === 'reminders.message')).toBe(true);
    });
  });

  describe('migration from legacy format', () => {
    it('should migrate from v0.3.2 format', () => {
      const legacyData = {
        pattern: 'boxing',
        customPattern: '6-2-8-0'
      };

      const migrated = module.migrate(legacyData, '0.3.2');
      
      expect(migrated.pattern).toBe('boxing');
      expect(migrated.customPattern).toEqual([6, 2, 8, 0]);
      expect(migrated.sessionDuration).toBe(5); // Default
      expect(migrated.autoStart).toBe(false); // Default
      expect(migrated.reminders.enabled).toBe(false); // Default
    });

    it('should handle invalid legacy custom pattern', () => {
      const legacyData = {
        pattern: 'custom',
        customPattern: 'invalid-format'
      };

      const migrated = module.migrate(legacyData, '0.3.2');
      
      expect(migrated.pattern).toBe('custom');
      expect(migrated.customPattern).toEqual([4, 4, 4, 4]); // Fall back to default
    });

    it('should handle missing legacy data', () => {
      const migrated = module.migrate({}, '0.3.2');
      
      expect(migrated.pattern).toBe('chill'); // Default
      expect(migrated.customPattern).toEqual([4, 4, 4, 4]); // Default
    });

    it('should return defaults for unknown version', () => {
      const migrated = module.migrate({ pattern: 'boxing' }, '0.1.0');
      
      expect(migrated).toEqual(module.getDefaults());
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined input', () => {
      expect(module.validate(null).success).toBe(false);
      expect(module.validate(undefined).success).toBe(false);
    });

    it('should handle non-object input', () => {
      expect(module.validate('string').success).toBe(false);
      expect(module.validate(123).success).toBe(false);
      expect(module.validate([]).success).toBe(false);
    });

    it('should validate boundary values', () => {
      const boundarySettings = {
        pattern: 'custom',
        customPattern: [0, 0, 30, 30], // Min/max values
        sessionDuration: 1, // Min
        autoStart: true,
        reminders: {
          enabled: true,
          frequency: 24, // Max
          message: 'a'.repeat(100) // Max length
        }
      };

      const result = module.validate(boundarySettings);
      expect(result.success).toBe(true);
    });

    it('should validate all breathing patterns', () => {
      const patterns = ['chill', 'medium', 'active', 'boxing', 'relaxing', 'custom'];
      
      for (const pattern of patterns) {
        const settings = {
          ...module.getDefaults(),
          pattern
        };
        
        const result = module.validate(settings);
        expect(result.success).toBe(true);
      }
    });
  });
});