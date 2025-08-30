/**
 * Pause Session Command
 * Handles pausing active meditation sessions
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createPauseSessionCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.pauseSession', async () => {
    const tracker = context.meditationTracker;
    
    if (tracker.pauseSession()) {
      showAutoMessage('⏸️ Session paused');
      await context.updateGamificationDisplay();
    }
  });
}