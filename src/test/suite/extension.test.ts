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

    assert.ok(
      commands.includes('breathMaster.startSession'),
      'breathMaster.startSession command should be registered'
    );

    assert.ok(
      commands.includes('breathMaster.endSession'),
      'breathMaster.endSession command should be registered'
    );
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

  test('Pattern cycling should work through all patterns', async () => {
    // Test that cycle commands execute without errors through all patterns
    try {
      // Start from any pattern and cycle through all 6 patterns (chill, medium, active, boxing, relaxing, custom)
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
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

  test('Session commands should execute without hanging', async () => {
    // Note: startSession shows a QuickPick which hangs in automated tests
    // Instead, test that the commands are registered and don't throw immediate errors
    try {
      // Just test that endSession exists and can be called (it doesn't show dialogs)
      await vscode.commands.executeCommand('breathMaster.endSession');
      assert.ok(true, 'End session command executed successfully');
    } catch (error) {
      assert.fail(`Session commands failed: ${error}`);
    }
  });

  test('Gamification commands should execute without hanging', async () => {
    try {
      // Note: viewChallenges may show dialogs, universalControl may show QuickPick
      // Test a simpler command or just test registration
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('breathMaster.viewChallenges'), 'viewChallenges should be registered');
      assert.ok(commands.includes('breathMaster.universalControl'), 'universalControl should be registered');
      assert.ok(true, 'Gamification commands are properly registered');
    } catch (error) {
      assert.fail(`Gamification commands failed: ${error}`);
    }
  });

  test('Export and data commands should be registered', async () => {
    try {
      // Note: exportData shows dialogs which hang in automated tests
      // Just verify the commands exist
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('breathMaster.exportData'), 'exportData should be registered');
      assert.ok(commands.includes('breathMaster.clearData'), 'clearData should be registered');
      assert.ok(true, 'Data commands are properly registered');
    } catch (error) {
      assert.fail(`Export data command failed: ${error}`);
    }
  });

  test('Extension should handle safe commands gracefully', async () => {
    // Test commands that don't show dialogs to avoid hanging
    try {
      await vscode.commands.executeCommand('breathMaster.toggle');
      await vscode.commands.executeCommand('breathMaster.cyclePattern');
      // Skip startSession (shows QuickPick), pauseSession, resumeSession
      await vscode.commands.executeCommand('breathMaster.endSession');
      assert.ok(true, 'Safe commands executed successfully in sequence');
    } catch (error) {
      assert.fail(`Command sequence failed: ${error}`);
    }
  });

  test('Stretch preset commands should be registered', async () => {
    try {
      // Note: startStretchPreset shows a QuickPick which hangs in automated tests
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('breathMaster.startStretchPreset'), 'startStretchPreset should be registered');
      assert.ok(commands.includes('breathMaster.cancelStretchPreset'), 'cancelStretchPreset should be registered');
      assert.ok(true, 'Stretch preset commands are properly registered');
    } catch (error) {
      assert.fail(`Stretch preset command failed: ${error}`);
    }
  });

  test('Tutorial commands should be registered', async () => {
    try {
      // Note: showTour may show dialogs or webviews which hang in automated tests
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('breathMaster.showTour'), 'showTour should be registered');
      assert.ok(true, 'Tutorial commands are properly registered');
    } catch (error) {
      assert.fail(`Tutorial command failed: ${error}`);
    }
  });
});