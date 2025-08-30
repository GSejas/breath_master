/**
 * End Session Command
 * Handles ending active meditation sessions with completion notifications
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createEndSessionCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.endSession', async () => {
    const tracker = context.meditationTracker;
    const record = tracker.endSession();
    
    if (record) {
      const mins = Math.round(record.activeMs / 60000 * 10) / 10;
      const bonus = record.goalBonusXP ? ` • +${record.goalBonusXP} bonus XP` : '';
      const pledge = record.pledgeMultiplier && record.pledgeHonored ? 
        ` • Pledge honored x${record.pledgeMultiplier}` : '';
      
      // Show richer completion notification with follow-up options
      const xpPart = record.finalXP ? ` • ${record.finalXP} XP` : '';
      const pledgePart = pledge ? `\n${pledge.trim()}` : '';
      const msg = `🌟 Meditation Complete: ${mins}m${bonus}${xpPart}${pledgePart}\n` +
        `Rings deepen; clarity returns.`;
      
      const selection = await vscode.window.showInformationMessage(
        msg,
        'Start Another',
        'Set Goal',
        'View Challenges',
        'Dismiss'
      );
      
      // Handle user selection
      if (selection === 'Start Another') {
        vscode.commands.executeCommand('breathMaster.startSession');
      } else if (selection === 'Set Goal') {
        vscode.commands.executeCommand('breathMaster.changeGoal');
      } else if (selection === 'View Challenges') {
        vscode.commands.executeCommand('breathMaster.viewChallenges');
      }
      
      await context.updateGamificationDisplay();
      
      try { 
        context.journeyCoverage.record({ 
          journeyId: 'quick-session-complete', 
          step: 'endSession' 
        }); 
      } catch {}

      // Surface any auto-completed challenges slightly after main toast
      const completed = tracker.checkChallengeAutoCompletion();
      if (completed.length) {
        setTimeout(() => {
          completed.forEach((challenge, i) => {
            setTimeout(() => {
              showAutoMessage(
                `🎯 Challenge Complete: "${challenge.title}" • +${challenge.rewardXP} XP\n` +
                `${challenge.completionMessage}`
              );
            }, i * 2000);
          });
        }, 3000);
      }
    }
  });
}