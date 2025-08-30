/**
 * Micro Meditation Toggle Command
 * Breath Master - VS Code Extension
 * 
 * Toggles the micro-meditation bar on/off, managing the 1-minute
 * focused breathing sessions with XP rewards.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createMicroMeditationToggleCommand(
  context: CommandContext,
  getMicroMeditationBar: () => any,
  setMicroMeditationBar: (bar: any) => void
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.microMeditation.toggle', async () => {
    const gamificationSettings = await context.settings.getGamificationSettings();
    const newEnabled = !gamificationSettings.microMeditation.enabled;
    
    await context.settings.updateGamificationSettings({
      ...gamificationSettings,
      microMeditation: {
        ...gamificationSettings.microMeditation,
        enabled: newEnabled
      }
    });

    if (newEnabled) {
      // Initialize micro-meditation bar if needed
      let microMeditationBar = getMicroMeditationBar();
      if (!microMeditationBar) {
        // Dynamic import to avoid circular dependency
        const { MicroMeditationBar } = await import('../../vscode/MicroMeditationBar');
        microMeditationBar = new MicroMeditationBar(context.meditationTracker, context.settings, context.extensionContext);
        await microMeditationBar.initialize();
        context.extensionContext.subscriptions.push(microMeditationBar);
        setMicroMeditationBar(microMeditationBar);
      }
      microMeditationBar.show();
      showAutoMessage('🧘 Micro-meditation bar enabled');
    } else {
      const microMeditationBar = getMicroMeditationBar();
      if (microMeditationBar) {
        microMeditationBar.hide();
      }
      showAutoMessage('Micro-meditation bar disabled');
    }
  });
}