import * as assert from 'assert';
import * as vscode from 'vscode';

suite('BreatheGlow Extension Integration Tests', () => {
  let extension: vscode.Extension<any> | undefined;

  suiteSetup(async () => {
    // Get the extension
    extension = vscode.extensions.getExtension('your-name.breathe-glow');
    assert.ok(extension, 'Extension should be present');

    // Activate the extension
    await extension.activate();
    assert.ok(extension.isActive, 'Extension should be active');
  });

  test('Extension should be activated', () => {
    assert.ok(extension);
    assert.ok(extension.isActive);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    
    assert.ok(
      commands.includes('breatheGlow.toggle'),
      'breatheGlow.toggle command should be registered'
    );
    
    assert.ok(
      commands.includes('breatheGlow.cyclePattern'),
      'breatheGlow.cyclePattern command should be registered'
    );
  });

  test('Configuration should have default values', () => {
    const config = vscode.workspace.getConfiguration('breatheGlow');
    
    assert.strictEqual(config.get('enabled'), true, 'Default enabled should be true');
    assert.strictEqual(config.get('pattern'), 'chill', 'Default pattern should be chill');
    assert.strictEqual(config.get('intensity'), 0.6, 'Default intensity should be 0.6');
    assert.strictEqual(config.get('tickMs'), 100, 'Default tickMs should be 100');
    assert.strictEqual(config.get('showBoth'), true, 'Default showBoth should be true');
    assert.strictEqual(config.get('showNotifications'), false, 'Default showNotifications should be false');
  });

  test('Toggle command should execute without error', async () => {
    try {
      await vscode.commands.executeCommand('breatheGlow.toggle');
      // If we get here, the command executed successfully
      assert.ok(true, 'Toggle command executed successfully');
    } catch (error) {
      assert.fail(`Toggle command failed: ${error}`);
    }
  });

  test('Cycle pattern command should execute without error', async () => {
    try {
      await vscode.commands.executeCommand('breatheGlow.cyclePattern');
      // If we get here, the command executed successfully
      assert.ok(true, 'Cycle pattern command executed successfully');
    } catch (error) {
      assert.fail(`Cycle pattern command failed: ${error}`);
    }
  });

  test('Configuration changes should be respected', async () => {
    const config = vscode.workspace.getConfiguration('breatheGlow');
    
    // Change pattern
    await config.update('pattern', 'boxing', vscode.ConfigurationTarget.Global);
    assert.strictEqual(config.get('pattern'), 'boxing', 'Pattern should update to boxing');
    
    // Change intensity
    await config.update('intensity', 0.8, vscode.ConfigurationTarget.Global);
    assert.strictEqual(config.get('intensity'), 0.8, 'Intensity should update to 0.8');
    
    // Reset to defaults
    await config.update('pattern', 'chill', vscode.ConfigurationTarget.Global);
    await config.update('intensity', 0.6, vscode.ConfigurationTarget.Global);
  });

  test('Pattern cycling should work correctly', async () => {
    const config = vscode.workspace.getConfiguration('breatheGlow');
    
    // Set to known starting pattern
    await config.update('pattern', 'chill', vscode.ConfigurationTarget.Global);
    assert.strictEqual(config.get('pattern'), 'chill');
    
    // Cycle through patterns
    await vscode.commands.executeCommand('breatheGlow.cyclePattern');
    assert.strictEqual(config.get('pattern'), 'medium', 'Should cycle from chill to medium');
    
    await vscode.commands.executeCommand('breatheGlow.cyclePattern');
    assert.strictEqual(config.get('pattern'), 'active', 'Should cycle from medium to active');
    
    await vscode.commands.executeCommand('breatheGlow.cyclePattern');
    assert.strictEqual(config.get('pattern'), 'boxing', 'Should cycle from active to boxing');
    
    await vscode.commands.executeCommand('breatheGlow.cyclePattern');
    assert.strictEqual(config.get('pattern'), 'relaxing', 'Should cycle from boxing to relaxing');
    
    await vscode.commands.executeCommand('breatheGlow.cyclePattern');
    assert.strictEqual(config.get('pattern'), 'chill', 'Should cycle from relaxing back to chill');
  });

  test('Extension should handle invalid configuration gracefully', async () => {
    const config = vscode.workspace.getConfiguration('breatheGlow');
    
    // Test invalid pattern (should not crash)
    try {
      await config.update('pattern', 'invalid-pattern', vscode.ConfigurationTarget.Global);
      await vscode.commands.executeCommand('breatheGlow.toggle');
      assert.ok(true, 'Extension handles invalid pattern gracefully');
    } catch (error) {
      assert.fail(`Extension should handle invalid pattern: ${error}`);
    }
    
    // Reset to valid pattern
    await config.update('pattern', 'chill', vscode.ConfigurationTarget.Global);
  });

  test('Extension should clean up properly on deactivate', async () => {
    // This test ensures no memory leaks or hanging timers
    // In a real scenario, we'd deactivate and check for cleanup
    // For now, we just verify the extension can be safely toggled off
    
    const config = vscode.workspace.getConfiguration('breatheGlow');
    await config.update('enabled', false, vscode.ConfigurationTarget.Global);
    
    // Extension should still be responsive
    await vscode.commands.executeCommand('breatheGlow.toggle');
    assert.ok(true, 'Extension handles disable/enable gracefully');
    
    // Reset
    await config.update('enabled', true, vscode.ConfigurationTarget.Global);
  });
});
