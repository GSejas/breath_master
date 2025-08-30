/**
 * Show Tour Command
 * Breath Master - VS Code Extension
 * 
 * Displays the interactive onboarding tour to help users understand
 * the extension features and breathing patterns.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createShowTourCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.showTour', async () => {
    // Simple tour implementation for now - just show welcome message
    const choice = await vscode.window.showInformationMessage(
      '🫁 Welcome to Breath Master — your mindful coding companion.',
      'Enable Game Mode',
      'Keep Simple'
    );

    if (choice === 'Enable Game Mode') {
      await context.settings.setGamificationEnabled(true);
      context.onboardingManager.markTourCompleted(true);
      showAutoMessage('🌟 Game Mode enabled! Discover challenges and progress tracking.');
    } else {
      context.onboardingManager.markTourCompleted(false);
      showAutoMessage('✨ You can enable Game Mode anytime from settings.');
    }
    
    await context.updateGamificationDisplay();
  });
}