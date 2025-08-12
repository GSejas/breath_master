import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
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
