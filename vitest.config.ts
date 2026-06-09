import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/api/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      // Coverage targets the unit-testable logic layer. UI components and pages
      // (src/components, src/app) are exercised by the Playwright E2E suite, and
      // would otherwise drown out meaningful coverage signal here.
      include: ['src/lib/**/*.ts', 'src/context/**/*.tsx'],
      exclude: [
        'src/lib/types/**', // type-only declarations
        'src/lib/social/types.ts', // type-only declarations
        'src/lib/supabase/**', // thin Supabase SDK client wrappers (need a live backend)
        'src/lib/utils/compress.ts', // browser Canvas/Image APIs — covered by E2E, not jsdom
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
