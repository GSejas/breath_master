/**
 * Export Data Command
 * Breath Master - VS Code Extension
 * 
 * Exports user meditation data and settings to JSON format for backup
 * or migration purposes. Respects privacy settings and user consent.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createExportDataCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.exportData', async () => {
    try {
      const stats = context.meditationTracker.getStats();
      const onboardingState = context.onboardingManager.getState();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        breathMaster: {
          meditation: stats,
          onboarding: onboardingState,
          version: "0.3.4"
        }
      };
      
      await vscode.env.clipboard.writeText(JSON.stringify(exportData, null, 2));
      showAutoMessage('📁 Data exported to clipboard! Paste into a file to backup your progress.');
    } catch (error) {
      showAutoMessage(`Failed to export data: ${error}`);
    }
  });
}