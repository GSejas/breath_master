/*
  Mocha Suite Bootstrap

  Purpose:
  - Configures and runs the Mocha test suite inside the VS Code integration harness.
  - Discovers compiled test files and adds them to Mocha for execution.

  Discovery:
  - Looks for  under the compiled tests root.
  - Source `.ts` tests live in `src/test/suite`, compiled to `dist/test/suite` by pretest.

  Run:
  - npm run test:integration  (or `npm test` which includes unit + integration)

  Notes:
  - Keep tests UI-agnostic to avoid modal UI hangs in automation.
*/
import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }).then((files: string[]) => {
      // Add files to the test suite
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    }).catch(e);
  });
}
