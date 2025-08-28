import { ModernSettingsManager } from './ModernSettingsManager';
import { BreathingSettings } from './modules/BreathingModule';
import { AnimationSettings } from './modules/AnimationModule';
import { GamificationSettings } from './modules/GamificationModule';
import { StretchSettings } from './modules/StretchModule';
import { DisplaySettings } from './modules/DisplayModule';

/**
 * Settings Adapter
 *
 * Bridge between the modern modular settings system and existing extension code.
 * Provides a familiar interface while using the new type-safe settings underneath.
 *
 * ## Purpose:
 * This adapter allows gradual migration of extension code without breaking changes.
 * It maintains backward compatibility while providing access to the new settings system.
 *
 * ## Usage:
 * ```typescript
 * // Create adapter with settings manager
 * const adapter = new SettingsAdapter(settingsManager);
 *
 * // Use familiar methods
 * const pattern = await adapter.getBreathingPattern();
 * const enabled = await adapter.getBreathingEnabled();
 * const figures = await adapter.getAnimationFigures();
 *
 * // Update settings
 * await adapter.setBreathingEnabled(true);
 * await adapter.setAnimationIntensity(0.8);
 * ```
 *
 * ## Available Methods:
 *
 * ### Breathing Settings:
 * - `getBreathingEnabled()`: Get breathing enabled state
 * - `setBreathingEnabled(enabled)`: Enable/disable breathing
 * - `getBreathingPattern()`: Get current breathing pattern
 * - `setBreathingPattern(pattern)`: Set breathing pattern
 * - `getCustomPattern()`: Get custom pattern durations
 * - `setCustomPattern(pattern)`: Set custom pattern
 * - `getSessionDuration()`: Get session duration in minutes
 *
 * ### Animation Settings:
 * - `getAnimationPreset()`: Get current animation preset
 * - `getAnimationIntensity()`: Get animation intensity (0-1)
 * - `setAnimationIntensity(intensity)`: Set animation intensity
 * - `getAnimationFigures()`: Get animation figures for all phases
 * - `getAnimationSettings()`: Get all animation settings
 * - `getAnimationTickRate()`: Get animation update frequency
 * - `getStatusBarPosition()`: Get status bar position preference
 * - `shouldShowPhase()`: Check if phase should be shown
 * - `shouldShowPhaseChangeNotifications()`: Check if phase change notifications enabled
 *
 * ### Gamification Settings:
 * - `getGamificationEnabled()`: Get gamification enabled state
 * - `setGamificationEnabled(enabled)`: Enable/disable gamification
 * - `getGamificationCommitment()`: Get commitment level
 * - `setGamificationCommitment(level)`: Set commitment level
 * - `getDataPrivacy()`: Get data privacy setting
 * - `setDataPrivacy(privacy)`: Set data privacy level
 * - `getChallengesEnabled()`: Get challenges enabled state
 *
 * ### Utility Methods:
 * - `getAllSettings()`: Get all settings for debugging
 */
export class SettingsAdapter {
  constructor(private settingsManager: ModernSettingsManager) {}

  // Breathing settings
  async getBreathingPattern(): Promise<string> {
    const settings = await this.settingsManager.get<BreathingSettings>('breathing');
    return settings.pattern;
  }

  async getBreathingEnabled(): Promise<boolean> {
    const settings = await this.settingsManager.get<BreathingSettings>('breathing');
    return settings.enabled;
  }

  async getCustomPattern(): Promise<[number, number, number, number]> {
    const settings = await this.settingsManager.get<BreathingSettings>('breathing');
    return settings.customPattern;
  }

  async getSessionDuration(): Promise<number> {
    const settings = await this.settingsManager.get<BreathingSettings>('breathing');
    return settings.sessionDuration;
  }

  // Animation settings
  async getAnimationPreset(): Promise<string> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.preset;
  }

  async getAnimationIntensity(): Promise<number> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.intensity;
  }

  async getAnimationFigures(): Promise<AnimationSettings['figures']> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.figures;
  }

  async getAnimationSettings(): Promise<AnimationSettings> {
    return await this.settingsManager.get<AnimationSettings>('animation');
  }

  async getAnimationTickRate(): Promise<number> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.timing.tickRate;
  }

  async getStatusBarPosition(): Promise<'left' | 'right'> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.statusBar.position;
  }

  async shouldShowPhase(): Promise<boolean> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.statusBar.showPhase;
  }

  async shouldShowPhaseChangeNotifications(): Promise<boolean> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.notifications.phaseChanges;
  }

  async getSmoothingEnabled(): Promise<boolean> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.smoothing.enabled;
  }

  async getSmoothingFactor(): Promise<number> {
    const settings = await this.settingsManager.get<AnimationSettings>('animation');
    return settings.smoothing.factor;
  }

  // Gamification settings
  async getGamificationEnabled(): Promise<boolean> {
    const settings = await this.settingsManager.get<GamificationSettings>('gamification');
    return settings.enabled;
  }

  async getGamificationCommitment(): Promise<string> {
    const settings = await this.settingsManager.get<GamificationSettings>('gamification');
    return settings.commitment;
  }

  async getDataPrivacy(): Promise<string> {
    const settings = await this.settingsManager.get<GamificationSettings>('gamification');
    return settings.privacy;
  }

  async getChallengesEnabled(): Promise<boolean> {
    const settings = await this.settingsManager.get<GamificationSettings>('gamification');
    return settings.challenges.enabled;
  }

  // Convenience method to get all current settings (for debugging)
  async getAllSettings(): Promise<{
    breathing: BreathingSettings;
    animation: AnimationSettings;
    gamification: GamificationSettings;
  }> {
    return {
      breathing: await this.settingsManager.get<BreathingSettings>('breathing'),
      animation: await this.settingsManager.get<AnimationSettings>('animation'),
      gamification: await this.settingsManager.get<GamificationSettings>('gamification')
    };
  }

  // Update methods
  async setBreathingPattern(pattern: string): Promise<void> {
    const current = await this.settingsManager.get<BreathingSettings>('breathing');
    await this.settingsManager.set('breathing', { ...current, pattern });
  }

  async setBreathingEnabled(enabled: boolean): Promise<void> {
    const current = await this.settingsManager.get<BreathingSettings>('breathing');
    await this.settingsManager.set('breathing', { ...current, enabled });
  }

  async setCustomPattern(pattern: [number, number, number, number]): Promise<void> {
    const current = await this.settingsManager.get<BreathingSettings>('breathing');
    await this.settingsManager.set('breathing', { ...current, customPattern: pattern });
  }

  async setAnimationIntensity(intensity: number): Promise<void> {
    const current = await this.settingsManager.get<AnimationSettings>('animation');
    await this.settingsManager.set('animation', { ...current, intensity });
  }

  async setGamificationEnabled(enabled: boolean): Promise<void> {
    const current = await this.settingsManager.get<GamificationSettings>('gamification');
    await this.settingsManager.set('gamification', { ...current, enabled });
  }

  async setDataPrivacy(privacy: string): Promise<void> {
    const current = await this.settingsManager.get<GamificationSettings>('gamification');
    await this.settingsManager.set('gamification', { ...current, privacy });
  }

  // Stretch settings
  async getStretchCompactMode(): Promise<'auto' | 'on' | 'off'> {
    const settings = await this.settingsManager.get<StretchSettings>('stretch');
    return settings.compactMode;
  }

  async getStretchShowQuotes(): Promise<boolean> {
    const settings = await this.settingsManager.get<StretchSettings>('stretch');
    return settings.showEonQuotes;
  }

  async getStretchIconStyle(): Promise<'emoji' | 'none'> {
    const settings = await this.settingsManager.get<StretchSettings>('stretch');
    return settings.iconStyle;
  }

  // Display settings
  async getShowSessionTimer(): Promise<boolean> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.showSessionTimer;
  }

  async getShowBoth(): Promise<boolean> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.showBoth;
  }

  async getShowNotifications(): Promise<boolean> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.showNotifications;
  }

  async getTickMs(): Promise<number> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.tickMs;
  }

  async getDisplayEnabled(): Promise<boolean> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.enabled;
  }

  async getGentleReminderCadence(): Promise<'off' | 'low' | 'standard' | 'high'> {
    const settings = await this.settingsManager.get<DisplaySettings>('display');
    return settings.gentleReminder.cadence;
  }
}