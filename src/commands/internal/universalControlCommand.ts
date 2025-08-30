/**
 * Universal Control Command
 * Breath Master - VS Code Extension
 * 
 * Context-aware control button that provides different actions based on
 * current state: start, pause, resume, end, pledge, or stretch cancel.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createUniversalControlCommand(
  context: CommandContext,
  getActiveStretchPreset: () => any
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.universalControl', async () => {
    const tracker = context.meditationTracker;
    const activeSession = tracker.getActiveSession();
    const activeStretchPreset = getActiveStretchPreset();
    
    if (activeStretchPreset) {
      vscode.commands.executeCommand('breathMaster.cancelStretchPreset');
      return;
    }
    
    if (!activeSession) {
      // No active session - offer to start
      const options = ['Start Session', 'Make Pledge', 'View Challenges', 'Stretch Preset'];
      const choice = await vscode.window.showQuickPick(options, {
        placeHolder: 'Choose an action'
      });
      
      switch (choice) {
        case 'Start Session': 
          vscode.commands.executeCommand('breathMaster.startSession'); 
          await context.updateGamificationDisplay(); 
          break;
        case 'Make Pledge': 
          vscode.commands.executeCommand('breathMaster.makePledge'); 
          await context.updateGamificationDisplay(); 
          break;
        case 'View Challenges': 
          vscode.commands.executeCommand('breathMaster.viewChallenges'); 
          break;
        case 'Stretch Preset': 
          vscode.commands.executeCommand('breathMaster.startStretchPreset'); 
          break;
      }
      return;
    }
    
    // Active session - show session controls
    const sessionActions = ['Pause', 'Resume', 'End', 'Cancel'];
    const action = await vscode.window.showQuickPick(sessionActions, {
      placeHolder: `Session: ${activeSession.goalMinutes || 'No goal'}m • Choose action`
    });
    
    switch (action) {
      case 'Pause': 
        vscode.commands.executeCommand('breathMaster.pauseSession'); 
        await context.updateGamificationDisplay(); 
        break;
      case 'Resume': 
        vscode.commands.executeCommand('breathMaster.resumeSession'); 
        await context.updateGamificationDisplay(); 
        break;
      case 'End': 
        vscode.commands.executeCommand('breathMaster.endSession'); 
        await context.updateGamificationDisplay(); 
        break;
      case 'Cancel': 
        vscode.commands.executeCommand('breathMaster.cancelPledge'); 
        await context.updateGamificationDisplay(); 
        break;
    }
  });
}