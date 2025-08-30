/**
 * View Challenges Command
 * Breath Master - VS Code Extension
 * 
 * Displays available daily challenges with Eon's wisdom and allows users
 * to see their progress towards challenge completion.
 */

import * as vscode from 'vscode';
import { CommandContext, showAutoMessage } from '../index';

export async function createViewChallengesCommand(
  context: CommandContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand('breathMaster.viewChallenges', async () => {
    const tracker = context.meditationTracker;
    const challenges = tracker.getAvailableChallenges();
    
    if (challenges.length === 0) {
      showAutoMessage('🌸 No challenges today. Sometimes rest is the deepest practice.');
      return;
    }

    const challengeItems = challenges.map(challenge => ({
      label: `${challenge.completed ? '✅' : '🎯'} ${challenge.title}`,
      description: `${challenge.description} • +${challenge.rewardXP} XP`,
      detail: challenge.eonMessage,
      challenge
    }));

    const pick = await vscode.window.showQuickPick(challengeItems, {
      placeHolder: 'Daily Challenges - Wisdom from Eon the Sequoia',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (pick && !pick.challenge.completed) {
      showAutoMessage(`🌳 "${pick.challenge.eonMessage}"\n\nStart your session to work toward this challenge.`);
    }
  });
}