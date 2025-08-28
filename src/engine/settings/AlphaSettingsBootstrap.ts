import * as vscode from 'vscode';
import { ModernSettingsManager } from './ModernSettingsManager';
import { BreathingModule } from './modules/BreathingModule';
import { AnimationModule } from './modules/AnimationModule';
import { GamificationModule } from './modules/GamificationModule';

/**
 * Settings bootstrap
 * 
 * Initializes the modern settings system with clean defaults
 */
export class AlphaSettingsBootstrap {
  constructor(private settingsManager: ModernSettingsManager) {}

  async initialize(): Promise<void> {
    // Register all modules
    this.settingsManager.registerModule(new BreathingModule());
    this.settingsManager.registerModule(new AnimationModule());
    this.settingsManager.registerModule(new GamificationModule());

    // Initialize with clean defaults
    const hasModernSettings = await this.hasExistingModernSettings();
    if (!hasModernSettings) {
      console.log('Initializing modern settings with defaults');
      await this.settingsManager.resetAll();
    }
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults(): Promise<boolean> {
    try {
      const result = await vscode.window.showInformationMessage(
        'Reset all settings to defaults?',
        'Yes, Reset', 'Cancel'
      );

      if (result !== 'Yes, Reset') {
        return false;
      }

      await this.settingsManager.resetAll();
      vscode.window.showInformationMessage('Settings reset to defaults');
      return true;
      
    } catch (error) {
      vscode.window.showErrorMessage(`Reset failed: ${error}`);
      return false;
    }
  }

  private async hasExistingModernSettings(): Promise<boolean> {
    const stored = this.settingsManager['context'].workspaceState.get('breathMaster.modernSettings');
    return stored !== undefined;
  }

}