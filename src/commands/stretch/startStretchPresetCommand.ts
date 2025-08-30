/**
 * Start Stretch Preset Command
 * Breath Master - VS Code Extension
 * 
 * Initiates stretch preset routines with timer-based notifications
 * and status bar integration for break reminders.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createStartStretchPresetCommand(
  context: CommandContext,
  getActiveStretchPreset: () => any,
  setActiveStretchPreset: (preset: any) => void
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.startStretchPreset', async () => {
    const presets = [
      { name: '5m Quick', duration: 5, compact: '5m' },
      { name: '10m Break', duration: 10, compact: '10m' },
      { name: '20m Extended', duration: 20, compact: '20m' }
    ];
    
    const choice = await vscode.window.showQuickPick(
      presets.map(p => ({ label: p.name, preset: p })),
      { placeHolder: 'Choose stretch preset duration' }
    );
    
    if (choice) {
      const preset = {
        name: choice.preset.name,
        duration: choice.preset.duration,
        startTime: Date.now(),
        compact: choice.preset.compact
      };
      
      setActiveStretchPreset(preset);
      await context.updateGamificationDisplay();
      showAutoMessage(`Started ${preset.name} stretch preset`);
    }
  });
}