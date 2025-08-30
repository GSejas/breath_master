/*
  Vitest Configuration (Unit Tests)

  Purpose:
  - Runs fast, isolated unit tests outside the VS Code runtime.
  - Complements integration tests executed via @vscode/test-electron.

  Scope:
  - Includes 
  - Excludes tests that require VS Code APIs (see comments below).

  Run:
  - npm run test:unit        (watch: npm run test:unit:watch)
  - Coverage: npm run test:cov
*/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    exclude: ['test/unit/storage-wrapper.test.ts'], // VS Code APIs not available in unit tests
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text','lcov'],
      thresholds: {
        statements: 0.55,
        branches: 0.45,
        lines: 0.55,
        functions: 0.50
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
