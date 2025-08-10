import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    threads: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/config/**', 'src/utils/logger.ts', 'src/types/**']
    }
  }
});
