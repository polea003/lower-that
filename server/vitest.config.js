// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      // add 'html' so you can open ./coverage/index.html
      reporter: ['text', 'lcov', 'html'],
      all: true,
      // Focus coverage on new HTTP layer to support TDD without
      // requiring legacy app loop to be covered.
      include: ['src/http/**/*.js'],
      exclude: ['src/server.js'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
        // perFile: true, // optional: enforce per-file
      },
      // reportsDirectory: './coverage', // default; change if you want
      // enabled: true, // optional alternative to CLI flag
    },
  },
});
