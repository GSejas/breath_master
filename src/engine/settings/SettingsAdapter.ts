import { ModernSettingsManager } from './ModernSettingsManager';
import { BreathingSettings } from './modules/BreathingModule';
import { AnimationSettings } from './modules/AnimationModule';
import { GamificationSettings } from './modules/GamificationModule';

/**
 * Adapter to bridge the modern settings system with existing extension code
 * 
 * Provides the same interface the extension expects while using the new modular system underneath.
 * This allows gradual migration of extension code without breaking changes.
 */
export class SettingsAdapter {
  constructor(private settingsManager: ModernSettingsManager) {}

  // Breathing settings
  async getBreathingPattern(): Promise<string> {
    const settings = await this.settingsManager.get<BreathingSettings>('breathing');
    return settings.pattern;
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
}