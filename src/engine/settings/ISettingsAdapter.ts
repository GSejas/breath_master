import { AnimationSettings } from './modules/AnimationModule';

/**
 * Interface for settings adapters
 * Allows different implementations while maintaining compatibility
 */
export interface ISettingsAdapter {
  // Core methods that both adapters need to implement
  getBreathingEnabled(): Promise<boolean>;
  getBreathingPattern(): Promise<string>;
  getCustomPattern(): Promise<[number, number, number, number]>;
  getAnimationSettings(): Promise<AnimationSettings>;
  getAnimationFigures(): Promise<AnimationSettings['figures']>;
  getAnimationTickRate(): Promise<number>;
  getAnimationIntensity(): Promise<number>;
  getGamificationEnabled(): Promise<boolean>;
  getShowSessionTimer(): Promise<boolean>;
  getShowBoth(): Promise<boolean>;
  getShowNotifications(): Promise<boolean>;
  getStretchCompactMode(): Promise<'auto' | 'on' | 'off'>;
  getStretchShowQuotes(): Promise<boolean>;
  getStretchIconStyle(): Promise<'emoji' | 'none'>;
  getGentleReminderCadence(): Promise<'off' | 'low' | 'standard' | 'high'>;
  getDataPrivacy(): Promise<string>;
  
  // Status bar display methods
  shouldShowPhase(): Promise<boolean>;
  shouldShowPhaseChangeNotifications(): Promise<boolean>;
  getStatusBarPosition(): Promise<'left' | 'right'>;
  
  // Setters
  setBreathingEnabled(enabled: boolean): Promise<void>;
  setBreathingPattern(pattern: string): Promise<void>;
  setGamificationEnabled(enabled: boolean): Promise<void>;
  setDataPrivacy(privacy: string): Promise<void>;
  
  // Compatibility
  getAllSettings(): Promise<any>;
}