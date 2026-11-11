/**
 * Runs one verification stage and re-reports its failure as `node:test` output.
 *
 * A failing CI stage only surfaces as "Process completed with exit code 1" when the runner's
 * raw log cannot be downloaded. `node --test` lines become check-run annotations instead, so
 * each stage that fails names itself and carries the tail of its own output.
 */
import { spawnSync } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('usage: node scripts/verify-step.mjs <command> [args...]');
  process.exit(2);
}
const label = [command, ...args].join(' ');
const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.status === 0) process.exit(0);

// GitHub turns `::error::` workflow commands in a step's stdout into check-run annotations.
// A plain `not ok` line is not picked up, which is why the first attempt was invisible.
console.log(`::error title=Verification stage failed::${label}`);
process.exit(result.status ?? 1);
