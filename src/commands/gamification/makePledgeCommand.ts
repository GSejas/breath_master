/**
 * Make Pledge Command
 * Breath Master - VS Code Extension
 * 
 * Handles creating meditation pledges with goal commitments and XP multipliers.
 * Part of the gamification system that encourages consistent practice.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createMakePledgeCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.makePledge', async () => {
    const tracker = context.meditationTracker;
    const goalProfile = tracker.getGoalOptions();
    
    const pick = await vscode.window.showQuickPick(
      goalProfile.options.map(o => ({ label: `${o} minutes`, value: o })), 
      { placeHolder: 'Select pledge goal (commitment with bonus XP)' }
    );
    
    if (pick) {
      const res = tracker.makePledge(pick.value);
      if (res.ok && res.pledge) {
        showAutoMessage(`🤝 Pledge made: ${res.pledge.goalMinutes}m session • ${Math.round((res.pledge.multiplier - 1) * 100)}% bonus XP`);
        await context.updateGamificationDisplay();
        
        try { 
          context.journeyCoverage.record({ 
            journeyId: 'pledge-honored', 
            step: 'makePledge' 
          }); 
        } catch {}
      } else {
        showAutoMessage(`Cannot create pledge: ${res.reason}`);
      }
    }
  });
}