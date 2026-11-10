/** Serve the same build under GitHub's project subpath and the Arena preview. */
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

const revision = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
  encoding: 'utf8',
}).trim();

export default defineConfig({
  base: '/the-fish-tank/',
  define: { __BUILD_REVISION__: JSON.stringify(revision) },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app', 'localhost'],
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app', 'localhost'],
  },
});
