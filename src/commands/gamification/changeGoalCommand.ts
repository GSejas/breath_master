/**
 * Change Goal Command
 * Handles changing session goals and starting new sessions
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createChangeGoalCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.changeGoal', async () => {
    const tracker = context.meditationTracker;
    const goalProfile = tracker.getGoalOptions();
    
    const pick = await vscode.window.showQuickPick(
      goalProfile.options.map(o => ({ label: `${o} minutes`, value: o })), 
      { placeHolder: 'Select new default session goal' }
    );
    
    if (pick) {
      tracker.startSession(pick.value); // start a fresh session directly
      showAutoMessage(`🎯 New session started with goal ${pick.value}m`);
      await context.updateGamificationDisplay();
    }
  });
}