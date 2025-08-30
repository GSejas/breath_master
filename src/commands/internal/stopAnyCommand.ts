/**
 * Stop Any Command
 * Breath Master - VS Code Extension
 * 
 * Universal stop command that handles ending any active state:
 * meditation sessions, stretch presets, or other running activities.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createStopAnyCommand(
  context: CommandContext,
  getActiveStretchPreset: () => any
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.stopAny', async () => {
    const tracker = context.meditationTracker;
    const activeSession = tracker.getActiveSession();
    const activeStretchPreset = getActiveStretchPreset();
    
    if (activeSession) {
      // End active session
      vscode.commands.executeCommand('breathMaster.endSession');
    } else if (activeStretchPreset) {
      // Cancel stretch preset
      vscode.commands.executeCommand('breathMaster.cancelStretchPreset');
    } else {
      // Nothing active, show info
      const level = tracker.getCurrentLevel();
      const stats = tracker.getStats();
      const streakInfo = stats.currentStreak > 0 ? ` • ${stats.currentStreak} day streak` : '';
      
      showAutoMessage(`${level.icon} ${level.title} • ${stats.totalXP} XP${streakInfo}\nNo active session to stop.`);
    }
  });
}