import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// App logic tests run in Node. Keep them on pure modules (no React Native imports).
// Vite cannot read "expo/tsconfig.base", so the tests use test/tsconfig.json.
export default defineConfig({
  tsconfig: 'test/tsconfig.json',
  resolve: { alias: { '@game/engine': resolve(__dirname, '../../packages/engine/src/index.ts'), '@': resolve(__dirname, 'src') } },
  test: { environment: 'node', include: ['test/**/*.test.ts'] },
});
