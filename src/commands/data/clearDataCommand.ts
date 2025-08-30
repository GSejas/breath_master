/**
 * Clear Data Command
 * Breath Master - VS Code Extension
 * 
 * Clears all user meditation data including XP, streaks, and progress.
 * Requires confirmation to prevent accidental data loss.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createClearDataCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.clearData', async () => {
    const confirm = await vscode.window.showWarningMessage(
      'Clear all meditation data? This cannot be undone.',
      'Clear Data', 
      'Cancel'
    );
    
    if (confirm === 'Clear Data') {
      context.meditationTracker.reset();
      context.onboardingManager.reset();
      await context.updateGamificationDisplay();
      showAutoMessage('🔄 All data cleared. Welcome to a fresh start!');
    }
  });
}