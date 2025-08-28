export interface SettingsModule<T = any> {
  readonly id: string;
  readonly displayName: string;
  readonly description?: string;
  readonly category: SettingsCategory;
  readonly experienceLevel: ExperienceLevel;
  readonly dependencies?: string[];
  
  getDefaults(): T;
  validate(value: unknown): ValidationResult<T>;
  migrate?(from: unknown, version: string): T;
  serialize?(value: T): unknown;
  deserialize?(value: unknown): T;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export enum SettingsCategory {
  BREATHING = 'breathing',
  ANIMATION = 'animation', 
  GAMIFICATION = 'gamification',
  INTERFACE = 'interface',
  PRIVACY = 'privacy',
  ADVANCED = 'advanced'
}

export enum ExperienceLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced'
}

export interface SettingsState {
  version: string;
  modules: Record<string, unknown>;
  userLevel: ExperienceLevel;
}

export interface MigrationRule {
  fromVersion: string;
  toVersion: string;
  transform: (oldState: unknown) => unknown;
}