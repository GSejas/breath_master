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
    updateGamificationDisplay();
    statusBarItemGamification.show();
    
    // Set up hover tracking for meditation
    setupHoverTracking();
  }

  // Register commands
  const toggleCommand = vscode.commands.registerCommand("breathMaster.toggle", toggleBreathing);
  const cycleCommand = vscode.commands.registerCommand("breathMaster.cyclePattern", cyclePattern);
  const meditateCommand = vscode.commands.registerCommand("breathMaster.toggleMeditation", toggleMeditation);
  const tourCommand = vscode.commands.registerCommand("breathMaster.showTour", showTour);
  const exportCommand = vscode.commands.registerCommand("breathMaster.exportData", exportData);
  const clearCommand = vscode.commands.registerCommand("breathMaster.clearData", clearData);

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
    configListener
  );

  // Show tour if first time
  if (onboardingManager.shouldShowTour()) {
    setTimeout(() => showTour(), 2000); // Delay to let VS Code finish loading
  }

  // Start the breathing animation
  startAnimation();
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
  let tooltip = "";
  
  if (showXP) {
    const level = meditationTracker.getCurrentLevel();
    text += `${level.icon} ${level.title}`;
    tooltip += `Level ${level.level}: ${level.title}\n`;
  }
  
  if (showStreak && stats.currentStreak > 0) {
    const streakIcon = meditationTracker.getStreakIcon();
    text += text ? ` • ${streakIcon} ${stats.currentStreak}d` : `${streakIcon} ${stats.currentStreak}d`;
    tooltip += `Meditation streak: ${stats.currentStreak} days\n`;
  }
  
  if (showSessionTimer && stats.todaySessionTime > 0) {
    const todayTime = meditationTracker.formatSessionTime(stats.todaySessionTime);
    text += text ? ` • ${todayTime}` : todayTime;
    tooltip += `Today's meditation: ${todayTime}\n`;
  }
  
  statusBarItemGamification.text = text || "🧘 Start meditating";
  statusBarItemGamification.tooltip = tooltip + "Hover over breathMaster controls to track meditation time!";
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
  const tourSteps = onboardingManager.getTourSteps();
  
  for (const step of tourSteps) {
    const action = await vscode.window.showInformationMessage(
      step.title,
      { modal: true, detail: step.content },
      { title: step.action || "Continue" },
      { title: "Skip Tour" }
    );
    
    if (action?.title === "Skip Tour") {
      break;
    }
    
    // Special handling for gamification opt-in step
    if (step.title.includes("Optional Gamification")) {
      const optIn = await vscode.window.showInformationMessage(
        "🎮 Enable Meditation Tracking?",
        { modal: true, detail: "Track your mindful moments with gentle gamification. Your data stays completely private and local." },
        { title: "Yes, let's try it!" },
        { title: "Maybe later" }
      );
      
      if (optIn?.title === "Yes, let's try it!") {
        const config = vscode.workspace.getConfiguration("breathMaster");
        await config.update("enableGamification", true, vscode.ConfigurationTarget.Global);
        onboardingManager.markTourCompleted(true);
        vscode.window.showInformationMessage("🌟 Awesome! Your meditation tracking is now enabled.");
      } else {
        onboardingManager.markTourCompleted(false);
      }
    }
  }
  
  if (!onboardingManager.getState().hasSeenTour) {
    onboardingManager.markTourCompleted(false);
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
