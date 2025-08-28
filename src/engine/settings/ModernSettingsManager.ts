import * as vscode from 'vscode';
import { SettingsModule, SettingsState, ExperienceLevel, ValidationResult, MigrationRule } from './types';

export class ModernSettingsManager {
  private modules = new Map<string, SettingsModule>();
  private migrations: MigrationRule[] = [];
  private readonly STORAGE_KEY = 'breathMaster.modernSettings';
  private readonly VERSION = '1.0.0';

  constructor(private context: vscode.ExtensionContext) {}

  registerModule<T>(module: SettingsModule<T>): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Settings module '${module.id}' already registered`);
    }

    // Validate dependencies
    for (const dep of module.dependencies || []) {
      if (!this.modules.has(dep)) {
        throw new Error(`Module '${module.id}' depends on unregistered module '${dep}'`);
      }
    }

    this.modules.set(module.id, module);
  }

  async get<T>(moduleId: string): Promise<T> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Settings module '${moduleId}' not found`);
    }

    const state = await this.getState();
    const rawValue = state.modules[moduleId];

    if (rawValue === undefined) {
      return module.getDefaults();
    }

    const deserialized = module.deserialize ? module.deserialize(rawValue) : rawValue;
    const validation = module.validate(deserialized);
    
    if (!validation.success) {
      console.warn(`Invalid settings for module '${moduleId}', using defaults:`, validation.errors);
      return module.getDefaults();
    }

    return validation.data!;
  }

  async set<T>(moduleId: string, value: T): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Settings module '${moduleId}' not found`);
    }

    const validation = module.validate(value);
    if (!validation.success) {
      throw new Error(`Invalid value for module '${moduleId}': ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    const state = await this.getState();
    const serialized = module.serialize ? module.serialize(validation.data!) : validation.data;
    
    state.modules[moduleId] = serialized;
    await this.setState(state);
  }

  async reset(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Settings module '${moduleId}' not found`);
    }

    await this.set(moduleId, module.getDefaults());
  }

  async resetAll(): Promise<void> {
    const state: SettingsState = {
      version: this.VERSION,
      modules: {},
      userLevel: ExperienceLevel.BASIC
    };

    for (const [id, module] of this.modules) {
      const serialized = module.serialize ? module.serialize(module.getDefaults()) : module.getDefaults();
      state.modules[id] = serialized;
    }

    await this.setState(state);
  }

  getModulesByLevel(level: ExperienceLevel): SettingsModule[] {
    return Array.from(this.modules.values())
      .filter(module => this.shouldShowModule(module, level))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  getModulesByCategory(category: string): SettingsModule[] {
    return Array.from(this.modules.values())
      .filter(module => module.category === category)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async getUserLevel(): Promise<ExperienceLevel> {
    const state = await this.getState();
    return state.userLevel;
  }

  async setUserLevel(level: ExperienceLevel): Promise<void> {
    const state = await this.getState();
    state.userLevel = level;
    await this.setState(state);
  }

  private shouldShowModule(module: SettingsModule, userLevel: ExperienceLevel): boolean {
    const levels = [ExperienceLevel.BASIC, ExperienceLevel.INTERMEDIATE, ExperienceLevel.ADVANCED];
    const userLevelIndex = levels.indexOf(userLevel);
    const moduleLevelIndex = levels.indexOf(module.experienceLevel);
    return moduleLevelIndex <= userLevelIndex;
  }

  private async getState(): Promise<SettingsState> {
    const stored = this.context.workspaceState.get<SettingsState>(this.STORAGE_KEY);
    
    if (!stored) {
      const defaultState: SettingsState = {
        version: this.VERSION,
        modules: {},
        userLevel: ExperienceLevel.BASIC
      };
      await this.setState(defaultState);
      return defaultState;
    }

    // Apply migrations if needed
    if (stored.version !== this.VERSION) {
      return await this.migrateState(stored);
    }

    return stored;
  }

  private async setState(state: SettingsState): Promise<void> {
    await this.context.workspaceState.update(this.STORAGE_KEY, state);
  }

  private async migrateState(oldState: SettingsState): Promise<SettingsState> {
    let current = { ...oldState };
    
    for (const migration of this.migrations) {
      if (current.version === migration.fromVersion) {
        current = migration.transform(current) as SettingsState;
        current.version = migration.toVersion;
      }
    }

    if (current.version !== this.VERSION) {
      console.warn(`Unable to migrate settings from version ${oldState.version} to ${this.VERSION}, resetting to defaults`);
      await this.resetAll();
      return await this.getState();
    }

    await this.setState(current);
    return current;
  }

  addMigration(migration: MigrationRule): void {
    this.migrations.push(migration);
  }

  async exportSettings(): Promise<string> {
    const state = await this.getState();
    return JSON.stringify(state, null, 2);
  }

  async importSettings(jsonData: string): Promise<void> {
    try {
      const imported = JSON.parse(jsonData) as SettingsState;
      
      // Validate each module's data
      for (const [moduleId, data] of Object.entries(imported.modules)) {
        const module = this.modules.get(moduleId);
        if (module) {
          const validation = module.validate(data);
          if (!validation.success) {
            console.warn(`Invalid imported data for module '${moduleId}', skipping`);
            delete imported.modules[moduleId];
          }
        }
      }

      await this.setState(imported);
    } catch (error) {
      throw new Error(`Failed to import settings: ${error}`);
    }
  }
}