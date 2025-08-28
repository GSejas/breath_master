import * as vscode from 'vscode';
import { ModernSettingsManager } from './ModernSettingsManager';
import { BreathingModule } from './modules/BreathingModule';
import { AnimationModule } from './modules/AnimationModule';
import { GamificationModule } from './modules/GamificationModule';

/**
 * Alpha-phase settings bootstrap
 * 
 * Since we're in alpha with no external users, this simply:
 * 1. Initializes the modern settings system with clean defaults
 * 2. Ignores any legacy settings (developer can manually preserve if needed)
 * 3. Provides simple migration command for developer testing
 */
export class AlphaSettingsBootstrap {
  constructor(private settingsManager: ModernSettingsManager) {}

  async initialize(): Promise<void> {
    // Register all modules
    this.settingsManager.registerModule(new BreathingModule());
    this.settingsManager.registerModule(new AnimationModule());
    this.settingsManager.registerModule(new GamificationModule());

    // Initialize with clean defaults (alpha approach)
    const hasModernSettings = await this.hasExistingModernSettings();
    if (!hasModernSettings) {
      console.log('Alpha: Initializing clean modern settings (ignoring any legacy config)');
      await this.settingsManager.resetAll();
    }
  }

  /**
   * Developer-only migration command for testing purposes
   */
  async runDeveloperMigration(): Promise<boolean> {
    try {
      const legacyData = this.extractLegacySettings();
      
      if (!legacyData || Object.keys(legacyData).length === 0) {
        vscode.window.showInformationMessage('No legacy settings found to migrate');
        return false;
      }

      // Show developer what will be migrated
      const preview = JSON.stringify(legacyData, null, 2);
      const result = await vscode.window.showInformationMessage(
        `Found legacy settings:\n${preview}\n\nMigrate to modern format?`,
        'Yes, Migrate', 'Cancel'
      );

      if (result !== 'Yes, Migrate') {
        return false;
      }

      // Perform migration
      await this.migrateBreathingSettings(legacyData);
      await this.migrateAnimationSettings(legacyData);
      await this.migrateGamificationSettings(legacyData);

      vscode.window.showInformationMessage('Legacy settings migrated to modern format');
      return true;
      
    } catch (error) {
      vscode.window.showErrorMessage(`Migration failed: ${error}`);
      return false;
    }
  }

  private async hasExistingModernSettings(): Promise<boolean> {
    const stored = this.settingsManager['context'].workspaceState.get('breathMaster.modernSettings');
    return stored !== undefined;
  }

  private extractLegacySettings(): any {
    const config = vscode.workspace.getConfiguration('breathMaster');
    
    const legacy = {
      pattern: config.get<string>('pattern'),
      customPattern: config.get<string>('customPattern'),
      intensity: config.get<number>('intensity'),
      enableGamification: config.get<boolean>('enableGamification'),
      gamificationCommitment: config.get<string>('gamificationCommitment'),
      dataPrivacy: config.get<string>('dataPrivacy'),
      animationPreset: config.get<string>('animation.preset'),
      animationFigures: config.get<any>('animation.figures')
    };

    // Filter out undefined values
    return Object.fromEntries(
      Object.entries(legacy).filter(([_, value]) => value !== undefined)
    );
  }

  private async migrateBreathingSettings(legacy: any): Promise<void> {
    const breathingModule = new BreathingModule();
    const migrated = breathingModule.migrate(legacy, '0.3.2');
    await this.settingsManager.set('breathing', migrated);
  }

  private async migrateAnimationSettings(legacy: any): Promise<void> {
    const animationModule = new AnimationModule();
    const migrated = animationModule.migrate(legacy, '0.3.2');
    await this.settingsManager.set('animation', migrated);
  }

  private async migrateGamificationSettings(legacy: any): Promise<void> {
    const gamificationModule = new GamificationModule();
    const migrated = gamificationModule.migrate(legacy, '0.3.2');
    await this.settingsManager.set('gamification', migrated);
  }
}