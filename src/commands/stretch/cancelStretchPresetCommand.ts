/**
 * Cancel Stretch Preset Command
 * Breath Master - VS Code Extension
 * 
 * Cancels active stretch preset routines and updates the status bar
 * to reflect the cancelled state.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createCancelStretchPresetCommand(
  context: CommandContext,
  getActiveStretchPreset: () => any,
  setActiveStretchPreset: (preset: any) => void
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.cancelStretchPreset', async () => {
    const activePreset = getActiveStretchPreset();
    
    if (activePreset) {
      setActiveStretchPreset(null);
      await context.updateGamificationDisplay();
      showAutoMessage(`Cancelled ${activePreset.name} stretch preset`);
    } else {
      showAutoMessage('No active stretch preset to cancel');
    }
  });
}