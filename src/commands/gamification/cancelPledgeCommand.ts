/**
 * Cancel Pledge Command
 * Breath Master - VS Code Extension
 * 
 * Handles canceling active meditation pledges, allowing users to back out
 * of commitments without penalty.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createCancelPledgeCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.cancelPledge', async () => {
    const tracker = context.meditationTracker;
    
    if (tracker.cancelPledge()) {
      showAutoMessage('Pledge cancelled');
      await context.updateGamificationDisplay();
    }
  });
}