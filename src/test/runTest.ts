/*
  Test Runner (VS Code Integration)

  Purpose:
  - Boots the VS Code extension test environment using @vscode/test-electron.
  - Locates the compiled extension under the workspace and executes the Mocha suite.

  How To Run:
  - Build + run integration tests via npm scripts:
    - npm test            (runs unit + integration tests)
    - npm run test:integration
  - This downloads a matching VS Code build on first run and executes tests in it.

  Notes:
  - Expects compiled output in `dist/` (npm pretest runs `npm run compile`).
  - Test files are discovered by the suite bootstrap at `src/test/suite/index.ts`.
*/
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
