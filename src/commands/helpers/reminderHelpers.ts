/**
 * Helper functions for user guidance and reminders
 */

import * as vscode from 'vscode';
import { MeditationTracker } from '../../engine/gamification';

export async function shouldShowManualStopReminder(
  tracker: MeditationTracker,
  extensionContext: vscode.ExtensionContext
): Promise<boolean> {
  try {
    const currentLevel = tracker.getCurrentLevel();
    
    // Only show reminders for first 2 levels (new users)
    if (currentLevel.level > 2) {
      return false;
    }

    // Get reminder tracking from context
    const reminderKey = 'manualStopReminders';
    const reminderData = extensionContext.globalState.get<{
      count: number;
      lastSessionDate?: string;
      lastReminderDate?: string;
    }>(reminderKey, { count: 0 });

    const today = new Date().toDateString();
    
    // Show reminder for first 3 sessions
    if (reminderData.count < 3) {
      await extensionContext.globalState.update(reminderKey, {
        ...reminderData,
        count: reminderData.count + 1,
        lastReminderDate: today
      });
      return true;
    }

    // Show reminder for returning users (levels 1-2) after 7+ days gap
    const stats = tracker.getStats();
    if (stats.lastMeditationDate) {
      const lastSession = new Date(stats.lastMeditationDate);
      const daysSinceLastSession = (Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24);
      
      // If 7+ days since last session and haven't shown reminder in last 7 days
      if (daysSinceLastSession >= 7) {
        const lastReminder = reminderData.lastReminderDate ? new Date(reminderData.lastReminderDate) : null;
        const daysSinceLastReminder = lastReminder ? 
          (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        if (daysSinceLastReminder >= 7) {
          await extensionContext.globalState.update(reminderKey, {
            ...reminderData,
            lastReminderDate: today
          });
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking manual stop reminder:', error);
    return false;
  }
}