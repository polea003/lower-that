import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.js'],
      exclude: ['src/app.js'],
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
});
