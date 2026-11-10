/** Guard today's source boundaries; S02 extends these checks as shared domain rules arrive. */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  });
}
const errors = [];
for (const file of files('src')) {
  const text = readFileSync(file, 'utf8');
  if (/MockProvider|\bconsole\.log\s*\(|\binnerHTML\s*=|\beval\s*\(|\blocalStorage\b/.test(text)) {
    errors.push(
      `${file}: forbidden production mock, unsafe HTML/code, logging or credential storage`,
    );
  }
  if (/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\s*\(/.test(text)) {
    errors.push(`${file}: S01 has no authorized network service`);
  }
  if (file.endsWith('.css') && !file.endsWith('theme.css')) {
    if (/#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s)\b|@media/.test(text)) {
      errors.push(`${file}: design values and breakpoints belong in theme.css`);
    }
  }
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
