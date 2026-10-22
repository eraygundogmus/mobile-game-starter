import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';

// The tests run inside workerd (the real Workers runtime) with a local D1.
export default defineConfig(async () => ({
  resolve: { alias: { '@game/engine': fileURLToPath(new URL('../../packages/engine/src/index.ts', import.meta.url).href) } },
  tsconfig: './tsconfig.test.json',
  cacheDir: '.wrangler/vitest-cache',
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: { bindings: { TEST_MIGRATIONS: await readD1Migrations('./migrations') } },
    }),
  ],
  test: { testTimeout: 20000, include: ['test/**/*.test.ts'], setupFiles: ['test/setup.ts'] },
}));
