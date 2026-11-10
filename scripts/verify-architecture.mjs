/** Guard today's source boundaries; S02 extends these checks as shared domain rules arrive. */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { architectureErrors } from './architecture-rules.mjs';

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  });
}
const errors = [];
for (const file of files('src')) {
  const text = readFileSync(file, 'utf8');
  errors.push(...architectureErrors(file, text));
}
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`${name}: dependency version must be exact`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.info('PASS: production boundaries, centralized styling and exact dependency versions');
}
