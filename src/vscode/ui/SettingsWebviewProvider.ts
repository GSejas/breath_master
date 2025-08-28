import * as vscode from 'vscode';
import { ModernSettingsManager } from '../../engine/settings/ModernSettingsManager';
import { ExperienceLevel, SettingsCategory } from '../../engine/settings/types';

export class SettingsWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'breathMaster.settingsPanel';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly settingsManager: ModernSettingsManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.context.extensionUri
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'setUserLevel':
          await this.settingsManager.setUserLevel(data.level);
          webviewView.webview.postMessage({ type: 'refreshUI' });
          break;
        case 'setSetting':
          await this.settingsManager.set(data.moduleId, data.value);
          break;
        case 'resetModule':
          await this.settingsManager.reset(data.moduleId);
          webviewView.webview.postMessage({ type: 'refreshUI' });
          break;
        case 'exportSettings':
          const exported = await this.settingsManager.exportSettings();
          vscode.env.clipboard.writeText(exported);
          vscode.window.showInformationMessage('Settings copied to clipboard');
          break;
        case 'getInitialData':
          await this.sendInitialData(webviewView.webview);
          break;
      }
    });
  }

  private async sendInitialData(webview: vscode.Webview) {
    const userLevel = await this.settingsManager.getUserLevel();
    const modules = this.settingsManager.getModulesByLevel(userLevel);
    
    const moduleData: Record<string, any> = {};
    for (const module of modules) {
      moduleData[module.id] = await this.settingsManager.get(module.id);
    }

    webview.postMessage({
      type: 'initialData',
      data: {
        userLevel,
        modules: modules.map(m => ({
          id: m.id,
          displayName: m.displayName,
          description: m.description,
          category: m.category,
          experienceLevel: m.experienceLevel
        })),
        settings: moduleData
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'settings.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'settings.js'));

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Breath Master Settings</title>
			</head>
			<body>
				<div id="app">
					<div class="settings-header">
						<h2>Breath Master Settings</h2>
						<div class="experience-level-selector">
							<label for="userLevel">Experience Level:</label>
							<select id="userLevel">
								<option value="basic">Basic - Essential settings only</option>
								<option value="intermediate">Intermediate - Common customizations</option>
								<option value="advanced">Advanced - All options</option>
							</select>
						</div>
					</div>

					<div class="settings-content">
						<div class="loading">Loading settings...</div>
						<div class="settings-categories" style="display: none;">
							<div class="category" data-category="breathing">
								<h3>🫁 Breathing</h3>
								<div class="modules"></div>
							</div>
							<div class="category" data-category="animation">
								<h3>🎨 Animation</h3>
								<div class="modules"></div>
							</div>
							<div class="category" data-category="gamification">
								<h3>🎯 Progress</h3>
								<div class="modules"></div>
							</div>
							<div class="category" data-category="interface">
								<h3>🖼️ Interface</h3>
								<div class="modules"></div>
							</div>
							<div class="category" data-category="privacy">
								<h3>🔒 Privacy</h3>
								<div class="modules"></div>
							</div>
							<div class="category" data-category="advanced">
								<h3>⚙️ Advanced</h3>
								<div class="modules"></div>
							</div>
						</div>
					</div>

					<div class="settings-actions">
						<button id="exportBtn" class="secondary">Export Settings</button>
						<button id="resetAllBtn" class="danger">Reset All</button>
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}