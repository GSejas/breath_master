/**
 * Toggle Breathing Command
 * Handles toggling the main breathing animation on/off
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createToggleCommand(
  context: CommandContext,
  startAnimation: () => Promise<void>,
  stopAnimation: () => void
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.toggle', async () => {
    const isEnabled = await context.settings.getBreathingEnabled();
    const newState = !isEnabled;

    await context.settings.setBreathingEnabled(newState);

    if (newState) {
      // Start breathing if enabled
      await startAnimation();
      showAutoMessage("🌊 Breathing session started");
    } else {
      // Stop breathing if disabled
      stopAnimation();
      showAutoMessage("⏸️ Breathing session paused");
    }
  });
}