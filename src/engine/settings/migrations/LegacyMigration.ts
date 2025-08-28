import * as vscode from 'vscode';
import { ModernSettingsManager } from '../ModernSettingsManager';
import { BreathingModule } from '../modules/BreathingModule';
import { AnimationModule } from '../modules/AnimationModule';
import { GamificationModule } from '../modules/GamificationModule';

interface LegacySettings {
  pattern?: string;
  customPattern?: string;
  intensity?: number;
  enableGamification?: boolean;
  gamificationCommitment?: string;
  dataPrivacy?: string;
  animationPreset?: string;
  animationFigures?: {
    inhale?: string[];
    hold1?: string[];
    exhale?: string[];
    hold2?: string[];
  };
}

export class LegacyMigration {
  constructor(private settingsManager: ModernSettingsManager) {}

  async migrateFromLegacy(context: vscode.ExtensionContext): Promise<boolean> {
    const legacyData = this.extractLegacySettings();
    
    if (!legacyData || Object.keys(legacyData).length === 0) {
      return false; // No legacy data found
    }

    console.log('Migrating legacy settings to modern architecture...');
    
    try {
      // Register all modules first
      this.settingsManager.registerModule(new BreathingModule());
      this.settingsManager.registerModule(new AnimationModule());
      this.settingsManager.registerModule(new GamificationModule());

      // Migrate breathing settings
      await this.migrateBreathingSettings(legacyData);
      
      // Migrate animation settings  
      await this.migrateAnimationSettings(legacyData);
      
      // Migrate gamification settings
      await this.migrateGamificationSettings(legacyData);

      // Mark migration as completed
      await context.workspaceState.update('breathMaster.migrationCompleted', '1.0.0');
      
      console.log('Legacy migration completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to migrate legacy settings:', error);
      return false;
    }
  }

  private extractLegacySettings(): LegacySettings {
    const config = vscode.workspace.getConfiguration('breathMaster');
    
    return {
      pattern: config.get<string>('pattern'),
      customPattern: config.get<string>('customPattern'),
      intensity: config.get<number>('intensity'),
      enableGamification: config.get<boolean>('enableGamification'),
      gamificationCommitment: config.get<string>('gamificationCommitment'),
      dataPrivacy: config.get<string>('dataPrivacy'),
      animationPreset: config.get<string>('animation.preset'),
      animationFigures: config.get<any>('animation.figures')
    };
  }

  private async migrateBreathingSettings(legacy: LegacySettings): Promise<void> {
    const breathingModule = new BreathingModule();
    const defaults = breathingModule.getDefaults();
    
    const migratedSettings = {
      ...defaults,
      pattern: this.validatePattern(legacy.pattern) || defaults.pattern,
      customPattern: this.parseCustomPattern(legacy.customPattern) || defaults.customPattern
    };

    await this.settingsManager.set('breathing', migratedSettings);
  }

  private async migrateAnimationSettings(legacy: LegacySettings): Promise<void> {
    const animationModule = new AnimationModule();
    const defaults = animationModule.getDefaults();
    
    const migratedSettings = {
      ...defaults,
      preset: this.validateAnimationPreset(legacy.animationPreset) || defaults.preset,
      intensity: legacy.intensity ?? defaults.intensity,
      figures: this.migrateFigures(legacy.animationFigures) || defaults.figures
    };

    await this.settingsManager.set('animation', migratedSettings);
  }

  private async migrateGamificationSettings(legacy: LegacySettings): Promise<void> {
    const gamificationModule = new GamificationModule();
    const defaults = gamificationModule.getDefaults();
    
    const migratedSettings = {
      ...defaults,
      enabled: legacy.enableGamification ?? defaults.enabled,
      commitment: this.validateCommitment(legacy.gamificationCommitment) || defaults.commitment,
      privacy: this.validatePrivacy(legacy.dataPrivacy) || defaults.privacy
    };

    await this.settingsManager.set('gamification', migratedSettings);
  }

  private validatePattern(pattern: string | undefined): string | null {
    const validPatterns = ['chill', 'medium', 'active', 'boxing', 'relaxing', 'custom'];
    return pattern && validPatterns.includes(pattern) ? pattern : null;
  }

  private parseCustomPattern(pattern: string | undefined): [number, number, number, number] | null {
    if (!pattern) return null;
    
    const parts = pattern.split('-').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n) && n >= 0 && n <= 30)) {
      return parts as [number, number, number, number];
    }
    
    return null;
  }

  private validateAnimationPreset(preset: string | undefined): string | null {
    const validPresets = ['default', 'minimal', 'nature', 'custom'];
    return preset && validPresets.includes(preset) ? preset : null;
  }

  private validateCommitment(commitment: string | undefined): string | null {
    const validCommitments = ['minimal', 'balanced', 'nature'];
    return commitment && validCommitments.includes(commitment) ? commitment : null;
  }

  private validatePrivacy(privacy: string | undefined): string | null {
    const validPrivacy = ['local-only', 'export-allowed'];
    return privacy && validPrivacy.includes(privacy) ? privacy : null;
  }

  private migrateFigures(figures: any): any | null {
    if (!figures || typeof figures !== 'object') return null;
    
    const phases = ['inhale', 'hold1', 'exhale', 'hold2'];
    const migratedFigures: any = {};
    
    for (const phase of phases) {
      if (Array.isArray(figures[phase]) && 
          figures[phase].every((f: any) => typeof f === 'string' && f.length > 0)) {
        migratedFigures[phase] = figures[phase];
      } else {
        return null; // Invalid figures, use defaults
      }
    }
    
    return migratedFigures;
  }

  async shouldRunMigration(context: vscode.ExtensionContext): Promise<boolean> {
    const migrationCompleted = context.workspaceState.get<string>('breathMaster.migrationCompleted');
    
    // Skip if already migrated to version 1.0.0 or later
    if (migrationCompleted && migrationCompleted >= '1.0.0') {
      return false;
    }

    // Check if there are any legacy settings to migrate
    const legacyData = this.extractLegacySettings();
    return legacyData && Object.keys(legacyData).some(key => (legacyData as any)[key] !== undefined);
  }
}