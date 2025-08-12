/**
 * tutorial-service.ts
 * Game-like tutorial system with webview integration
 */

import * as vscode from 'vscode';
import { OnboardingManager } from './onboarding';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  eonWisdom?: string;
  action?: string;
  type: 'welcome' | 'practice' | 'choice' | 'philosophy' | 'license' | 'ethics' | 'start-screen';
  interactionRequired?: boolean;
  imagePrompt?: string;
}

export class TutorialService {
  private webviewPanel: vscode.WebviewPanel | undefined;
  private currentStepIndex = 0;
  private steps: TutorialStep[] = [];

  constructor(
    private onboardingManager: OnboardingManager,
    private extensionUri: vscode.Uri
  ) {}

  async startTutorial(): Promise<void> {
    this.steps = this.onboardingManager.getTutorialSteps();
    this.currentStepIndex = 0;
    
    this.onboardingManager.startTutorial();
    
    this.webviewPanel = vscode.window.createWebviewPanel(
      'breathMasterTutorial',
      '🏰 Cathedral of Code - Journey with Eon',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.extensionUri]
      }
    );

    this.webviewPanel.iconPath = {
      light: vscode.Uri.joinPath(this.extensionUri, 'resources', 'tree-light.svg'),
      dark: vscode.Uri.joinPath(this.extensionUri, 'resources', 'tree-dark.svg')
    };

    this.setupWebviewContent();
    this.setupMessageHandling();

    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });

    this.showCurrentStep();
  }

  private setupWebviewContent(): void {
    if (!this.webviewPanel) return;

    const styleUri = this.webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'resources', 'tutorial.css')
    );
    
    const scriptUri = this.webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'resources', 'tutorial.js')
    );

    this.webviewPanel.webview.html = this.getWebviewContent(styleUri, scriptUri);
  }

  private getWebviewContent(styleUri: vscode.Uri, scriptUri: vscode.Uri): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cathedral of Code</title>
        <link rel="stylesheet" href="${styleUri}">
        <style>
          /* VS Code Theme Integration */
          :root {
            --bg-primary: var(--vscode-editor-background, #1e1e1e);
            --bg-secondary: var(--vscode-panel-background, #252526);
            --bg-accent: var(--vscode-input-background, #3c3c3c);
            --text-primary: var(--vscode-foreground, #cccccc);
            --text-secondary: var(--vscode-descriptionForeground, #999999);
            --text-muted: var(--vscode-disabledForeground, #656565);
            --accent: var(--vscode-button-background, #0e639c);
            --accent-hover: var(--vscode-button-hoverBackground, #1177bb);
            --accent-text: var(--vscode-button-foreground, #ffffff);
            --border: var(--vscode-panel-border, #2b2b2b);
            --focus-border: var(--vscode-focusBorder, #007acc);
            --danger: var(--vscode-errorForeground, #f85149);
            --success: var(--vscode-terminal-ansiGreen, #3fb950);
            
            /* Typography Scale */
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            --font-size-xs: 0.75rem;
            --font-size-sm: 0.875rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.125rem;
            --font-size-xl: 1.25rem;
            --font-size-2xl: 1.5rem;
            --font-size-3xl: 1.875rem;
            
            /* Spacing Scale */
            --space-xs: 0.25rem;
            --space-sm: 0.5rem;
            --space-base: 1rem;
            --space-lg: 1.5rem;
            --space-xl: 2rem;
            --space-2xl: 3rem;
          }

          body {
            margin: 0;
            padding: 0;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: var(--font-family);
            font-size: var(--font-size-base);
            line-height: 1.5;
            overflow-y: auto;
            overflow-x: hidden;
          }
          
          .cathedral-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .step-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: var(--space-xl);
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInUp 0.4s ease-out forwards;
            overflow-y: auto;
          }

          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Progress Bar */
          .progress-bar {
            height: 2px;
            background: var(--bg-secondary);
            position: relative;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            background: var(--accent);
            transition: width 0.3s ease;
            width: 0%;
          }

          /* Navigation */
          .navigation-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-base) var(--space-xl);
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
          }

          .nav-btn {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-base);
            background: var(--accent);
            color: var(--accent-text);
            border: none;
            border-radius: 3px;
            font-family: var(--font-family);
            font-size: var(--font-size-sm);
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .nav-btn:hover:not(:disabled) {
            background: var(--accent-hover);
          }

          .nav-btn:disabled {
            background: var(--bg-accent);
            color: var(--text-muted);
            cursor: not-allowed;
          }

          .nav-btn:focus-visible {
            outline: 1px solid var(--focus-border);
            outline-offset: 2px;
          }

          .step-indicator {
            color: var(--text-secondary);
            font-size: var(--font-size-sm);
          }

          /* Start Screen Styles */
          .game-start-screen {
            text-align: center;
            max-width: 700px;
            width: 100%;
          }
          
          .logo-image-placeholder {
            width: 100%;
            max-width: 280px;
            height: 160px;
            background: var(--bg-secondary);
            border: 2px dashed var(--border);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--space-xl);
            position: relative;
          }
          
          .image-prompt-display {
            padding: var(--space-base);
            text-align: left;
            max-width: 100%;
          }
          
          .prompt-label {
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: var(--space-sm);
            font-size: var(--font-size-xs);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .prompt-text {
            font-style: italic;
            color: var(--text-primary);
            font-size: var(--font-size-xs);
            line-height: 1.4;
            opacity: 0.8;
          }
          
          .game-title {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-sm);
            letter-spacing: -0.025em;
          }
          
          .game-subtitle {
            font-size: var(--font-size-lg);
            color: var(--text-secondary);
            margin-bottom: var(--space-2xl);
            font-weight: 400;
          }
          
          .adventure-invitation {
            background: var(--bg-secondary);
            padding: var(--space-xl);
            border-radius: 4px;
            margin-bottom: var(--space-xl);
            border: 1px solid var(--border);
            text-align: left;
          }
          
          .adventure-invitation h3 {
            margin: 0 0 var(--space-base) 0;
            font-size: var(--font-size-xl);
            color: var(--text-primary);
            font-weight: 600;
          }
          
          .adventure-invitation > p {
            margin: 0 0 var(--space-lg) 0;
            color: var(--text-secondary);
            line-height: 1.6;
          }
          
          .journey-preview {
            margin: var(--space-lg) 0;
          }
          
          .journey-preview h4 {
            margin: 0 0 var(--space-base) 0;
            font-size: var(--font-size-lg);
            color: var(--text-primary);
            font-weight: 600;
          }
          
          .journey-preview ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .journey-preview li {
            padding: var(--space-xs) 0;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
          }
          
          .commitment-box {
            background: var(--bg-accent);
            padding: var(--space-lg);
            border-radius: 4px;
            border-left: 3px solid var(--accent);
            margin-top: var(--space-lg);
          }
          
          .commitment-text {
            margin: 0;
            color: var(--text-primary);
            line-height: 1.6;
          }
          
          .commitment-text strong {
            color: var(--text-primary);
            font-weight: 600;
          }
          
          .start-actions {
            display: flex;
            gap: var(--space-base);
            justify-content: center;
            margin-top: var(--space-2xl);
          }
          
          .accept-btn, .decline-btn {
            padding: var(--space-base) var(--space-xl);
            border: none;
            border-radius: 3px;
            font-size: var(--font-size-base);
            font-weight: 500;
            font-family: var(--font-family);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--space-sm);
          }
          
          .accept-btn {
            background: var(--accent);
            color: var(--accent-text);
            order: 2;
          }
          
          .accept-btn:hover {
            background: var(--accent-hover);
          }
          
          .accept-btn:focus-visible {
            outline: 1px solid var(--focus-border);
            outline-offset: 2px;
          }
          
          .decline-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border);
            order: 1;
          }
          
          .decline-btn:hover {
            background: var(--bg-accent);
            color: var(--text-primary);
          }
          
          .decline-btn:focus-visible {
            outline: 1px solid var(--focus-border);
            outline-offset: 2px;
          }

          /* Accessibility */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          .step-title {
            outline: none;
          }

          .step-title:focus {
            outline: 2px solid var(--focus-border);
            outline-offset: 2px;
          }

          /* Loading state */
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-base);
            color: var(--text-secondary);
          }

          .tree-loading {
            font-size: var(--font-size-2xl);
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          /* Interaction indicator */
          .interaction-indicator {
            margin-top: var(--space-lg);
            padding: var(--space-sm) var(--space-base);
            background: var(--bg-accent);
            border-radius: 4px;
            border-left: 3px solid var(--accent);
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            text-align: center;
          }

          /* Eon panel */
          .eon-panel {
            position: fixed;
            bottom: var(--space-xl);
            left: var(--space-xl);
            right: var(--space-xl);
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: var(--space-base);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            z-index: 1000;
          }

          .eon-panel.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .eon-avatar {
            display: inline-block;
            margin-right: var(--space-sm);
            font-size: var(--font-size-lg);
          }

          .eon-message {
            display: inline;
            color: var(--text-primary);
            font-style: italic;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="cathedral-container">
          <!-- Progress indicator -->
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>

          <!-- Main content area -->
          <div class="step-container" id="stepContainer">
            <div class="loading-state">
              <div class="tree-loading">🌳</div>
              <p>The Cathedral awakens...</p>
            </div>
          </div>

          <!-- Navigation -->
          <div class="navigation-bar">
            <button id="backBtn" class="nav-btn nav-btn-back" disabled>
              <span class="btn-icon">←</span>
              <span class="btn-text">Previous</span>
            </button>
            
            <div class="step-indicator">
              <span id="stepCounter">1 of ${this.steps.length}</span>
            </div>
            
            <button id="nextBtn" class="nav-btn nav-btn-next">
              <span class="btn-text">Begin</span>
              <span class="btn-icon">→</span>
            </button>
          </div>

          <!-- Eon's wisdom panel -->
          <div class="eon-panel" id="eonPanel">
            <div class="eon-avatar">🌳</div>
            <div class="eon-message" id="eonMessage"></div>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          
          // Initialize state
          let currentStep = 0;
          let totalSteps = ${this.steps.length};
          
          // Message handling
          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
              case 'showStep':
                showStep(message.step, message.stepIndex);
                break;
              case 'updateProgress':
                updateProgress(message.progress);
                break;
            }
          });
          
          // Navigation handlers
          document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'previousStep' });
          });
          
          document.getElementById('nextBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'nextStep' });
          });
          
          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            // Escape to close tutorial
            if (e.key === 'Escape') {
              e.preventDefault();
              if (currentStep === 0) {
                // On start screen, treat escape as decline
                vscode.postMessage({ command: 'startScreenChoice', choice: 'decline' });
              } else {
                // On other screens, show confirmation
                const shouldClose = confirm('Exit the tutorial? Your progress will be saved.');
                if (shouldClose) {
                  vscode.postMessage({ command: 'closeTutorial' });
                }
              }
              return;
            }
            
            // Arrow keys for navigation (when not in start screen)
            if (currentStep > 0) {
              if (e.key === 'ArrowLeft' && !document.getElementById('backBtn').disabled) {
                e.preventDefault();
                vscode.postMessage({ command: 'previousStep' });
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                vscode.postMessage({ command: 'nextStep' });
              }
            }
            
            // Enter key handling
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
              // If focused element is a button, let it handle the click
              if (document.activeElement?.tagName === 'BUTTON') {
                return;
              }
              
              // Otherwise, advance to next step
              if (currentStep === 0) {
                // On start screen, default to accept
                vscode.postMessage({ command: 'startScreenChoice', choice: 'accept' });
              } else {
                e.preventDefault();
                vscode.postMessage({ command: 'nextStep' });
              }
            }
          });
          
          // Utility functions
          function showStep(step, stepIndex) {
            currentStep = stepIndex;
            updateStepCounter();
            updateNavigationButtons();
            renderStepContent(step);
            updateProgress((stepIndex + 1) / totalSteps);
            
            if (step.eonWisdom) {
              showEonWisdom(step.eonWisdom);
            }
          }
          
          function updateStepCounter() {
            document.getElementById('stepCounter').textContent = \`\${currentStep + 1} of \${totalSteps}\`;
          }
          
          function updateNavigationButtons() {
            const backBtn = document.getElementById('backBtn');
            const nextBtn = document.getElementById('nextBtn');
            const navigationBar = document.querySelector('.navigation-bar');
            
            // Hide navigation for start screen - users must use custom buttons
            if (currentStep === 0) {
              navigationBar.style.display = 'none';
              return;
            } else {
              navigationBar.style.display = 'flex';
            }
            
            backBtn.disabled = currentStep === 0;
            
            if (currentStep === totalSteps - 1) {
              nextBtn.innerHTML = '<span class="btn-text">Enter Cathedral</span><span class="btn-icon">✨</span>';
            } else {
              nextBtn.innerHTML = '<span class="btn-text">Continue</span><span class="btn-icon">→</span>';
            }
          }
          
          function updateProgress(progress) {
            const progressFill = document.getElementById('progressFill');
            progressFill.style.width = \`\${progress * 100}%\`;
          }
          
          function showEonWisdom(wisdom) {
            const eonPanel = document.getElementById('eonPanel');
            const eonMessage = document.getElementById('eonMessage');
            
            eonMessage.textContent = wisdom;
            eonPanel.classList.add('active');
            
            setTimeout(() => {
              eonPanel.classList.remove('active');
            }, 6000);
          }
          
          function renderStepContent(step) {
            const container = document.getElementById('stepContainer');
            
            container.innerHTML = \`
              <div class="step-content step-\${step.type}" role="main" aria-labelledby="step-title">
                <div class="step-header">
                  <h1 class="step-title" id="step-title">\${step.title}</h1>
                </div>
                
                <div class="step-body">
                  <div class="step-main-content">
                    \${step.content}
                  </div>
                </div>
                
                \${step.interactionRequired ? '<div class="interaction-indicator" role="status" aria-live="polite">Interactive step - your input required</div>' : ''}
              </div>
            \`;
            
            // Focus management - announce new step to screen readers
            const stepTitle = document.getElementById('step-title');
            if (stepTitle) {
              stepTitle.focus();
              // Also announce via live region
              const announcement = document.createElement('div');
              announcement.setAttribute('aria-live', 'polite');
              announcement.setAttribute('aria-atomic', 'true');
              announcement.className = 'sr-only';
              announcement.textContent = \`Step \${currentStep + 1} of \${totalSteps}: \${step.title}\`;
              document.body.appendChild(announcement);
              
              // Remove announcement after it's read
              setTimeout(() => {
                if (announcement.parentNode) {
                  announcement.parentNode.removeChild(announcement);
                }
              }, 1000);
            }
            
            // Add event listeners for step-specific interactions
            setupStepInteractions(step);
          }
          
          function setupStepInteractions(step) {
            // Handle start screen accept/decline buttons
            const startButtons = document.querySelectorAll('.start-actions button');
            startButtons.forEach(btn => {
              btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                vscode.postMessage({ command: 'startScreenChoice', choice });
              });
            });
            
            // Handle ethics link
            const ethicsLink = document.querySelector('.ethics-link');
            if (ethicsLink) {
              ethicsLink.addEventListener('click', (e) => {
                e.preventDefault();
                vscode.postMessage({ command: 'openEthics' });
              });
            }
            
            // Handle choice buttons in growth chamber
            const choiceBtns = document.querySelectorAll('.choice-btn');
            choiceBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                vscode.postMessage({ command: 'makeChoice', choice });
              });
            });
          }
          
          // Initialize
          vscode.postMessage({ command: 'tutorialReady' });
        </script>
      </body>
      </html>
    `;
  }

  private setupMessageHandling(): void {
    if (!this.webviewPanel) return;

    this.webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'tutorialReady':
          this.showCurrentStep();
          break;
          
        case 'nextStep':
          await this.nextStep();
          break;
          
        case 'previousStep':
          this.previousStep();
          break;
          
        case 'openEthics':
          await this.openEthicsDocument();
          break;
          
        case 'makeChoice':
          await this.handleChoice(message.choice);
          break;
          
        case 'startScreenChoice':
          await this.handleStartScreenChoice(message.choice);
          break;
          
        case 'closeTutorial':
          this.webviewPanel?.dispose();
          this.webviewPanel = undefined;
          break;
      }
    });
  }

  private showCurrentStep(): void {
    if (!this.webviewPanel || this.currentStepIndex >= this.steps.length) return;

    const step = this.steps[this.currentStepIndex];
    this.webviewPanel.webview.postMessage({
      command: 'showStep',
      step: step,
      stepIndex: this.currentStepIndex
    });
  }

  private async nextStep(): Promise<void> {
    if (this.currentStepIndex >= this.steps.length - 1) {
      await this.completeTutorial();
      return;
    }

    const currentStep = this.steps[this.currentStepIndex];
    this.onboardingManager.advanceTutorialStep(currentStep.id);

    this.currentStepIndex++;
    this.showCurrentStep();
  }

  private previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    }
  }

  private async openEthicsDocument(): Promise<void> {
    // Open the 12 principles document
    try {
      const ethicsUri = vscode.Uri.joinPath(this.extensionUri, '12-PRINCIPLES-ANALYSIS.md');
      await vscode.window.showTextDocument(ethicsUri);
    } catch (error) {
      vscode.window.showInformationMessage('Ethics document: 12-PRINCIPLES-ANALYSIS.md in extension folder');
    }
  }

  private async handleStartScreenChoice(choice: string): Promise<void> {
    if (choice === 'accept') {
      // User chose to enter the cathedral
      await this.nextStep();
    } else {
      // User declined - close tutorial and mark as seen to avoid re-prompting
      this.onboardingManager.markTourCompleted(false);
      vscode.window.showInformationMessage('✨ The Cathedral will await your return. You can restart the journey anytime from the Command Palette.');
      this.webviewPanel?.dispose();
      this.webviewPanel = undefined;
    }
  }

  private async handleChoice(choice: string): Promise<void> {
    const gamificationEnabled = choice === 'tracked';
    
    // Update VS Code configuration
    const config = vscode.workspace.getConfiguration('breathMaster');
    await config.update('enableGamification', gamificationEnabled, vscode.ConfigurationTarget.Global);
    
    // Show confirmation
    const message = gamificationEnabled 
      ? '🌳 The Tracked Path chosen - your growth journey begins!'
      : '🍃 The Simple Path chosen - pure mindful coding awaits!';
    
    vscode.window.showInformationMessage(message);
    
    // Advance to next step
    await this.nextStep();
  }

  private async completeTutorial(): Promise<void> {
    const config = vscode.workspace.getConfiguration('breathMaster');
    const gamificationEnabled = config.get<boolean>('enableGamification', false);
    
    this.onboardingManager.completeTutorial(gamificationEnabled);
    
    vscode.window.showInformationMessage(
      '✨ Welcome to the Cathedral of Code! Your mindful coding journey begins now.'
    );
    
    this.webviewPanel?.dispose();
    this.webviewPanel = undefined;
  }
}