/**
 * MicroMeditationBar.ts
 * Status bar item for 1-minute micro-meditation sessions with visual urgency
 */

import * as vscode from 'vscode';
import { MeditationTracker } from '../engine/gamification';
import { VSCodeSettingsAdapter } from '../engine/settings/VSCodeSettingsAdapter';

export interface MicroMeditationState {
  lastSessionTime: Date | null;
  urgencyLevel: 'fresh' | 'reminder' | 'overdue';
}

export class MicroMeditationBar {
  private statusBarItem: vscode.StatusBarItem;
  private urgencyTimer: NodeJS.Timeout | undefined;
  private state: MicroMeditationState;
  private readonly MICRO_SESSION_MINUTES = 1;
  private autoCompleteTimer: NodeJS.Timeout | undefined;

  // Icon mapping for different visual styles
  private readonly ICON_MAP = {
    meditation: { 
      fresh: '🧘', 
      reminder: '⏰', 
      overdue: '🎯' },
    timer: { 
      fresh: '$(chat-sparkle-error)', 
      reminder: '$(chat-sparkle-warning)', 
      overdue: '$(chat-sparkle-error)' },
    target: { 
      fresh: '$(workspace-trusted)', 
      reminder: '$(workspace-unknown)', 
      overdue: '$(workspace-untrusted)' },
    leaf: { 
      fresh: '$(screen-full)', 
      reminder: '$(screen-normal)', 
      overdue: '$(symbol-numeric)' 
    },
    zen: { fresh: '$(sync)', reminder: '$(sync~spin)', overdue: '$(sync-ignored)' }
  } as const;

  // Timing presets (hours to reach each state)
  private readonly TIMING_PRESETS = {
    gentle: { reminder: 12, overdue: 48 },
    standard: { reminder: 4, overdue: 24 },
    assertive: { reminder: 2, overdue: 12 }
  } as const;

  constructor(
    private meditationTracker: MeditationTracker,
    private settings: VSCodeSettingsAdapter,
    private context: vscode.ExtensionContext
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      975
    );
    this.statusBarItem.command = 'breathMaster.microMeditation.start';
    
    this.state = {
      lastSessionTime: null,
      urgencyLevel: 'fresh'
    };

    // Load persisted state
    this.loadState();
  }

  async initialize(): Promise<void> {
    // Set up session end listener
    this.meditationTracker.onSessionEnded(() => {
      this.onSessionCompleted();
    });

    // Register commands
    this.context.subscriptions.push(
      vscode.commands.registerCommand('breathMaster.microMeditation.start', () => {
        this.handleClick();
      })
    );

    // Listen for configuration changes
    const configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration('breathMaster.gamification.microMeditation')) {
        await this.updateDisplay();
      }
    });
    this.context.subscriptions.push(configListener);

    // Initial display update
    await this.updateDisplay();
    this.show();

    // Start urgency monitoring
    this.startUrgencyTimer();
  }

  private async handleClick(): Promise<void> {
    try {
      const session = this.meditationTracker.startSession(this.MICRO_SESSION_MINUTES);
      
      if (session.started) {
        vscode.window.showInformationMessage(`🧘 ${this.MICRO_SESSION_MINUTES}-minute micro-session started`);
        
        // Auto-complete after duration
        this.autoCompleteTimer = setTimeout(() => {
          const activeSession = this.meditationTracker.getActiveSession();
          if (activeSession && activeSession.goalMinutes === this.MICRO_SESSION_MINUTES) {
            this.meditationTracker.endSession();
            // Note: XP reward and completion message handled by onSessionCompleted callback
          }
          this.autoCompleteTimer = undefined;
        }, this.MICRO_SESSION_MINUTES * 60 * 1000);

        // Update display to show session is active
        await this.updateDisplay();
        
        // Trigger gamification display update to show stop button
        vscode.commands.executeCommand('breathMaster.internal.updateGamificationDisplay');
      } else {
        vscode.window.showWarningMessage(session.reason || 'Could not start micro-session');
      }
    } catch (error) {
      vscode.window.showErrorMessage('Failed to start micro-session');
      console.error('MicroMeditationBar error:', error);
    }
  }

  private onSessionCompleted(): void {
    // Clear auto-complete timer if session ended manually
    if (this.autoCompleteTimer) {
      clearTimeout(this.autoCompleteTimer);
      this.autoCompleteTimer = undefined;
    }

    // Apply custom micro-meditation XP rewards
    this.applyMicroMeditationXP();

    // Update last session time and reset to fresh state
    this.state.lastSessionTime = new Date();
    this.state.urgencyLevel = 'fresh';
    this.saveState();
    this.updateDisplay();

    // Trigger gamification display update to hide stop button
    vscode.commands.executeCommand('breathMaster.internal.updateGamificationDisplay');
  }

  private async applyMicroMeditationXP(): Promise<void> {
    try {
      // Base micro-meditation XP (higher than cycle XP to incentivize)
      const baseXP = 5;

      // Urgency bonus - reward responding to reminders
      let urgencyBonus = 0;
      switch (this.state.urgencyLevel) {
        case 'overdue':
          urgencyBonus = 5; // Big bonus for breaking long gaps
          break;
        case 'reminder':
          urgencyBonus = 2; // Small bonus for responding to reminder
          break;
        case 'fresh':
          urgencyBonus = 0; // No urgency = base reward
          break;
      }

      // Daily consistency bonus (1.2x for multiple sessions per day)
      const today = new Date().toDateString();
      const todayCount = this.getTodayMicroSessionCount();
      const consistencyMultiplier = todayCount > 0 ? 1.2 : 1.0;

      // Calculate total XP
      const totalXP = Math.round((baseXP + urgencyBonus) * consistencyMultiplier);

      // Apply XP directly to tracker
      this.meditationTracker.addExternalXP(totalXP, 'micro-meditation');

      // Show XP notification
      const urgencyText = urgencyBonus > 0 ? ` (+${urgencyBonus} urgency bonus)` : '';
      const consistencyText = consistencyMultiplier > 1 ? ` (x${consistencyMultiplier} daily consistency)` : '';
      vscode.window.showInformationMessage(
        `✨ Micro-session complete! +${totalXP} XP${urgencyText}${consistencyText}`
      );

    } catch (error) {
      console.error('Error applying micro-meditation XP:', error);
      // Fallback to basic completion message
      vscode.window.showInformationMessage('✨ Micro-session complete!');
    }
  }

  private getTodayMicroSessionCount(): number {
    try {
      const today = new Date().toDateString();
      const todayCountKey = `microMeditationDailyCount_${today}`;
      const count = this.context.workspaceState.get<number>(todayCountKey, 0);
      
      // Increment count for this session
      const newCount = count + 1;
      this.context.workspaceState.update(todayCountKey, newCount);
      
      return count; // Return previous count for bonus calculation
    } catch {
      return 0;
    }
  }

  private async calculateUrgency(): Promise<'fresh' | 'reminder' | 'overdue'> {
    if (!this.state.lastSessionTime) {
      return 'overdue'; // No previous session
    }

    const now = Date.now();
    const lastSession = this.state.lastSessionTime.getTime();
    const hoursSinceLastSession = (now - lastSession) / (1000 * 60 * 60);

    const timing = await this.getTimingPreset();
    
    if (hoursSinceLastSession >= timing.overdue) {
      return 'overdue';
    } else if (hoursSinceLastSession >= timing.reminder) {
      return 'reminder';
    } else {
      return 'fresh';
    }
  }

  private async getTimingPreset() {
    const gamificationSettings = await this.settings.getGamificationSettings();
    return this.TIMING_PRESETS[gamificationSettings.microMeditation.timing as keyof typeof this.TIMING_PRESETS];
  }

  private async getIcon(): Promise<string> {
    const gamificationSettings = await this.settings.getGamificationSettings();
    const iconSet = this.ICON_MAP[gamificationSettings.microMeditation.icon as keyof typeof this.ICON_MAP];
    return iconSet[this.state.urgencyLevel];
  }

  private async updateDisplay(): Promise<void> {
    // Update urgency state
    this.state.urgencyLevel = await this.calculateUrgency();

    // Get icon and styling
    const icon = await this.getIcon();
    const tooltipMessage = this.getTooltipMessage();

    // Update status bar item
    this.statusBarItem.text = `${icon} ${this.MICRO_SESSION_MINUTES}m`;
    this.statusBarItem.tooltip = tooltipMessage;

    // Apply background color based on urgency
    switch (this.state.urgencyLevel) {
      case 'fresh':
        this.statusBarItem.backgroundColor = undefined;
        break;
      case 'reminder':
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;
      case 'overdue':
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }

  private getTooltipMessage(): string {
    switch (this.state.urgencyLevel) {
      case 'fresh':
        return 'Recent session • Click for another';
      case 'reminder':
        return 'Time for mindfulness • Quick session ready';
      case 'overdue':
        return 'Mindfulness break needed • Click to restart';
      default:
        return 'Click for 1-minute micro-meditation';
    }
  }

  private startUrgencyTimer(): void {
    // Check urgency every 30 minutes
    this.urgencyTimer = setInterval(() => {
      this.updateDisplay();
    }, 30 * 60 * 1000);
  }

  private loadState(): void {
    const saved = this.context.workspaceState.get<{ lastSessionTime?: string }>('microMeditationState');
    if (saved?.lastSessionTime) {
      this.state.lastSessionTime = new Date(saved.lastSessionTime);
    }
  }

  private saveState(): void {
    const stateToSave = {
      lastSessionTime: this.state.lastSessionTime?.toISOString()
    };
    this.context.workspaceState.update('microMeditationState', stateToSave);
  }

  show(): void {
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  async toggle(): Promise<void> {
    const gamificationSettings = await this.settings.getGamificationSettings();
    if (gamificationSettings.microMeditation.enabled) {
      this.hide();
      await this.settings.updateGamificationSettings({
        ...gamificationSettings,
        microMeditation: {
          ...gamificationSettings.microMeditation,
          enabled: false
        }
      });
    } else {
      this.show();
      await this.settings.updateGamificationSettings({
        ...gamificationSettings,
        microMeditation: {
          ...gamificationSettings.microMeditation,
          enabled: true
        }
      });
    }
  }

  dispose(): void {
    if (this.urgencyTimer) {
      clearInterval(this.urgencyTimer);
      this.urgencyTimer = undefined;
    }
    if (this.autoCompleteTimer) {
      clearTimeout(this.autoCompleteTimer);
      this.autoCompleteTimer = undefined;
    }
    this.statusBarItem.dispose();
  }
}