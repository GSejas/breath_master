/**
 * Command Registry
 * Central hub for all VS Code commands
 */

import * as vscode from 'vscode';
import { MeditationTracker } from '../engine/gamification';
import { OnboardingManager } from '../engine/onboarding';
import { VSCodeSettingsAdapter } from '../engine/settings/VSCodeSettingsAdapter';
import { JourneyCoverageTracker } from '../vscode/journey-coverage';

// Command creators
import { createStartSessionCommand } from './sessions/startSessionCommand';
import { createEndSessionCommand } from './sessions/endSessionCommand';
import { createPauseSessionCommand } from './sessions/pauseSessionCommand';
import { createResumeSessionCommand } from './sessions/resumeSessionCommand';
import { createToggleCommand } from './breathing/toggleCommand';
import { createCyclePatternCommand } from './breathing/cyclePatternCommand';
import { createChangeGoalCommand } from './gamification/changeGoalCommand';
import { createMakePledgeCommand } from './gamification/makePledgeCommand';
import { createCancelPledgeCommand } from './gamification/cancelPledgeCommand';
import { createViewChallengesCommand } from './gamification/viewChallengesCommand';
import { createStopAnyCommand } from './internal/stopAnyCommand';
import { createUniversalControlCommand } from './internal/universalControlCommand';
import { createExportDataCommand } from './data/exportDataCommand';
import { createClearDataCommand } from './data/clearDataCommand';
import { createShowTourCommand } from './data/showTourCommand';
import { createStartStretchPresetCommand } from './stretch/startStretchPresetCommand';
import { createCancelStretchPresetCommand } from './stretch/cancelStretchPresetCommand';
import { createMicroMeditationToggleCommand } from './micro/microMeditationToggleCommand';

export interface CommandContext {
  meditationTracker: MeditationTracker;
  onboardingManager: OnboardingManager;
  settings: VSCodeSettingsAdapter;
  journeyCoverage: JourneyCoverageTracker;
  updateGamificationDisplay: () => Promise<void>;
  extensionContext: vscode.ExtensionContext;
}

/**
 * Auto-disappearing message utility
 */
export function showAutoMessage(message: string, duration: number = 9000): void {
  const disposable = vscode.window.setStatusBarMessage(message, duration);
  
  // Also show as information message for immediate visibility
  vscode.window.showInformationMessage(message);
  
  // Auto-clear after duration
  setTimeout(() => {
    disposable.dispose();
  }, duration);
}

/**
 * Register all commands with the extension context
 */
export async function registerAllCommands(
  context: CommandContext,
  breathingEngine: any,
  getActiveStretchPreset: () => any,
  setActiveStretchPreset: (preset: any) => void,
  getMicroMeditationBar: () => any,
  setMicroMeditationBar: (bar: any) => void,
  startAnimation: () => Promise<void>,
  stopAnimation: () => void,
  initializeEngine: () => Promise<void>
): Promise<vscode.Disposable[]> {
  const commands: vscode.Disposable[] = [];

  // Session commands
  commands.push(await createStartSessionCommand(context));
  commands.push(await createEndSessionCommand(context));
  commands.push(await createPauseSessionCommand(context));
  commands.push(await createResumeSessionCommand(context));

  // Breathing commands
  commands.push(await createToggleCommand(context, startAnimation, stopAnimation));
  commands.push(await createCyclePatternCommand(context, breathingEngine, initializeEngine));

  // Gamification commands
  commands.push(await createChangeGoalCommand(context));
  commands.push(await createMakePledgeCommand(context));
  commands.push(await createCancelPledgeCommand(context));
  commands.push(await createViewChallengesCommand(context));

  // Internal commands
  commands.push(await createStopAnyCommand(context, getActiveStretchPreset));
  commands.push(await createUniversalControlCommand(context, getActiveStretchPreset));

  // Data/utility commands
  commands.push(await createExportDataCommand(context));
  commands.push(await createClearDataCommand(context));
  commands.push(await createShowTourCommand(context));

  // Stretch preset commands
  commands.push(await createStartStretchPresetCommand(context, getActiveStretchPreset, setActiveStretchPreset));
  commands.push(await createCancelStretchPresetCommand(context, getActiveStretchPreset, setActiveStretchPreset));

  // Micro-meditation commands
  commands.push(await createMicroMeditationToggleCommand(context, getMicroMeditationBar, setMicroMeditationBar));

  return commands;
}