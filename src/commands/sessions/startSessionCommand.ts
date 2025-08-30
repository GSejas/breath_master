/**
 * Start Session Command
 * Handles starting new meditation sessions with goal selection
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';
import { shouldShowManualStopReminder } from '../helpers/reminderHelpers';

export async function createStartSessionCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.startSession', async () => {
    const tracker = context.meditationTracker;
    
    // Offer quick pick of goal options
    const goalProfile = tracker.getGoalOptions();
    const pick = await vscode.window.showQuickPick(
      goalProfile.options.map(o => ({ label: `${o} minutes`, value: o })), 
      { placeHolder: 'Select session goal' }
    );
    
    const chosen = pick ? pick.value : undefined;
    const started = tracker.startSession(chosen);
    
    if (started.started) {
      // Show start message with potential reminder for new users
      let startMessage = `🧘 Session started${chosen ? ' • Goal ' + chosen + 'm' : ''}`;
      
      // Check if user needs manual stop reminder
      const needsReminder = await shouldShowManualStopReminder(tracker, context.extensionContext);
      if (needsReminder) {
        startMessage += '\n💡 Remember: Click the ⏹ stop button when you\'re ready to end your session';
      }
      
      showAutoMessage(startMessage);
      await context.updateGamificationDisplay();
      
      try { 
        context.journeyCoverage.record({ 
          journeyId: 'quick-session-complete', 
          step: 'startSession' 
        }); 
      } catch {}
    } else {
      showAutoMessage(`Cannot start session: ${started.reason}`);
    }
  });
}