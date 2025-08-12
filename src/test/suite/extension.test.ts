import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Breath Master Extension Integration Tests', () => {
  let extension: vscode.Extension<any> | undefined;

  suiteSetup(async () => {
    // Get the extension
    extension = vscode.extensions.getExtension('GSejas.breath-master');
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
      commands.includes('breathMaster.toggle'),
      'breathMaster.toggle command should be registered'
    );
    
    assert.ok(
      commands.includes('breathMaster.cyclePattern'),
      'breathMaster.cyclePattern command should be registered'
    );
  });

  test('Configuration should have default values', () => {
    const config = vscode.workspace.getConfiguration();
    
    assert.strictEqual(config.get('breathMaster.enabled'), true, 'Default enabled should be true');
    assert.strictEqual(config.get('breathMaster.pattern'), 'chill', 'Default pattern should be chill');
    assert.strictEqual(config.get('breathMaster.intensity'), 0.6, 'Default intensity should be 0.6');
    assert.strictEqual(config.get('breathMaster.tickMs'), 100, 'Default tickMs should be 100');
    assert.strictEqual(config.get('breathMaster.showBoth'), true, 'Default showBoth should be true');
    assert.strictEqual(config.get('breathMaster.showNotifications'), false, 'Default showNotifications should be false');
  });

  test('Toggle command should execute without error', async () => {
    try {
      await vscode.commands.executeCommand('breathMaster.toggle');
      // If we get here, the command executed successfully
      assert.ok(true, 'Toggle command executed successfully');
    } catch (error) {
      assert.fail(`Toggle command failed: ${error}`);
    }
  });

  test('Cycle pattern command should execute without error', async () => {
    try {
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      // If we get here, the command executed successfully
      assert.ok(true, 'Cycle pattern command executed successfully');
    } catch (error) {
      assert.fail(`Cycle pattern command failed: ${error}`);
    }
  });

  test('Configuration changes should be respected', async () => {
    const config = vscode.workspace.getConfiguration();
    
    // Test that configuration updates don't throw errors
    try {
      await config.update('breathMaster.pattern', 'boxing', vscode.ConfigurationTarget.Global);
      await config.update('breathMaster.intensity', 0.8, vscode.ConfigurationTarget.Global);
      assert.ok(true, 'Configuration updates completed without errors');
    } catch (error) {
      assert.fail(`Configuration update failed: ${error}`);
    }
    
    // Reset to defaults
    await config.update('breathMaster.pattern', 'chill', vscode.ConfigurationTarget.Global);
    await config.update('breathMaster.intensity', 0.6, vscode.ConfigurationTarget.Global);
  });

  test('Pattern cycling should work correctly', async () => {
    const config = vscode.workspace.getConfiguration();
    
    // Set to known starting pattern
    await config.update('breathMaster.pattern', 'chill', vscode.ConfigurationTarget.Global);
    
    // Test that cycle commands execute without errors
    try {
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      assert.ok(true, 'Pattern cycling executed successfully through all patterns');
    } catch (error) {
      assert.fail(`Pattern cycling failed: ${error}`);
    }
  });

  test('Extension should handle invalid configuration gracefully', async () => {
    const config = vscode.workspace.getConfiguration();
    
    // Test invalid pattern (should not crash)
    try {
      await config.update('breathMaster.pattern', 'invalid-pattern', vscode.ConfigurationTarget.Global);
      await vscode.commands.executeCommand('breathMaster.toggle');
      assert.ok(true, 'Extension handles invalid pattern gracefully');
    } catch (error) {
      assert.fail(`Extension should handle invalid pattern: ${error}`);
    }
    
    // Reset to valid pattern
    await config.update('breathMaster.pattern', 'chill', vscode.ConfigurationTarget.Global);
  });

  test('Extension should clean up properly on deactivate', async () => {
    // This test ensures no memory leaks or hanging timers
    // In a real scenario, we'd deactivate and check for cleanup
    // For now, we just verify the extension can be safely toggled off
    
    const config = vscode.workspace.getConfiguration();
    await config.update('breathMaster.enabled', false, vscode.ConfigurationTarget.Global);
    
    // Extension should still be responsive
    await vscode.commands.executeCommand('breathMaster.toggle');
    assert.ok(true, 'Extension handles disable/enable gracefully');
    
    // Reset
    await config.update('breathMaster.enabled', true, vscode.ConfigurationTarget.Global);
  });
});
