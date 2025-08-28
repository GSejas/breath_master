(function() {
  const vscode = acquireVsCodeApi();
  let currentData = null;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    vscode.postMessage({ type: 'getInitialData' });
    setupEventListeners();
  });

  function setupEventListeners() {
    // Experience level selector
    const userLevelSelect = document.getElementById('userLevel');
    userLevelSelect.addEventListener('change', function() {
      vscode.postMessage({ 
        type: 'setUserLevel', 
        level: this.value 
      });
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'exportSettings' });
    });

    // Reset all button
    document.getElementById('resetAllBtn').addEventListener('click', function() {
      if (confirm('This will reset all settings to their defaults. Are you sure?')) {
        vscode.postMessage({ type: 'resetAll' });
      }
    });
  }

  // Message handler
  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
      case 'initialData':
        currentData = message.data;
        updateUI();
        break;
      case 'refreshUI':
        vscode.postMessage({ type: 'getInitialData' });
        break;
    }
  });

  function updateUI() {
    if (!currentData) return;

    // Update user level selector
    document.getElementById('userLevel').value = currentData.userLevel;

    // Show/hide loading
    document.querySelector('.loading').style.display = 'none';
    document.querySelector('.settings-categories').style.display = 'block';

    // Clear existing modules
    document.querySelectorAll('.category .modules').forEach(container => {
      container.innerHTML = '';
    });

    // Group modules by category
    const modulesByCategory = {};
    currentData.modules.forEach(module => {
      if (!modulesByCategory[module.category]) {
        modulesByCategory[module.category] = [];
      }
      modulesByCategory[module.category].push(module);
    });

    // Render modules
    for (const [category, modules] of Object.entries(modulesByCategory)) {
      const categoryElement = document.querySelector(`.category[data-category="${category}"] .modules`);
      if (!categoryElement) continue;

      modules.forEach(module => {
        const moduleElement = createModuleElement(module, currentData.settings[module.id]);
        categoryElement.appendChild(moduleElement);
      });
    }

    // Hide empty categories
    document.querySelectorAll('.category').forEach(category => {
      const modulesContainer = category.querySelector('.modules');
      const hasModules = modulesContainer.children.length > 0;
      category.style.display = hasModules ? 'block' : 'none';
    });
  }

  function createModuleElement(module, settings) {
    const div = document.createElement('div');
    div.className = 'module';
    
    div.innerHTML = `
      <div class="module-header">
        <div>
          <h4 class="module-title">${module.displayName}</h4>
          ${module.description ? `<p class="module-description">${module.description}</p>` : ''}
        </div>
        <div class="module-actions">
          <span class="experience-badge ${module.experienceLevel}">${module.experienceLevel}</span>
          <button onclick="resetModule('${module.id}')">Reset</button>
        </div>
      </div>
      <div class="module-settings">
        ${generateSettingsHTML(module.id, settings)}
      </div>
    `;

    return div;
  }

  function generateSettingsHTML(moduleId, settings) {
    switch (moduleId) {
      case 'breathing':
        return generateBreathingSettingsHTML(settings);
      case 'animation':
        return generateAnimationSettingsHTML(settings);
      case 'gamification':
        return generateGamificationSettingsHTML(settings);
      default:
        return '<p>Settings for this module are not yet implemented.</p>';
    }
  }

  function generateBreathingSettingsHTML(settings) {
    const patterns = ['chill', 'medium', 'active', 'boxing', 'relaxing', 'custom'];
    
    return `
      <div class="setting-group">
        <label class="setting-label">Breathing Pattern</label>
        <select class="setting-input" onchange="updateSetting('breathing', 'pattern', this.value)">
          ${patterns.map(pattern => 
            `<option value="${pattern}" ${settings.pattern === pattern ? 'selected' : ''}>${pattern}</option>`
          ).join('')}
        </select>
        <div class="setting-help">Choose a breathing pattern that feels comfortable for you</div>
      </div>

      <div class="setting-group" ${settings.pattern !== 'custom' ? 'style="display: none;"' : ''}>
        <label class="setting-label">Custom Pattern (Inhale-Hold-Exhale-Hold)</label>
        <input type="text" class="setting-input" 
               value="${settings.customPattern.join('-')}"
               onchange="updateCustomPattern(this.value)"
               placeholder="4-4-4-4">
        <div class="setting-help">Format: inhale-hold1-exhale-hold2 (in seconds)</div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Default Session Duration (minutes)</label>
        <input type="number" class="setting-input" min="1" max="120"
               value="${settings.sessionDuration}"
               onchange="updateSetting('breathing', 'sessionDuration', parseInt(this.value))">
      </div>

      <div class="setting-group">
        <div class="setting-checkbox">
          <input type="checkbox" id="autoStart" 
                 ${settings.autoStart ? 'checked' : ''}
                 onchange="updateSetting('breathing', 'autoStart', this.checked)">
          <label for="autoStart">Auto-start sessions when extension activates</label>
        </div>
      </div>

      <div class="setting-group">
        <div class="setting-checkbox">
          <input type="checkbox" id="remindersEnabled" 
                 ${settings.reminders.enabled ? 'checked' : ''}
                 onchange="updateNestedSetting('breathing', 'reminders', 'enabled', this.checked)">
          <label for="remindersEnabled">Enable breathing reminders</label>
        </div>
      </div>

      <div class="setting-group" ${!settings.reminders.enabled ? 'style="display: none;"' : ''}>
        <label class="setting-label">Reminder Frequency (hours)</label>
        <input type="number" class="setting-input" min="1" max="24"
               value="${settings.reminders.frequency}"
               onchange="updateNestedSetting('breathing', 'reminders', 'frequency', parseInt(this.value))">
      </div>
    `;
  }

  function generateAnimationSettingsHTML(settings) {
    const presets = ['default', 'minimal', 'nature', 'custom'];
    
    return `
      <div class="setting-group">
        <label class="setting-label">Animation Preset</label>
        <select class="setting-input" onchange="updateSetting('animation', 'preset', this.value)">
          ${presets.map(preset => 
            `<option value="${preset}" ${settings.preset === preset ? 'selected' : ''}>${preset}</option>`
          ).join('')}
        </select>
        <div class="animation-preview">
          <div class="animation-phase">
            <div class="animation-phase-label">Inhale</div>
            <div class="animation-phase-icons">${settings.figures.inhale.join(' ')}</div>
          </div>
          <div class="animation-phase">
            <div class="animation-phase-label">Hold</div>
            <div class="animation-phase-icons">${settings.figures.hold1.join(' ')}</div>
          </div>
          <div class="animation-phase">
            <div class="animation-phase-label">Exhale</div>
            <div class="animation-phase-icons">${settings.figures.exhale.join(' ')}</div>
          </div>
          <div class="animation-phase">
            <div class="animation-phase-label">Rest</div>
            <div class="animation-phase-icons">${settings.figures.hold2.join(' ')}</div>
          </div>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Animation Intensity: ${Math.round(settings.intensity * 100)}%</label>
        <input type="range" class="setting-input" min="0" max="1" step="0.1"
               value="${settings.intensity}"
               onchange="updateSetting('animation', 'intensity', parseFloat(this.value))">
        <div class="setting-help">Controls how dramatic the size changes are</div>
      </div>

      <div class="setting-group">
        <div class="setting-checkbox">
          <input type="checkbox" id="smoothingEnabled" 
                 ${settings.smoothing.enabled ? 'checked' : ''}
                 onchange="updateNestedSetting('animation', 'smoothing', 'enabled', this.checked)">
          <label for="smoothingEnabled">Enable smooth transitions</label>
        </div>
      </div>

      <div class="setting-group" ${!settings.smoothing.enabled ? 'style="display: none;"' : ''}>
        <label class="setting-label">Smoothing Factor: ${Math.round(settings.smoothing.factor * 100)}%</label>
        <input type="range" class="setting-input" min="0" max="1" step="0.1"
               value="${settings.smoothing.factor}"
               onchange="updateNestedSetting('animation', 'smoothing', 'factor', parseFloat(this.value))">
      </div>
    `;
  }

  function generateGamificationSettingsHTML(settings) {
    return `
      <div class="setting-group">
        <div class="setting-checkbox">
          <input type="checkbox" id="gamificationEnabled" 
                 ${settings.enabled ? 'checked' : ''}
                 onchange="updateSetting('gamification', 'enabled', this.checked)">
          <label for="gamificationEnabled">Enable meditation tracking</label>
        </div>
        <div class="setting-help">Track your progress with XP, levels, and achievements</div>
      </div>

      <div class="setting-group" ${!settings.enabled ? 'style="display: none;"' : ''}>
        <label class="setting-label">Commitment Level</label>
        <select class="setting-input" onchange="updateSetting('gamification', 'commitment', this.value)">
          <option value="minimal" ${settings.commitment === 'minimal' ? 'selected' : ''}>Minimal - Simple level display</option>
          <option value="balanced" ${settings.commitment === 'balanced' ? 'selected' : ''}>Balanced - Level with context</option>
          <option value="nature" ${settings.commitment === 'nature' ? 'selected' : ''}>Nature - Themed with emojis</option>
        </select>
      </div>

      <div class="setting-group" ${!settings.enabled ? 'style="display: none;"' : ''}>
        <div class="setting-checkbox">
          <input type="checkbox" id="challengesEnabled" 
                 ${settings.challenges.enabled ? 'checked' : ''}
                 onchange="updateNestedSetting('gamification', 'challenges', 'enabled', this.checked)">
          <label for="challengesEnabled">Enable daily challenges</label>
        </div>
      </div>

      <div class="setting-group" ${!settings.enabled ? 'style="display: none;"' : ''}>
        <div class="setting-checkbox">
          <input type="checkbox" id="showLevel" 
                 ${settings.progression.showLevel ? 'checked' : ''}
                 onchange="updateNestedSetting('gamification', 'progression', 'showLevel', this.checked)">
          <label for="showLevel">Show level in status bar</label>
        </div>
      </div>

      <div class="setting-group" ${!settings.enabled ? 'style="display: none;"' : ''}>
        <div class="setting-checkbox">
          <input type="checkbox" id="showStreak" 
                 ${settings.progression.showStreak ? 'checked' : ''}
                 onchange="updateNestedSetting('gamification', 'progression', 'showStreak', this.checked)">
          <label for="showStreak">Show streak information</label>
        </div>
      </div>
    `;
  }

  // Global functions for event handlers
  window.updateSetting = function(moduleId, key, value) {
    if (!currentData) return;
    
    const settings = { ...currentData.settings[moduleId] };
    settings[key] = value;
    currentData.settings[moduleId] = settings;
    
    vscode.postMessage({
      type: 'setSetting',
      moduleId: moduleId,
      value: settings
    });
  };

  window.updateNestedSetting = function(moduleId, parentKey, childKey, value) {
    if (!currentData) return;
    
    const settings = { ...currentData.settings[moduleId] };
    settings[parentKey] = { ...settings[parentKey] };
    settings[parentKey][childKey] = value;
    currentData.settings[moduleId] = settings;
    
    vscode.postMessage({
      type: 'setSetting',
      moduleId: moduleId,
      value: settings
    });
  };

  window.updateCustomPattern = function(value) {
    const parts = value.split('-').map(n => parseInt(n, 10));
    if (parts.length === 4 && parts.every(n => !isNaN(n) && n >= 0 && n <= 30)) {
      updateSetting('breathing', 'customPattern', parts);
    }
  };

  window.resetModule = function(moduleId) {
    if (confirm(`Reset all settings for ${moduleId} to defaults?`)) {
      vscode.postMessage({
        type: 'resetModule',
        moduleId: moduleId
      });
    }
  };
})();