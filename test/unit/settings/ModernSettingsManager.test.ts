import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModernSettingsManager } from '../../../src/engine/settings/ModernSettingsManager';
import { SettingsModule, ExperienceLevel, ValidationResult, SettingsCategory } from '../../../src/engine/settings/types';

// Mock VS Code
const mockWorkspaceState = {
  get: vi.fn(),
  update: vi.fn().mockResolvedValue(undefined)
};

const mockContext = {
  workspaceState: mockWorkspaceState
} as any;

// Mock settings module
class MockSettingsModule implements SettingsModule<{ value: string }> {
  readonly id = 'test';
  readonly displayName = 'Test Module';
  readonly category = SettingsCategory.BREATHING;
  readonly experienceLevel = ExperienceLevel.BASIC;
  
  getDefaults() {
    return { value: 'default' };
  }
  
  validate(value: unknown): ValidationResult<{ value: string }> {
    if (typeof value === 'object' && value !== null && 
        typeof (value as any).value === 'string') {
      return { success: true, data: value as { value: string } };
    }
    return { 
      success: false, 
      errors: [{ path: 'value', message: 'Expected string', code: 'TYPE_ERROR' }] 
    };
  }
}

describe('ModernSettingsManager', () => {
  let manager: ModernSettingsManager;
  let mockModule: MockSettingsModule;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ModernSettingsManager(mockContext);
    mockModule = new MockSettingsModule();
  });

  describe('module registration', () => {
    it('should register a module successfully', () => {
      expect(() => manager.registerModule(mockModule)).not.toThrow();
    });

    it('should throw when registering duplicate module', () => {
      manager.registerModule(mockModule);
      expect(() => manager.registerModule(mockModule))
        .toThrow("Settings module 'test' already registered");
    });

    it('should throw when registering module with missing dependency', () => {
      const dependentModule = {
        ...mockModule,
        id: 'dependent',
        dependencies: ['missing']
      };

      expect(() => manager.registerModule(dependentModule))
        .toThrow("Module 'dependent' depends on unregistered module 'missing'");
    });
  });

  describe('getting settings', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
    });

    it('should return defaults when no stored value exists', async () => {
      mockWorkspaceState.get.mockReturnValue(null);

      const result = await manager.get('test');
      expect(result).toEqual({ value: 'default' });
    });

    it('should return stored value when valid', async () => {
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: {
          test: { value: 'stored' }
        },
        userLevel: ExperienceLevel.BASIC
      });

      const result = await manager.get('test');
      expect(result).toEqual({ value: 'stored' });
    });

    it('should return defaults when stored value is invalid', async () => {
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: {
          test: { value: 123 } // Invalid type
        },
        userLevel: ExperienceLevel.BASIC
      });

      const result = await manager.get('test');
      expect(result).toEqual({ value: 'default' });
    });

    it('should throw for unregistered module', async () => {
      await expect(manager.get('nonexistent'))
        .rejects.toThrow("Settings module 'nonexistent' not found");
    });
  });

  describe('setting values', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
      mockWorkspaceState.get.mockReturnValue(null); // Start with clean state
    });

    it('should set valid value successfully', async () => {
      const newValue = { value: 'new' };
      
      await manager.set('test', newValue);
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        expect.objectContaining({
          modules: { test: newValue }
        })
      );
    });

    it('should throw when setting invalid value', async () => {
      const invalidValue = { value: 123 };
      
      await expect(manager.set('test', invalidValue))
        .rejects.toThrow("Invalid value for module 'test'");
    });

    it('should throw for unregistered module', async () => {
      await expect(manager.set('nonexistent', { value: 'test' }))
        .rejects.toThrow("Settings module 'nonexistent' not found");
    });
  });

  describe('experience level filtering', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
      
      const intermediateModule = {
        ...mockModule,
        id: 'intermediate',
        displayName: 'Intermediate Module',
        experienceLevel: ExperienceLevel.INTERMEDIATE
      };
      
      const advancedModule = {
        ...mockModule,
        id: 'advanced',
        displayName: 'Advanced Module', 
        experienceLevel: ExperienceLevel.ADVANCED
      };

      manager.registerModule(intermediateModule);
      manager.registerModule(advancedModule);
    });

    it('should return only basic modules for basic user', () => {
      const modules = manager.getModulesByLevel(ExperienceLevel.BASIC);
      expect(modules).toHaveLength(1);
      expect(modules[0].id).toBe('test');
    });

    it('should return basic and intermediate modules for intermediate user', () => {
      const modules = manager.getModulesByLevel(ExperienceLevel.INTERMEDIATE);
      expect(modules).toHaveLength(2);
      expect(modules.map(m => m.id).sort()).toEqual(['intermediate', 'test']);
    });

    it('should return all modules for advanced user', () => {
      const modules = manager.getModulesByLevel(ExperienceLevel.ADVANCED);
      expect(modules).toHaveLength(3);
      expect(modules.map(m => m.id).sort()).toEqual(['advanced', 'intermediate', 'test']);
    });
  });

  describe('category filtering', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
      
      const animationModule = {
        ...mockModule,
        id: 'animation',
        category: SettingsCategory.ANIMATION
      };

      manager.registerModule(animationModule);
    });

    it('should return modules filtered by category', () => {
      const breathingModules = manager.getModulesByCategory(SettingsCategory.BREATHING);
      expect(breathingModules).toHaveLength(1);
      expect(breathingModules[0].id).toBe('test');

      const animationModules = manager.getModulesByCategory(SettingsCategory.ANIMATION);
      expect(animationModules).toHaveLength(1);
      expect(animationModules[0].id).toBe('animation');
    });

    it('should return empty array for category with no modules', () => {
      const privacyModules = manager.getModulesByCategory(SettingsCategory.PRIVACY);
      expect(privacyModules).toHaveLength(0);
    });
  });

  describe('user level management', () => {
    it('should return basic as default user level', async () => {
      mockWorkspaceState.get.mockReturnValue(null);
      
      const level = await manager.getUserLevel();
      expect(level).toBe(ExperienceLevel.BASIC);
    });

    it('should set and return user level', async () => {
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: {},
        userLevel: ExperienceLevel.INTERMEDIATE
      });

      const level = await manager.getUserLevel();
      expect(level).toBe(ExperienceLevel.INTERMEDIATE);
    });

    it('should update user level', async () => {
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: {},
        userLevel: ExperienceLevel.BASIC
      });

      await manager.setUserLevel(ExperienceLevel.ADVANCED);
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        expect.objectContaining({
          userLevel: ExperienceLevel.ADVANCED
        })
      );
    });
  });

  describe('reset functionality', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: { test: { value: 'custom' } },
        userLevel: ExperienceLevel.BASIC
      });
    });

    it('should reset single module to defaults', async () => {
      await manager.reset('test');
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        expect.objectContaining({
          modules: { test: { value: 'default' } }
        })
      );
    });

    it('should reset all modules to defaults', async () => {
      await manager.resetAll();
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        expect.objectContaining({
          modules: { test: { value: 'default' } },
          userLevel: ExperienceLevel.BASIC
        })
      );
    });
  });

  describe('import/export', () => {
    beforeEach(() => {
      manager.registerModule(mockModule);
    });

    it('should export settings as JSON', async () => {
      mockWorkspaceState.get.mockReturnValue({
        version: '1.0.0',
        modules: { test: { value: 'exported' } },
        userLevel: ExperienceLevel.INTERMEDIATE
      });

      const exported = await manager.exportSettings();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toEqual({
        version: '1.0.0',
        modules: { test: { value: 'exported' } },
        userLevel: ExperienceLevel.INTERMEDIATE
      });
    });

    it('should import valid settings', async () => {
      const importData = {
        version: '1.0.0',
        modules: { test: { value: 'imported' } },
        userLevel: ExperienceLevel.ADVANCED
      };

      await manager.importSettings(JSON.stringify(importData));
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        importData
      );
    });

    it('should skip invalid module data during import', async () => {
      const importData = {
        version: '1.0.0',
        modules: { 
          test: { value: 'valid' },
          invalid: { value: 123 } // This should be filtered out
        },
        userLevel: ExperienceLevel.BASIC
      };

      await manager.importSettings(JSON.stringify(importData));
      
      expect(mockWorkspaceState.update).toHaveBeenCalledWith(
        'breathMaster.modernSettings',
        expect.objectContaining({
          modules: { test: { value: 'valid' } } // invalid module data removed
        })
      );
    });

    it('should throw on malformed JSON', async () => {
      await expect(manager.importSettings('invalid json'))
        .rejects.toThrow('Failed to import settings');
    });
  });
});