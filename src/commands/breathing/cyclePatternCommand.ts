/**
 * Cycle Pattern Command
 * Handles cycling through different breathing patterns
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';
import { Pattern } from '../../engine/breathe-engine';

export async function createCyclePatternCommand(
  context: CommandContext,
  engine: any,
  initializeEngine: () => Promise<void>
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.cyclePattern', async () => {
    const patterns: Pattern[] = ["chill", "medium", "active", "boxing", "relaxing", "custom"];
    const patternNames: Record<Pattern, string> = {
      chill: "Chill (6s-8s)",
      medium: "Medium (5s-5s)",
      active: "Active (4s-2s-4s-1s)",
      boxing: "Boxing (4s-4s-4s-4s)",
      relaxing: "Relaxing (4s-7s-8s)",
      custom: "Custom Pattern"
    };

    const currentPattern = engine.pattern;
    const currentIndex = patterns.indexOf(currentPattern);
    const nextIndex = (currentIndex + 1) % patterns.length;
    const nextPattern = patterns[nextIndex];

    await context.settings.setBreathingPattern(nextPattern);
    await initializeEngine();

    showAutoMessage(`🔄 Switched to ${patternNames[nextPattern]}`);
  });
}