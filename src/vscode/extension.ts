/**
 * extension.ts
 * VS Code adapter that subscribes to the breathing engine and updates the status bar
 */

import * as vscode from "vscode";
import { BreatheEngine, Pattern } from "../engine/breathe-engine";
import { MeditationTracker } from "../engine/gamification";
import { OnboardingManager } from "../engine/onboarding";

let engine: BreatheEngine;
let statusBarItem: vscode.StatusBarItem;
let statusBarItemRight: vscode.StatusBarItem;
let statusBarItemGamification: vscode.StatusBarItem;
let animationTimer: any | undefined;
let lastPhase: string = "";
let meditationTracker: MeditationTracker;
let onboardingManager: OnboardingManager;
// Track whether we've bound the new quick pledge command
let quickPledgeRegistered = false;
// Stretch preset scheduling
interface StretchPresetStep { label: string; afterMinutes: number }
interface StretchPreset { id: string; title: string; description: string; steps: StretchPresetStep[] }
// Minimal parsed form for compact mode
interface ParsedStretchStep { raw: string; action: string; duration?: string; quote?: string; icon?: string }
function parseStretchLabel(label: string): ParsedStretchStep {
  // Pattern: ICON? text (duration) - "quote"
  const iconMatch = /^([\p{Emoji_Presentation}\p{Emoji}\u200d]+)\s+/u.exec(label);
  let rest = label;
  let icon: string | undefined;
  if (iconMatch) { icon = iconMatch[1]; rest = rest.slice(icon.length).trimStart(); }
  let quote: string | undefined;
  const quoteIdx = rest.indexOf('"');
  if (quoteIdx !== -1) {
    const parts = rest.split('"');
    if (parts.length >= 3) {
      quote = parts[1];
      rest = rest.replace(`- "${quote}"`, '').trim();
    }
  }
  let duration: string | undefined;
  const durMatch = /\(([^)]+)\)/.exec(rest);
  if (durMatch) {
    duration = durMatch[1];
  }
  return { raw: label, action: rest, duration, quote, icon };
}
const STRETCH_PRESETS: StretchPreset[] = [
  {
    id: 'gentle-break',
    title: 'Gentle Break Flow',
    description: 'Light mobility across 25 minutes',
    steps: [
      { label: '🌳 Neck roll & shoulder circles (30s) - "Like branches swaying, release what you hold"', afterMinutes: 5 },
      { label: '🌳 Stand + spinal extension (45s) - "Rise toward the light, roots firm below"', afterMinutes: 10 },
      { label: '🌳 Wrist + forearm stretch (40s) - "Tender care for the hands that create"', afterMinutes: 15 },
      { label: '🌳 Seated hip openers (60s) - "Ground opens, awareness deepens with each breath"', afterMinutes: 20 }
    ]
  },
  {
    id: 'focus-reset',
    title: 'Focus Reset',
    description: 'Fast pattern to reset posture & breath',
    steps: [
      { label: '🌳 Stand & 5 deep belly breaths - "Ancient rhythm flows through modern work"', afterMinutes: 10 },
      { label: '🌳 Thoracic twist + reach (40s) - "Spiral like new growth seeking sun"', afterMinutes: 20 }
    ]
  },
  {
    id: 'full-posture',
    title: 'Full Posture Cycle',
    description: 'Structured upright reset across an hour',
    steps: [
      { label: '🌳 Open chest doorway stretch (45s) - "Heart space widens like forest clearings"', afterMinutes: 15 },
      { label: '🌳 Calf raises + ankle mobility (60s) - "Strong foundation supports towering presence"', afterMinutes: 30 },
      { label: '🌳 Hamstring hinge fold (45s) - "Bow to earth that nurtures all growth"', afterMinutes: 45 }
    ]
  },
  {
    id: 'coding-warriors',
    title: 'Coding Warriors Recovery', 
    description: 'Combat desk posture with warrior wisdom',
    steps: [
      { label: '🌳 Warrior I stance (45s each side) - "Stand tall like ancient trees facing storms"', afterMinutes: 12 },
      { label: '🌳 Eagle arms + twists (40s) - "Winds of change strengthen flexible branches"', afterMinutes: 25 },
      { label: '🌳 Child\'s pose to cobra (60s) - "From earth\'s embrace, rise renewed"', afterMinutes: 40 }
    ]
  },
  {
    id: 'mindful-movement',
    title: 'Mindful Movement Meditation',
    description: 'Flowing awareness through body and breath',
    steps: [
      { label: '🌳 Cat-cow spine waves (60s) - "Spine flows like wind through branches"', afterMinutes: 8 },
      { label: '🌳 Standing forward fold hold (45s) - "Surrender weight to gravity\'s wisdom"', afterMinutes: 18 },
      { label: '🌳 Mountain pose + breath awareness (90s) - "Still as mountains, flowing as rivers"', afterMinutes: 30 },
      { label: '🌳 Gentle hip circles (45s) - "Root chakra awakens with circular grace"', afterMinutes: 45 }
    ]
  }
];

// Active stretch preset state now tracks completed steps
let activeStretchPreset: { preset: StretchPreset; startedAt: number; timers: NodeJS.Timeout[]; completed: number } | null = null;

export function activate(context: vscode.ExtensionContext): void {
  // Initialize breathing engine with current pattern
  const config = vscode.workspace.getConfiguration("breathMaster");
  const pattern = config.get<Pattern>("pattern", "chill");
  const customPattern = config.get<string>("customPattern", "4-4-4-4");
  
  engine = new BreatheEngine(pattern, customPattern);

  // Initialize meditation tracker with VS Code storage
  meditationTracker = new MeditationTracker('breathMaster.meditationStats', context.globalState);
  
  // Initialize onboarding manager
  onboardingManager = new OnboardingManager('breathMaster.onboarding', context.globalState);

  // Create left-aligned status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = "$(pulse)";
  statusBarItem.tooltip = "Breath Master - Click to toggle";
  statusBarItem.command = "breathMaster.toggle";
  statusBarItem.show();

  // Create right-aligned status bar item for pattern cycling (fun button!)
  statusBarItemRight = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  statusBarItemRight.text = "$(pulse) Chill";
  statusBarItemRight.tooltip = "Breath Master - Click to cycle patterns!";
  statusBarItemRight.command = "breathMaster.cyclePattern";
  statusBarItemRight.show();

  // Create gamification status bar item (if enabled)
  if (config.get<boolean>("enableGamification", true)) {
    statusBarItemGamification = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999);
  statusBarItemGamification.command = "breathMaster.quickPledge";
  updateGamificationDisplay();
  statusBarItemGamification.show();
    // Set up hover tracking for meditation
    setupHoverTracking();
  }

  // Register commands
  const toggleCommand = vscode.commands.registerCommand("breathMaster.toggle", toggleBreathing);
  const cycleCommand = vscode.commands.registerCommand("breathMaster.cyclePattern", cyclePattern);
  const meditateCommand = vscode.commands.registerCommand("breathMaster.toggleMeditation", toggleMeditation);
  // New session / pledge related commands
  const startSessionCommand = vscode.commands.registerCommand('breathMaster.startSession', async () => {
    const tracker = meditationTracker as MeditationTracker;
    // Offer quick pick of goal options
    const goalProfile = tracker.getGoalOptions();
    const pick = await vscode.window.showQuickPick(goalProfile.options.map(o => ({ label: `${o} minutes`, value: o })), { placeHolder: 'Select session goal' });
    const chosen = pick ? pick.value : undefined;
    const started = tracker.startSession(chosen);
    if (started.started) {
      vscode.window.showInformationMessage(`🧘 Session started${chosen ? ' • Goal ' + chosen + 'm' : ''}`);
      updateGamificationDisplay();
    } else {
      vscode.window.showInformationMessage(`Cannot start session: ${started.reason}`);
    }
  });
  const pauseSessionCommand = vscode.commands.registerCommand('breathMaster.pauseSession', () => {
    if (meditationTracker.pauseSession()) {
      vscode.window.showInformationMessage('⏸️ Session paused');
      updateGamificationDisplay();
    }
  });
  const resumeSessionCommand = vscode.commands.registerCommand('breathMaster.resumeSession', () => {
    if (meditationTracker.resumeSession()) {
      vscode.window.showInformationMessage('▶️ Session resumed');
      updateGamificationDisplay();
    }
  });
  const endSessionCommand = vscode.commands.registerCommand('breathMaster.endSession', () => {
    const record = meditationTracker.endSession();
    if (record) {
      const mins = Math.round(record.activeMs/60000*10)/10;
      const bonus = record.goalBonusXP ? ` • +${record.goalBonusXP} bonus XP` : '';
      const pledge = record.pledgeMultiplier && record.pledgeHonored ? ` • Pledge honored x${record.pledgeMultiplier}` : '';
      vscode.window.showInformationMessage(`✅ Session ${mins}m${bonus}${pledge}`);
      updateGamificationDisplay();
      
      // Check for challenge completion after session ends
      const completed = meditationTracker.checkChallengeAutoCompletion();
      completed.forEach(challenge => {
        setTimeout(() => {
          vscode.window.showInformationMessage(`🌳 ${challenge.completionMessage} (+${challenge.rewardXP} XP)`);
        }, 1000);
      });
    }
  });
  const changeGoalCommand = vscode.commands.registerCommand('breathMaster.changeGoal', async () => {
    const tracker = meditationTracker as MeditationTracker;
    const goalProfile = tracker.getGoalOptions();
    const pick = await vscode.window.showQuickPick(goalProfile.options.map(o => ({ label: `${o} minutes`, value: o })), { placeHolder: 'Select new default session goal' });
    if (pick) {
      tracker.startSession(pick.value); // start a fresh session directly
      vscode.window.showInformationMessage(`🎯 New session started with goal ${pick.value}m`);
      updateGamificationDisplay();
    }
  });
  const makePledgeCommand = vscode.commands.registerCommand('breathMaster.makePledge', async () => {
    const tracker = meditationTracker as MeditationTracker;
    const goalProfile = tracker.getGoalOptions();
    const pick = await vscode.window.showQuickPick(goalProfile.options.map(o => ({ label: `${o}m goal (+15% if honored)`, value: o })), { placeHolder: 'Select pledge goal' });
    if (!pick) return;
    const res = tracker.makePledge(pick.value, 1.15);
    if (res.ok) {
      vscode.window.showInformationMessage(`🎯 Pledge set: ${pick.value}m • +15% if goal fully met`);
  updateGamificationDisplay();
    } else {
      vscode.window.showInformationMessage(`Cannot create pledge: ${res.reason}`);
    }
  });
  const cancelPledgeCommand = vscode.commands.registerCommand('breathMaster.cancelPledge', () => {
    if (meditationTracker.cancelPledge()) {
      vscode.window.showInformationMessage('Pledge cancelled');
  updateGamificationDisplay();
    }
  });

  // Stretch preset start
  const startStretchPreset = vscode.commands.registerCommand('breathMaster.startStretchPreset', async () => {
    if (activeStretchPreset) {
      vscode.window.showWarningMessage('A stretch preset is already active. Cancel it first.');
      return;
    }
    const pick = await vscode.window.showQuickPick(
      STRETCH_PRESETS.map(p => ({ label: p.title, description: p.description, id: p.id })),
      { placeHolder: 'Select a stretch preset to schedule' }
    );
    if (!pick) return;
    const preset = STRETCH_PRESETS.find(p => p.id === pick.id)!;
    const base = Date.now();
    const timers: NodeJS.Timeout[] = [];
    const config = vscode.workspace.getConfiguration('breathMaster');
    const compactMode = config.get<string>('stretch.compactMode', 'auto');
    const showQuotes = config.get<boolean>('stretch.showEonQuotes', true);
    const iconStyle = config.get<string>('stretch.iconStyle', 'emoji');
    const formatStep = (label: string): string => {
      const parsed = parseStretchLabel(label);
      const parts: string[] = [];
      if (iconStyle === 'emoji' && parsed.icon) parts.push(parsed.icon);
      // Decide compactness
      const alwaysCompact = compactMode === 'on';
      const neverCompact = compactMode === 'off';
      const autoCompact = compactMode === 'auto';
      const longAction = parsed.action.length > 40;
      const useCompact = alwaysCompact || (autoCompact && longAction);
      if (useCompact) {
        // action part until first '(' for concise form
        let act = parsed.action;
        // Remove quote if any remained
        if (parsed.duration) {
          // Keep only portion before '(' for brevity if long
          if (longAction) {
            const firstParen = act.indexOf('(');
            if (firstParen !== -1) act = act.slice(0, firstParen).trim();
          }
        }
        parts.push(act);
        if (parsed.duration) parts.push(`(${parsed.duration})`);
      } else {
        parts.push(parsed.action);
        if (parsed.duration && !parsed.action.includes(`(${parsed.duration})`)) parts.push(`(${parsed.duration})`);
        if (showQuotes && parsed.quote) parts.push(`“${parsed.quote}”`);
      }
      return parts.join(' ').replace(/\s+/g, ' ');
    };
    preset.steps.forEach((step: StretchPresetStep, idx: number) => {
      const t = setTimeout(() => {
        // If cancelled before firing, abort
        if (!activeStretchPreset || activeStretchPreset.preset.id !== preset.id) return;
        vscode.window.showInformationMessage(`🧘 ${preset.title}: ${formatStep(step.label)}`);
        activeStretchPreset.completed = Math.max(activeStretchPreset.completed, idx + 1);
        // If final step, mark completion & clear after a brief delay
        if (idx === preset.steps.length - 1) {
          vscode.window.showInformationMessage(`✅ Stretch preset complete: ${preset.title}`);
          const clearTimer = setTimeout(() => {
            if (activeStretchPreset && activeStretchPreset.preset.id === preset.id) {
              activeStretchPreset.timers.forEach(tt => clearTimeout(tt));
              activeStretchPreset = null;
              updateGamificationDisplay();
            }
          }, 2500); // allow user to still see tooltip progress momentarily
          timers.push(clearTimer as unknown as NodeJS.Timeout);
        }
        updateGamificationDisplay();
      }, step.afterMinutes * 60000);
      timers.push(t);
    });
    activeStretchPreset = { preset, startedAt: base, timers, completed: 0 };
  vscode.window.showInformationMessage(`🧘 Stretch preset started: ${preset.title} (Use: Command Palette → Breath Master: Cancel Stretch Preset)`);
  updateGamificationDisplay();
  });

  const cancelStretchPreset = vscode.commands.registerCommand('breathMaster.cancelStretchPreset', () => {
    if (!activeStretchPreset) { vscode.window.showInformationMessage('No active stretch preset.'); return; }
  activeStretchPreset.timers.forEach(t => clearTimeout(t));
    vscode.window.showInformationMessage(`Stretch preset cancelled: ${activeStretchPreset.preset.title}`);
    activeStretchPreset = null;
  updateGamificationDisplay();
  });

  // Challenge commands
  const viewChallengesCommand = vscode.commands.registerCommand('breathMaster.viewChallenges', async () => {
    const challenges = meditationTracker.getAvailableChallenges();
    if (challenges.length === 0) {
      vscode.window.showInformationMessage('🌳 No challenges available right now. New ones appear throughout the day.');
      return;
    }
    
    const items = challenges.map(c => ({
      label: `${c.title} (+${c.rewardXP} XP)`,
      description: c.description,
      detail: c.eonMessage,
      challenge: c
    }));
    
    const pick = await vscode.window.showQuickPick(items, { 
      placeHolder: 'Daily Challenges from Eon',
      ignoreFocusOut: true
    });
    
    if (pick) {
      vscode.window.showInformationMessage(`🌳 Eon whispers: "${pick.challenge.eonMessage}"`);
    }
  });

  const completeChallengeCommand = vscode.commands.registerCommand('breathMaster.completeChallenge', async () => {
    const challenges = meditationTracker.getAvailableChallenges();
    if (challenges.length === 0) {
      vscode.window.showInformationMessage('No available challenges to complete manually.');
      return;
    }
    
    const items = challenges.map(c => ({
      label: c.title,
      description: `+${c.rewardXP} XP`,
      detail: c.description,
      id: c.id
    }));
    
    const pick = await vscode.window.showQuickPick(items, { 
      placeHolder: 'Mark challenge as completed' 
    });
    
    if (pick) {
      const result = meditationTracker.completeChallenge(pick.id);
      if (result.success && result.challenge) {
        vscode.window.showInformationMessage(`🌳 ${result.challenge.completionMessage} (+${result.xpAwarded} XP)`);
        updateGamificationDisplay();
      }
    }
  });

  // Quick pledge command: open pledge selection (or session controls if running)
  const quickPledgeCommand = vscode.commands.registerCommand('breathMaster.quickPledge', async () => {
    const tracker = meditationTracker as MeditationTracker;
    const active = tracker.getActiveSession();
    if (active) {
      const items: { label: string; action: string }[] = [];
      if (active.state === 'running') items.push({ label: '⏸ Pause', action: 'pause' });
      if (active.state === 'paused') items.push({ label: '▶ Resume', action: 'resume' });
      items.push({ label: '⏹ End', action: 'end' });
      items.push({ label: '🎯 New / Replace Pledge', action: 'pledge' });
      if (tracker.getActivePledge()) items.push({ label: '🗑 Cancel Pledge', action: 'cancel' });
    if (activeStretchPreset) items.push({ label: '🧘 Cancel Stretch Preset', action: 'cancel-stretch' });
      const pick = await vscode.window.showQuickPick(items, { placeHolder: 'Session controls' });
      if (!pick) return;
      switch (pick.action) {
  case 'pause': vscode.commands.executeCommand('breathMaster.pauseSession'); updateGamificationDisplay(); break;
  case 'resume': vscode.commands.executeCommand('breathMaster.resumeSession'); updateGamificationDisplay(); break;
  case 'end': vscode.commands.executeCommand('breathMaster.endSession'); updateGamificationDisplay(); break;
  case 'pledge': vscode.commands.executeCommand('breathMaster.makePledge'); updateGamificationDisplay(); break;
  case 'cancel': vscode.commands.executeCommand('breathMaster.cancelPledge'); updateGamificationDisplay(); break;
  case 'cancel-stretch': vscode.commands.executeCommand('breathMaster.cancelStretchPreset'); break;
      }
      return;
    }
    const goals = tracker.getGoalOptions();
    const items = goals.options.map(o => ({ label: `🎯 ${o}m pledge (+15%)`, value: o }));
    items.unshift({ label: '⏭ Skip pledge (start without)', value: -1 });
    const pick = await vscode.window.showQuickPick(items, { placeHolder: 'Select pledge goal or skip' });
    if (!pick) return;
    if (pick.value !== -1) {
      const res = tracker.makePledge(pick.value, 1.15);
      if (!res.ok) vscode.window.showWarningMessage(`Pledge failed: ${res.reason}`);
    }
    // Allow quick cancel stretch if user wants before starting
    if (activeStretchPreset) {
      const addCancel = await vscode.window.showQuickPick([
        { label: 'Proceed (keep stretch preset)', action: 'go' },
        { label: 'Cancel active stretch preset first', action: 'cancel-stretch' }
      ], { placeHolder: 'Stretch preset active – choose before starting session' });
      if (addCancel && addCancel.action === 'cancel-stretch') {
        vscode.commands.executeCommand('breathMaster.cancelStretchPreset');
      }
    }
    const goalMinutes = pick.value === -1 ? goals.defaultMinutes : pick.value;
    const started = tracker.startSession(goalMinutes);
    if (started.started) {
      vscode.window.showInformationMessage(`🧘 Session started${pick.value !== -1 ? ' with pledge' : ''} • Goal ${goalMinutes}m`);
    } else {
      vscode.window.showWarningMessage(`Cannot start session: ${started.reason}`);
    }
    updateGamificationDisplay();
  });

  // Smart gamification status bar action - shows contextual dropdown
  const quickSessionActionCommand = vscode.commands.registerCommand('breathMaster.quickSessionAction', async () => {
    const tracker = meditationTracker as MeditationTracker;
    const activeSession = tracker.getActiveSession();
    
    if (activeSession) {
      // Session is active - show session control options
      const options = [];
      if (activeSession.state === 'running') {
        options.push({ label: '⏸️ Pause Session', action: 'pause' });
      } else if (activeSession.state === 'paused') {
        options.push({ label: '▶️ Resume Session', action: 'resume' });
      }
      options.push({ label: '✅ End Session', action: 'end' });
      options.push({ label: '🎯 Make Pledge', action: 'pledge' });
      
      const pick = await vscode.window.showQuickPick(options, { 
        placeHolder: 'Session Actions' 
      });
      
      if (pick) {
        if (pick.action === 'pause') {
          vscode.commands.executeCommand('breathMaster.pauseSession');
            updateGamificationDisplay();
        } else if (pick.action === 'resume') {
          vscode.commands.executeCommand('breathMaster.resumeSession');
            updateGamificationDisplay();
        } else if (pick.action === 'end') {
          vscode.commands.executeCommand('breathMaster.endSession');
            updateGamificationDisplay();
        } else if (pick.action === 'pledge') {
          vscode.commands.executeCommand('breathMaster.makePledge');
            updateGamificationDisplay();
        }
      }
    } else {
      // No active session - show goal selection and start
      const goalProfile = tracker.getGoalOptions();
      const goalOptions = goalProfile.options.map(o => ({ 
        label: `🎯 ${o} minutes`, 
        description: o === goalProfile.defaultMinutes ? '(recommended)' : '',
        value: o 
      }));
      goalOptions.push({ label: '🎮 Make Pledge & Start', description: '+15% XP if goal met', value: -1 });
      
      const pick = await vscode.window.showQuickPick(goalOptions, { 
        placeHolder: 'Select session goal and start' 
      });
      
      if (pick) {
        if (pick.value === -1) {
          // Pledge flow
          vscode.commands.executeCommand('breathMaster.makePledge');
          updateGamificationDisplay();
        } else {
          // Start session with selected goal
          const started = tracker.startSession(pick.value);
          if (started.started) {
            vscode.window.showInformationMessage(`🧘 Session started • Goal ${pick.value}m`);
            updateGamificationDisplay();
          } else {
            vscode.window.showInformationMessage(`Cannot start session: ${started.reason}`);
          }
        }
      }
    }
  });
  const tourCommand = vscode.commands.registerCommand("breathMaster.showTour", showTour);
  const exportCommand = vscode.commands.registerCommand("breathMaster.exportData", exportData);
  const clearCommand = vscode.commands.registerCommand("breathMaster.clearData", clearData);

  // Leaderboard preview (placeholder)
  const leaderboardCommand = vscode.commands.registerCommand('breathMaster.showLeaderboard', async () => {
    vscode.window.showInformationMessage('🏆 Leaderboards planned: opt-in, privacy-first, company/team & global tiers. (Coming soon)');
  });

  // Register for configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("breathMaster")) {
      restartAnimation();
      if (statusBarItemGamification) {
        updateGamificationDisplay();
      }
    }
  });

  context.subscriptions.push(
    statusBarItem, 
    statusBarItemRight, 
    statusBarItemGamification,
    toggleCommand, 
    cycleCommand, 
    meditateCommand,
    tourCommand,
    exportCommand,
    clearCommand,
    configListener,
    startSessionCommand,
    pauseSessionCommand,
    resumeSessionCommand,
    endSessionCommand,
    changeGoalCommand,
    makePledgeCommand,
    cancelPledgeCommand,
  quickSessionActionCommand,
  leaderboardCommand
  );

  // Show tour if first time
  if (onboardingManager.shouldShowTour()) {
    setTimeout(() => showTour(), 2000); // Delay to let VS Code finish loading
  }

  // Start the breathing animation
  startAnimation();

  // Gentle reminder scheduling scaffold
  scheduleGentleReminders();
}

function startAnimation(): void {
  const config = vscode.workspace.getConfiguration("breathMaster");
  
  if (!config.get<boolean>("enabled", true)) {
    stopAnimation();
    return;
  }

  const tickMs = config.get<number>("tickMs", 100);
  const intensity = Math.min(config.get<number>("intensity", 0.6), 1.0) * 0.49; // Cap at 0.49 as requested
  const showBoth = config.get<boolean>("showBoth", true);
  const showNotifications = config.get<boolean>("showNotifications", false);

  // Show/hide right status bar item based on setting
  if (showBoth) {
    statusBarItemRight.show();
  } else {
    statusBarItemRight.hide();
  }

  if (animationTimer) {
    clearInterval(animationTimer);
  }

  animationTimer = setInterval(() => {
    const amplitude = engine.getAmplitude();
    const scaledAmplitude = amplitude * intensity;
    const { phase, remainingSeconds } = engine.getCurrentPhase();
    
    // Create breathing effect by varying icon based on amplitude
    let sizeIcon = "$(pulse)";
    if (scaledAmplitude < 0.2) {
      sizeIcon = "$(circle-small-filled)";
    } else if (scaledAmplitude < 0.5) {
      sizeIcon = "$(circle-filled)";
    } else if (scaledAmplitude < 0.8) {
      sizeIcon = "$(circle-large-filled)";
    } else {
      sizeIcon = "$(record)"; // Largest circle
    }

    // Add directional phase icons for visual breathing cues
    let phaseIcon = "$(pulse)";
    if (phase === "Inhale") {
      phaseIcon = "$(chevron-up)"; // Upward breath flow
    } else if (phase === "Hold") {
      phaseIcon = "$(remove)"; // Pause/hold symbol
    } else if (phase === "Exhale") {
      phaseIcon = "$(chevron-down)"; // Downward breath flow
    }

    // Display phase with both size and direction icons
    statusBarItem.text = `${sizeIcon}${phaseIcon} ${phase} ${remainingSeconds}s`;
    statusBarItem.tooltip = `breathMaster (${engine.pattern}) - ${phase} ${remainingSeconds}s\n↑ Inhale | — Hold | ↓ Exhale`;
    
    // Update right-side fun button with pattern name and breathing icon
    if (showBoth) {
      const patternDisplay = engine.pattern.charAt(0).toUpperCase() + engine.pattern.slice(1);
      statusBarItemRight.text = `${sizeIcon}${phaseIcon} ${patternDisplay}`;
      statusBarItemRight.tooltip = `${patternDisplay} breathing • Click to cycle patterns!\nChill → Medium → Active → Boxing → Relaxing`;
    }

    // Track meditation cycle completion for gamification
    if (phase !== lastPhase && phase === "Inhale" && lastPhase === "Exhale") {
      meditationTracker.onBreathingCycleComplete();
      updateGamificationDisplay();
      
      // Check for challenge auto-completion
      const completed = meditationTracker.checkChallengeAutoCompletion();
      completed.forEach(challenge => {
        vscode.window.showInformationMessage(`🌳 ${challenge.completionMessage} (+${challenge.rewardXP} XP)`);
      });
    }

    // Show notification when phase changes (if enabled)
    if (showNotifications && phase !== lastPhase) {
      vscode.window.showInformationMessage(`${phase} - ${remainingSeconds}s`);
      lastPhase = phase;
    }
  }, tickMs);
}

function stopAnimation(): void {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = undefined;
  }
  statusBarItem.text = "$(pulse)$(stop) breathMaster";
  statusBarItem.tooltip = "breathMaster - Click to enable";
  statusBarItemRight.text = "$(pulse)$(stop) Off";
  statusBarItemRight.tooltip = "breathMaster - Click to cycle patterns!";
}

function updateGamificationDisplay(): void {
  if (!statusBarItemGamification) return;
  
  const config = vscode.workspace.getConfiguration("breathMaster");
  const showStreak = config.get<boolean>("showStreak", true);
  const showSessionTimer = config.get<boolean>("showSessionTimer", true);
  const showXP = config.get<boolean>("showXP", true);
  
  const gamificationData = meditationTracker.getGamificationDisplay();
  const stats = meditationTracker.getStats();
  
  let text = "";
  if (showXP) {
    const level = meditationTracker.getCurrentLevel();
    text += `${level.icon} ${level.title}`;
  }
  if (showStreak && stats.currentStreak > 0) {
    const streakIcon = meditationTracker.getStreakIcon();
    text += text ? ` • ${streakIcon} ${stats.currentStreak}d` : `${streakIcon} ${stats.currentStreak}d`;
  }
  if (showSessionTimer && stats.todaySessionTime > 0) {
    const todayTime = meditationTracker.formatSessionTime(stats.todaySessionTime);
    text += text ? ` • ${todayTime}` : todayTime;
  }
  const sessionText = meditationTracker.getSessionStatusBarText();
  statusBarItemGamification.text = (text ? text + ' • ' : '') + sessionText;

  // Build rich Markdown tooltip
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = false;
  md.appendMarkdown('**Breath Master**  \n');
  if (showXP) {
    const level = meditationTracker.getCurrentLevel();
    const progress = meditationTracker.getProgressToNextLevel();
    const filled = Math.min(10, Math.max(0, Math.round(progress.percentage / 10)));
    const bar = '▰'.repeat(filled) + '▱'.repeat(10 - filled);
    md.appendMarkdown(`Level **${level.level} – ${level.title}**  \\\n+XP ${progress.current}/${progress.required} (${progress.percentage}%)  \\\n+${bar}  \n`);
  }
  if (showStreak && stats.currentStreak > 0) {
    md.appendMarkdown(`Streak: **${stats.currentStreak}d**  \n`);
  }
  if (stats.todaySessionTime > 0) {
    md.appendMarkdown(`Today: **${meditationTracker.formatSessionTime(stats.todaySessionTime)}**  \n`);
  }
  const pledge = (meditationTracker as any).getActivePledge?.();
  if (pledge) {
    md.appendMarkdown(`Pledge: **${pledge.goalMinutes}m x${pledge.multiplier}**${pledge.cancelled ? ' (cancelled)' : ''}  \n`);
  } else {
    md.appendMarkdown(`No active pledge  \n`);
  }
  
  // Show challenge count
  const availableChallenges = meditationTracker.getAvailableChallenges();
  const totalChallenges = meditationTracker.getDailyChallenges();
  const completedCount = totalChallenges.filter(c => c.completed).length;
  if (availableChallenges.length > 0) {
    md.appendMarkdown(`🌳 **${availableChallenges.length}** challenge${availableChallenges.length > 1 ? 's' : ''} from Eon  \n`);
  } else if (completedCount > 0) {
    md.appendMarkdown(`🌳 ${completedCount}/${totalChallenges.length} challenges completed today  \n`);
  }
  // Stretch preset status
  if (activeStretchPreset) {
    const elapsed = Date.now() - activeStretchPreset.startedAt;
    const total = activeStretchPreset.preset.steps.length;
    const completed = activeStretchPreset.completed;
    const next = activeStretchPreset.preset.steps
      .filter((s, idx) => idx >= completed && s.afterMinutes * 60000 > elapsed)
      .sort((a,b) => a.afterMinutes - b.afterMinutes)[0];
    if (next) {
      const minsLeft = Math.max(0, Math.ceil((next.afterMinutes*60000 - elapsed)/60000));
      md.appendMarkdown(`🧘 Stretch: **${activeStretchPreset.preset.title}** (${completed}/${total}, next ~${minsLeft}m)  \n`);
    } else if (completed < total) {
      md.appendMarkdown(`🧘 Stretch: **${activeStretchPreset.preset.title}** (${completed}/${total}, final step imminent)  \n`);
    } else {
      md.appendMarkdown(`🧘 Stretch: **${activeStretchPreset.preset.title}** (completed)  \n`);
    }
    md.appendMarkdown(`*Run 'Cancel Stretch Preset' to stop*  \n`);
  }
  
  md.appendMarkdown(`Session: ${sessionText}  \n`);
  const active = meditationTracker.getActiveSession();
  if (active) {
    md.appendMarkdown(`*Click for controls & pledge*`);
  } else {
    md.appendMarkdown(`*Click to pledge & start*`);
  }
  statusBarItemGamification.tooltip = md;

  // Background color highlight when pledge active & session running
  if (active && pledge && !pledge.cancelled) {
    try { statusBarItemGamification.backgroundColor = new vscode.ThemeColor('breathMaster.pledgeBackground'); } catch {}
  } else {
    statusBarItemGamification.backgroundColor = undefined;
  }
}

function setupHoverTracking(): void {
  // Set up mouse tracking for meditation timer
  const hoverHandler = {
    onDidChangeTextEditorSelection: () => {
      // Track when user hovers over status bar items
      // This is a simplified approach - in practice you'd use VS Code's hover API
    }
  };
  
  // We'll simulate hover tracking by detecting when the status bar items are being interacted with
  // This is a limitation of VS Code extension API - true hover detection would require more complex setup
}

function restartAnimation(): void {
  // Update engine pattern if it changed
  const config = vscode.workspace.getConfiguration("breathMaster");
  const newPattern = config.get<Pattern>("pattern", "chill");
  const customPattern = config.get<string>("customPattern", "4-4-4-4");
  
  if (newPattern !== engine.pattern) {
    engine.setPattern(newPattern, customPattern);
  }
  
  stopAnimation();
  startAnimation();
}

// --- Gentle Reminders (Eon) -------------------------------------------------
let gentleReminderTimer: NodeJS.Timeout | undefined;
function scheduleGentleReminders() {
  if (gentleReminderTimer) { clearInterval(gentleReminderTimer); gentleReminderTimer = undefined; }
  const config = vscode.workspace.getConfiguration('breathMaster');
  const cadence = config.get<string>('gentleReminder.cadence', 'low');
  if (cadence === 'off') return;
  // Map cadence to average interval minutes (randomized later)
  const baseMinutes = cadence === 'low' ? 240 : cadence === 'standard' ? 180 : 120; // approx spacing
  gentleReminderTimer = setInterval(() => {
    const active = meditationTracker.getActiveSession();
    if (active) return; // no reminders mid-session
    const challenges = meditationTracker.getAvailableChallenges();
    const level = meditationTracker.getCurrentLevel();
    const pool: string[] = [];
    if (challenges.length) pool.push(`A new challenge waits in stillness (${challenges.length}).`);
    pool.push('Pause a breath, notice the subtle shift in shoulders.');
    pool.push('Still code. Still mind. Let them meet.');
    pool.push(`Level ${level.level} growth rings forming—consistency over intensity.`);
    const msg = pool[Math.floor(Math.random() * pool.length)];
    vscode.window.setStatusBarMessage(`🌳 ${msg}`, 6000);
  }, baseMinutes * 60000 * (0.75 + Math.random()*0.5));
}

async function toggleBreathing(): Promise<void> {
  const config = vscode.workspace.getConfiguration("breathMaster");
  const currentEnabled = config.get<boolean>("enabled", true);
  
  await config.update("enabled", !currentEnabled, vscode.ConfigurationTarget.Global);
  
  vscode.window.showInformationMessage(
    `breathMaster ${!currentEnabled ? "enabled" : "disabled"}`
  );
}

async function cyclePattern(): Promise<void> {
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
  const nextPattern = patterns[(currentIndex + 1) % patterns.length];
  
  const config = vscode.workspace.getConfiguration("breathMaster");
  await config.update("pattern", nextPattern, vscode.ConfigurationTarget.Global);
  
  vscode.window.showInformationMessage(
    `🫁 ${patternNames[nextPattern]}`
  );
}

async function toggleMeditation(): Promise<void> {
  const isHovering = (meditationTracker as any).isHovering;
  
  if (isHovering) {
    meditationTracker.stopHovering();
    vscode.window.showInformationMessage("🧘‍♂️ Meditation session ended");
  } else {
    meditationTracker.startHovering();
    vscode.window.showInformationMessage("🧘‍♀️ Meditation session started - keep cursor on controls!");
  }
  
  updateGamificationDisplay();
}

async function showTour(): Promise<void> {
  // Simplified single-step, non-modal welcome to avoid notification fatigue
  const picked = await vscode.window.showInformationMessage(
    '🫁 Welcome to Breath Master — cultivate a calm, continuous flow while you code.',
    'Enable Breath Master Mode', // enable gamification/tracking
    'Skip'
  );

  if (picked === 'Enable Breath Master Mode') {
    const config = vscode.workspace.getConfiguration('breathMaster');
    await config.update('enableGamification', true, vscode.ConfigurationTarget.Global);
    onboardingManager.markTourCompleted(true);
    vscode.window.showInformationMessage('🌟 Breath Master mode enabled. Track mindful progress anytime.');
  } else {
    // Mark seen so we do not re-prompt every startup
    onboardingManager.markTourCompleted(false);
    vscode.window.showInformationMessage('✨ You can enable Breath Master mode later from settings.');
  }
}

async function exportData(): Promise<void> {
  const config = vscode.workspace.getConfiguration("breathMaster");
  const dataPrivacy = config.get<string>("dataPrivacy", "local-only");
  
  if (dataPrivacy === "local-only") {
    const changePrivacy = await vscode.window.showWarningMessage(
      "Export not enabled",
      "Your privacy setting is 'local-only'. Would you like to allow data export?",
      "Allow Export",
      "Keep Local Only"
    );
    
    if (changePrivacy !== "Allow Export") {
      return;
    }
    
    await config.update("dataPrivacy", "export-allowed", vscode.ConfigurationTarget.Global);
  }
  
  try {
    const stats = meditationTracker.getStats();
    const onboardingState = onboardingManager.getState();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      breathMaster: {
        meditation: stats,
        onboarding: onboardingState,
        version: "0.1.0"
      }
    };
    
    const exportJson = JSON.stringify(exportData, null, 2);
    const doc = await vscode.workspace.openTextDocument({
      content: exportJson,
      language: 'json'
    });
    
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage("📁 Your Breath Master data has been opened. Save this file to backup your progress!");
    
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to export data: ${error}`);
  }
}

async function clearData(): Promise<void> {
  const confirmation = await vscode.window.showWarningMessage(
    "⚠️ Clear All Data",
    "This will permanently delete your meditation progress and reset the tour. This cannot be undone.",
    "Clear Everything",
    "Cancel"
  );
  
  if (confirmation === "Clear Everything") {
    try {
      meditationTracker.reset();
      onboardingManager.reset();
      updateGamificationDisplay();
      vscode.window.showInformationMessage("🔄 All data cleared. Welcome to a fresh start!");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to clear data: ${error}`);
    }
  }
}

export function deactivate(): void {
  if (meditationTracker && (meditationTracker as any).isHovering) {
    meditationTracker.stopHovering();
  }
  stopAnimation();
}
