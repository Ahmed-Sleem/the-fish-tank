/** Keep deterministic unit tests independent from browser smoke and rendering. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
