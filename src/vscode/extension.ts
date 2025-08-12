/**
 * extension.ts
 * VS Code adapter that subscribes to the breathing engine and updates the status bar
 */

import * as vscode from "vscode";
import { BreatheEngine, Pattern } from "../engine/breathe-engine";

let engine: BreatheEngine;
let statusBarItem: vscode.StatusBarItem;
let statusBarItemRight: vscode.StatusBarItem;
let animationTimer: any | undefined;
let lastPhase: string = "";

export function activate(context: vscode.ExtensionContext): void {
  // Initialize breathing engine with current pattern
  const config = vscode.workspace.getConfiguration("breatheGlow");
  engine = new BreatheEngine(config.get<Pattern>("pattern", "chill"));

  // Create left-aligned status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = "$(pulse)";
  statusBarItem.tooltip = "BreatheGlow - Click to toggle";
  statusBarItem.command = "breatheGlow.toggle";
  statusBarItem.show();

  // Create right-aligned status bar item for pattern cycling (fun button!)
  statusBarItemRight = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  statusBarItemRight.text = "$(pulse) Chill";
  statusBarItemRight.tooltip = "BreatheGlow - Click to cycle patterns!";
  statusBarItemRight.command = "breatheGlow.cyclePattern";
  statusBarItemRight.show();

  // Register commands
  const toggleCommand = vscode.commands.registerCommand("breatheGlow.toggle", toggleBreathing);
  const cycleCommand = vscode.commands.registerCommand("breatheGlow.cyclePattern", cyclePattern);

  // Register for configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("breatheGlow")) {
      restartAnimation();
    }
  });

  context.subscriptions.push(statusBarItem, statusBarItemRight, toggleCommand, cycleCommand, configListener);

  // Start the breathing animation
  startAnimation();
}

function startAnimation(): void {
  const config = vscode.workspace.getConfiguration("breatheGlow");
  
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
    statusBarItem.tooltip = `BreatheGlow (${engine.pattern}) - ${phase} ${remainingSeconds}s\n↑ Inhale | — Hold | ↓ Exhale`;
    
    // Update right-side fun button with pattern name and breathing icon
    if (showBoth) {
      const patternDisplay = engine.pattern.charAt(0).toUpperCase() + engine.pattern.slice(1);
      statusBarItemRight.text = `${sizeIcon}${phaseIcon} ${patternDisplay}`;
      statusBarItemRight.tooltip = `${patternDisplay} breathing • Click to cycle patterns!\nChill → Medium → Active → Boxing → Relaxing`;
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
  statusBarItem.text = "$(pulse)$(stop) BreatheGlow";
  statusBarItem.tooltip = "BreatheGlow - Click to enable";
  statusBarItemRight.text = "$(pulse)$(stop) Off";
  statusBarItemRight.tooltip = "BreatheGlow - Click to cycle patterns!";
}

function restartAnimation(): void {
  // Update engine pattern if it changed
  const config = vscode.workspace.getConfiguration("breatheGlow");
  const newPattern = config.get<Pattern>("pattern", "chill");
  if (newPattern !== engine.pattern) {
    engine.setPattern(newPattern);
  }
  
  stopAnimation();
  startAnimation();
}

async function toggleBreathing(): Promise<void> {
  const config = vscode.workspace.getConfiguration("breatheGlow");
  const currentEnabled = config.get<boolean>("enabled", true);
  
  await config.update("enabled", !currentEnabled, vscode.ConfigurationTarget.Global);
  
  vscode.window.showInformationMessage(
    `BreatheGlow ${!currentEnabled ? "enabled" : "disabled"}`
  );
}

async function cyclePattern(): Promise<void> {
  const patterns: Pattern[] = ["chill", "medium", "active", "boxing", "relaxing"];
  const patternNames = {
    chill: "Chill (6s-8s)",
    medium: "Medium (5s-5s)", 
    active: "Active (4s-2s-4s-1s)",
    boxing: "Boxing (4s-4s-4s-4s)",
    relaxing: "Relaxing (4s-7s-8s)"
  };
  
  const currentPattern = engine.pattern;
  const currentIndex = patterns.indexOf(currentPattern);
  const nextPattern = patterns[(currentIndex + 1) % patterns.length];
  
  const config = vscode.workspace.getConfiguration("breatheGlow");
  await config.update("pattern", nextPattern, vscode.ConfigurationTarget.Global);
  
  vscode.window.showInformationMessage(
    `🫁 ${patternNames[nextPattern]}`
  );
}

export function deactivate(): void {
  stopAnimation();
}
