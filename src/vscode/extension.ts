/**
 * extension.ts
 * VS Code adapter that subscribes to the breathing engine and updates the status bar
 */

import * as vscode from "vscode";
import { BreatheEngine, Pattern, AnimationPreset, BreathingPhase } from "../engine/breathe-engine";
import { MeditationTracker } from "../engine/gamification";
import { OnboardingManager } from "../engine/onboarding";
import { TutorialService } from "../engine/tutorial-service";
import { JourneyCoverageTracker } from './journey-coverage';
import { VSCodeSettingsAdapter } from "../engine/settings/VSCodeSettingsAdapter";
import { MicroMeditationBar } from './MicroMeditationBar';
import { registerAllCommands, CommandContext } from '../commands';

let engine: BreatheEngine;
let statusBarItem: vscode.StatusBarItem;
let statusBarItemRight: vscode.StatusBarItem;
let statusBarItemGamification: vscode.StatusBarItem;
let statusBarItemSquare: vscode.StatusBarItem;
let animationTimer: any | undefined;
let lastPhase: string = "";
let meditationTracker: MeditationTracker;
let onboardingManager: OnboardingManager;
let tutorialService: TutorialService;
let journeyCoverage: JourneyCoverageTracker;
let settings: VSCodeSettingsAdapter;
let microMeditationBar: MicroMeditationBar | undefined;
let context: vscode.ExtensionContext;
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
    id: 'quick-test',
    title: 'Quick Test (Demo)',
    description: 'Fast demo for testing - 2 minutes total',
    steps: [
      { label: '🌳 Deep breath & shoulder roll (10s) - "Feel the flow begin"', afterMinutes: 0.2 }, // 12 seconds
      { label: '🌳 Gentle neck stretch (15s) - "Release the tension"', afterMinutes: 0.5 }, // 30 seconds  
      { label: '🌳 Quick wrist circles (10s) - "Hands ready for creation"', afterMinutes: 1 }, // 1 minute
      { label: '🌳 Final centering breath (20s) - "Return to flow"', afterMinutes: 1.5 } // 1.5 minutes
    ]
  },
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

async function initializeEngine() {
  const pattern = await settings.getBreathingPattern() as Pattern;
  const customPattern = await settings.getCustomPattern();
  const customPatternString = `${customPattern[0]}-${customPattern[1]}-${customPattern[2]}-${customPattern[3]}`;
  engine = new BreatheEngine(pattern, customPatternString);
}

export async function activate(extensionContext: vscode.ExtensionContext): Promise<void> {
  // Store context globally for helper functions
  context = extensionContext;
  
  // Initialize VS Code settings adapter
  settings = new VSCodeSettingsAdapter();
  
  // Initialize breathing engine with settings
  await initializeEngine();

  // Initialize meditation tracker with VS Code storage
  meditationTracker = new MeditationTracker('breathMaster.meditationStats', extensionContext.globalState);
  
  // Initialize onboarding manager
  onboardingManager = new OnboardingManager('breathMaster.onboarding', extensionContext.globalState);
  
  // Initialize tutorial service
  tutorialService = new TutorialService(onboardingManager, extensionContext.extensionUri, settings);
  journeyCoverage = new JourneyCoverageTracker(extensionContext);

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
  const gamificationEnabled = await settings.getGamificationEnabled();
  if (gamificationEnabled) {
    // Create square indicator (stops any active session/stretch)
    statusBarItemSquare = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    statusBarItemSquare.command = "breathMaster.stopAny";
    
    // Create main gamification display (level + controls)
    statusBarItemGamification = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999);
    statusBarItemGamification.command = "breathMaster.universalControl";
    updateGamificationDisplay().catch(console.error);
    statusBarItemGamification.show();
    // Set up hover tracking for meditation
    setupHoverTracking();
    
    // Initialize micro-meditation bar if enabled
    const gamificationSettings = await settings.getGamificationSettings();
    if (gamificationSettings.microMeditation.enabled) {
      microMeditationBar = new MicroMeditationBar(meditationTracker, settings, extensionContext);
      await microMeditationBar.initialize();
      extensionContext.subscriptions.push(microMeditationBar);
    }
  }

  // Register configuration listener
  const configListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("breathMaster")) {
      restartAnimation();
      if (statusBarItemGamification) {
        updateGamificationDisplay().catch(console.error);
      }
    }
  });


  // Micro-meditation bar initialization will be handled by the refactored command

  // Internal command for micro-meditation bar to trigger gamification display updates
  const updateGamificationDisplayCommand = vscode.commands.registerCommand('breathMaster.internal.updateGamificationDisplay', () => {
    updateGamificationDisplay().catch(console.error);
  });

  // Register all refactored commands
  const allRefactoredCommands = await registerAllCommands(
    { meditationTracker, onboardingManager, settings, journeyCoverage, updateGamificationDisplay, extensionContext },
    engine,
    () => activeStretchPreset,
    (preset) => { activeStretchPreset = preset; },
    () => microMeditationBar,
    (bar) => { microMeditationBar = bar; },
    startAnimation,
    stopAnimation,
    initializeEngine
  );

  extensionContext.subscriptions.push(
    statusBarItem, 
    statusBarItemRight, 
    statusBarItemGamification,
    statusBarItemSquare,
    updateGamificationDisplayCommand,
    configListener,
    ...allRefactoredCommands
  );

  // Show tour if first time
  if (onboardingManager.shouldShowTour()) {
    setTimeout(() => {
      vscode.commands.executeCommand('breathMaster.showTour');
    }, 2000); // Delay to let VS Code finish loading
  }

  // Start the breathing animation
  startAnimation();

  // Gentle reminder scheduling scaffold
  scheduleGentleReminders().catch(console.error);
}

async function startAnimation(): Promise<void> {
  try {
    const enabled = await settings.getBreathingEnabled();

    if (!enabled) {
      stopAnimation();
      return;
    }

    const tickMs = await settings.getAnimationTickRate();
    const intensity = Math.min(await settings.getAnimationIntensity(), 1.0) * 0.49; // Cap at 0.49 as requested
    const showBoth = await settings.shouldShowPhase();
    const showNotifications = await settings.shouldShowPhaseChangeNotifications();
    const statusBarPosition = await settings.getStatusBarPosition();

  // Show/hide right status bar item based on setting
  if (showBoth) {
    statusBarItemRight.show();
  } else {
    statusBarItemRight.hide();
  }

  if (animationTimer) {
    clearInterval(animationTimer);
  }

  animationTimer = setInterval(async () => {
    const amplitude = engine.getAmplitude();
    const scaledAmplitude = amplitude * intensity;
    const { phase, remainingSeconds } = engine.getCurrentPhase();
    const detailedPhase = engine.getDetailedPhase();
    
    // Get animation configuration with fallback
    let sizeIcon = "$(pulse)"; // Default fallback
    try {
      const animationSettings = await settings.getAnimationSettings();
      const animationPreset = animationSettings.preset as AnimationPreset;
      const customFigures = animationSettings.figures;
    
      // Get animation figure based on current phase and amplitude
      sizeIcon = BreatheEngine.getAnimationFigure(
        detailedPhase.phase, 
        amplitude, 
        animationPreset,
        customFigures
      );
    } catch (error) {
      console.warn('Failed to get animation settings:', error);
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

    // Check if stretch preset is active and should take priority in display
    if (activeStretchPreset) {
      const elapsed = Date.now() - activeStretchPreset.startedAt;
      const total = activeStretchPreset.preset.steps.length;
      const completed = activeStretchPreset.completed;
      
      // Show current step instruction with cycling messages, but keep breathing orb
      if (completed === 0) {
        // Show first step with cycling motivational messages
        const currentStep = activeStretchPreset.preset.steps[0];
        const parsed = parseStretchLabel(currentStep.label);
        
        // Create 4 cycling messages for this stretch
        const baseAction = parsed.action.split(' (')[0]; // Remove duration from action
        const duration = parsed.duration || '30s';
        const quote = parsed.quote || 'Breathe and stretch mindfully';
        
        const cyclingMessages = [
          `${baseAction} (${duration})`, // Full instruction
          `${quote}`, // Inspirational quote
          `Progress: 0/${total} steps`, // Progress reminder  
          `Keep breathing: ${phase}` // Breathing integration
        ];
        
        // Cycle through messages every few seconds based on current time
        const cycleIndex = Math.floor(Date.now() / 3000) % cyclingMessages.length;
        const currentMessage = cyclingMessages[cycleIndex];
        
        statusBarItem.text = `${sizeIcon}${phaseIcon} ${currentMessage}`;
        statusBarItem.tooltip = `Stretch: ${activeStretchPreset.preset.title}\nCurrent: ${baseAction}\nBreathing: ${engine.pattern} - ${phase} ${remainingSeconds}s\n\n"${quote}"`;
      } else if (completed < total) {
        const next = activeStretchPreset.preset.steps
          .filter((s, idx) => idx >= completed && s.afterMinutes * 60000 > elapsed)
          .sort((a,b) => a.afterMinutes - b.afterMinutes)[0];
        
        if (next) {
          const minsLeft = Math.max(0, Math.ceil((next.afterMinutes*60000 - elapsed)/60000));
          
          // Cycling messages while waiting for next stretch
          const waitingMessages = [
            `${activeStretchPreset.preset.title} (${completed}/${total})`,
            `Next stretch ~${minsLeft}m`,
            `Keep breathing: ${phase}`,
            `Stay mindful while coding`
          ];
          const cycleIndex = Math.floor(Date.now() / 4000) % waitingMessages.length;
          
          statusBarItem.text = `${sizeIcon}${phaseIcon} ${waitingMessages[cycleIndex]}`;
          statusBarItem.tooltip = `Stretch: ${activeStretchPreset.preset.title}\nProgress: ${completed}/${total} steps\nNext: ~${minsLeft} minutes\n\nBreathing: ${engine.pattern} - ${phase} ${remainingSeconds}s`;
        } else {
          statusBarItem.text = `${sizeIcon}${phaseIcon} Final stretch imminent`;
          statusBarItem.tooltip = `Stretch: ${activeStretchPreset.preset.title}\nProgress: ${completed}/${total} steps\nFinal step coming soon!\n\nBreathing: ${engine.pattern} - ${phase} ${remainingSeconds}s`;
        }
      } else {
        const completedMessages = [
          `${activeStretchPreset.preset.title} complete!`,
          `All ${total} stretches done`,
          `Keep breathing: ${phase}`, 
          `Return to mindful coding`
        ];
        const cycleIndex = Math.floor(Date.now() / 3000) % completedMessages.length;
        
        statusBarItem.text = `${sizeIcon}${phaseIcon} ${completedMessages[cycleIndex]}`;
        statusBarItem.tooltip = `Stretch: ${activeStretchPreset.preset.title}\nCompleted all ${total} steps!\n\nBreathing: ${engine.pattern} - ${phase} ${remainingSeconds}s`;
      }
    } else {
      // Default breathing display when no stretch preset is active
      statusBarItem.text = `${sizeIcon}${phaseIcon} ${phase} ${remainingSeconds}s`;
      statusBarItem.tooltip = `breathMaster (${engine.pattern}) - ${phase} ${remainingSeconds}s\n↑ Inhale | — Hold | ↓ Exhale`;
    }
    
    // Update right-side fun button with pattern name and breathing icon
    if (showBoth) {
      const patternDisplay = engine.pattern.charAt(0).toUpperCase() + engine.pattern.slice(1);
      statusBarItemRight.text = `${sizeIcon}${phaseIcon} ${patternDisplay}`;
      statusBarItemRight.tooltip = `${patternDisplay} breathing • Click to cycle patterns!\nChill → Medium → Active → Boxing → Relaxing`;
    }

    // Track meditation cycle completion for gamification
    if (phase !== lastPhase && phase === "Inhale" && lastPhase === "Exhale") {
      meditationTracker.onBreathingCycleComplete();
      updateGamificationDisplay().catch(console.error);
      
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

    // Simple built-in background highlight (no custom theme colors):
    // Use different backgrounds to signal distinct modes.
    try {
      const activeSession = meditationTracker.getActiveSession();
      if (activeStretchPreset) {
        // Stretch preset active: warning background (usually yellow/orange).
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      } else if (activeSession) {
        // Meditation session active: error background (usually red/pink).
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      } else {
        // Return to theme default.
        statusBarItem.backgroundColor = undefined;
      }
    } catch { /* ignore if theme/color unavailable */ }
  }, tickMs);
  } catch (error) {
    console.error('Failed to start animation due to settings error:', error);
    // Fall back to basic animation with safe defaults
    stopAnimation();
    statusBarItem.text = "$(pulse) breathMaster (settings error)";
    statusBarItem.tooltip = "breathMaster - Settings error, using safe mode";
  }
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

async function updateGamificationDisplay(): Promise<void> {
  if (!statusBarItemGamification) return;
  
  try {
    // Get display settings from modules
    const gamificationSettings = await settings.getAllSettings();
    const showStreak = gamificationSettings.gamification.progression.showStreak;
    const showSessionTimer = await settings.getShowSessionTimer();
    const showXP = gamificationSettings.gamification.progression.showXP;
  
  const gamificationData = meditationTracker.getGamificationDisplay();
  const stats = meditationTracker.getStats();
  const level = meditationTracker.getCurrentLevel();
  const activeSession = meditationTracker.getActiveSession();
  const pledge = (meditationTracker as any).getActivePledge?.();
  
  // Get gamification commitment level
  const commitmentLevel = gamificationSettings.gamification.commitment;
  
  // Create compact level display with configurable styling
  let text = "";
  if (showXP) {
    // Use leaf icon or minimal display based on commitment level
    let levelPrefix = "Lvl:"; // Default for balanced
    if (commitmentLevel === "minimal") {
      levelPrefix = "L";
    } else if (commitmentLevel === "nature") {
      levelPrefix = "🌱";
    }
    text += `${levelPrefix} ${level.level}`;
  }
  
  // Update separate square indicator (separate status bar item)
  if (statusBarItemSquare) {
    if (activeStretchPreset || activeSession || pledge) {
      statusBarItemSquare.text = "⏹";
      statusBarItemSquare.tooltip = "Click to stop active session/stretch";
      statusBarItemSquare.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      statusBarItemSquare.show();
    } else {
      statusBarItemSquare.hide();
    }
  }
  
  // Add control button for main actions (no status indicator here)
  let controlIcon = "";
  if (activeSession) {
    if (activeSession.state === 'running') {
      controlIcon = "⏸"; // Pause button for running session
    } else if (activeSession.state === 'paused') {
      controlIcon = "▶"; // Play button for paused session
    }
  } else {
    controlIcon = "▶"; // Start button when nothing is active
  }
  
  // Combine elements: Level + Control (no separate status indicator)
  const parts = [];
  if (text) parts.push(text);
  if (controlIcon) parts.push(controlIcon);
  
  statusBarItemGamification.text = parts.join(" ");
  
  // Set background color for status indicator
  if (activeStretchPreset) {
    statusBarItemGamification.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else if (activeSession) {
    statusBarItemGamification.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else {
    statusBarItemGamification.backgroundColor = undefined;
  }

  // Build rich Markdown tooltip
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = false;
  md.appendMarkdown('**Breath Master**  \n');
  if (showXP) {
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
  if (pledge) {
    md.appendMarkdown(`Pledge: **${pledge.goalMinutes}m x${pledge.multiplier}**${pledge.cancelled ? ' (cancelled)' : ''}  \n`);
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
  }
  
  // Session status
  if (activeSession) {
    const sessionText = meditationTracker.getSessionStatusBarText();
    md.appendMarkdown(`Session: ${sessionText}  \n`);
    
    // Control instructions
    if (activeSession.state === 'running') {
      md.appendMarkdown(`*Click ${controlIcon} to pause or access controls*  \n`);
    } else if (activeSession.state === 'paused') {
      md.appendMarkdown(`*Click ${controlIcon} to resume or access controls*  \n`);
    }
  } else if (activeStretchPreset) {
    md.appendMarkdown(`*Click ${controlIcon} to stop stretch preset*  \n`);
  } else {
    md.appendMarkdown(`*Click ${controlIcon} to start session or stretch*  \n`);
  }
  
  statusBarItemGamification.tooltip = md;
  } catch (error) {
    console.error('Failed to update gamification display due to settings error:', error);
    // Fall back to simple display
    statusBarItemGamification.text = "⚠ Settings Error";
    statusBarItemGamification.tooltip = "breathMaster - Settings error, click to try again";
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

async function restartAnimation(): Promise<void> {
  // Update engine pattern if it changed
  const newPattern = await settings.getBreathingPattern() as Pattern;
  const customPatternArray = await settings.getCustomPattern();
  const customPattern = `${customPatternArray[0]}-${customPatternArray[1]}-${customPatternArray[2]}-${customPatternArray[3]}`;
  
  if (newPattern !== engine.pattern) {
    engine.setPattern(newPattern, customPattern);
  }
  
  stopAnimation();
  await startAnimation();
}

// --- Gentle Reminders (Eon) -------------------------------------------------
let gentleReminderTimer: NodeJS.Timeout | undefined;
async function scheduleGentleReminders() {
  if (gentleReminderTimer) { clearInterval(gentleReminderTimer); gentleReminderTimer = undefined; }
  // Get reminder settings from DisplayModule
  const cadence = await settings.getGentleReminderCadence();
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
  const isEnabled = await settings.getBreathingEnabled();
  const newState = !isEnabled;

  await settings.setBreathingEnabled(newState);

  if (newState) {
    // Start breathing if enabled
    await startAnimation();
    vscode.window.showInformationMessage("🌊 Breathing session started");
  } else {
    // Stop breathing if disabled
    stopAnimation();
    vscode.window.showInformationMessage("⏸️ Breathing session paused");
  }
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

  await settings.setBreathingPattern(nextPattern);

  // Reinitialize engine with new pattern
  await initializeEngine();

  // Restart animation if it's currently running
  const isEnabled = await settings.getBreathingEnabled();
  if (isEnabled && animationTimer) {
    await restartAnimation();
  }

  vscode.window.showInformationMessage(
    `🫁 ${patternNames[nextPattern]}`
  );
}


// All command functions have been refactored to src/commands/


export function deactivate(): void {
  if (meditationTracker && (meditationTracker as any).isHovering) {
    meditationTracker.stopHovering();
  }
  if (microMeditationBar) {
    microMeditationBar.dispose();
  }
  stopAnimation();
}
