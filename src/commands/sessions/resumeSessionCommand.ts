/**
 * Resume Session Command
 * Handles resuming paused meditation sessions
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createResumeSessionCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.resumeSession', async () => {
    const tracker = context.meditationTracker;
    
    if (tracker.resumeSession()) {
      showAutoMessage('▶️ Session resumed');
      await context.updateGamificationDisplay();
    }
  });
}