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
  type: 'welcome' | 'practice' | 'choice' | 'philosophy' | 'license' | 'ethics';
  interactionRequired?: boolean;
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
          /* Inline critical styles for immediate render */
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a2a1a 0%, #2d3d1f 50%, #1a2a1a 100%);
            color: #e8f5e8;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
          }
          
          .cathedral-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .step-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
              <div class="step-content step-\${step.type}">
                <div class="step-header">
                  <h1 class="step-title">\${step.title}</h1>
                </div>
                
                <div class="step-body">
                  <div class="step-main-content">
                    \${step.content}
                  </div>
                </div>
                
                \${step.interactionRequired ? '<div class="interaction-indicator">🎮 Interaction Required</div>' : ''}
              </div>
            \`;
            
            // Add event listeners for step-specific interactions
            setupStepInteractions(step);
          }
          
          function setupStepInteractions(step) {
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