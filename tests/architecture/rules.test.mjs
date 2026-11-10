import { test } from 'node:test';
import assert from 'node:assert/strict';
import { architectureErrors } from '../../scripts/architecture-rules.mjs';
for (const [file, code, message] of [
  ['src/ui/card.css', '.card { color: #ffffff }', 'design values'],
  ['src/ui/card.css', '.card { padding: 12px }', 'design values'],
  ['src/ui/card.ts', "element('button', 'copy')", 'shared control'],
  ['src/ui/card.ts', "document.createElement('dialog')", 'shared control'],
  ['src/core/sim.ts', 'Math.random()', 'seeded random'],
  ['src/core/sim.ts', "import { a } from '../render/a';", 'core must not depend'],
  ['src/core/sim.ts', "document.createElement('p')", 'core must not depend'],
  ['src/sim/fish.ts', 'interface Fish {}', 'canonical schemas'],
  ['src/sim/fish.ts', 'const behaviorRanges = {}', 'duplicate canonical'],
  ['src/ui/card.ts', 'node.innerHTML = value', 'unsafe production'],
])
  test(`rejects ${message}: ${code}`, () => {
    assert.ok(architectureErrors(file, code).some((e) => e.includes(message)));
  });
test('allows canonical primitives, registries, theme and schema-derived consumers', () => {
  for (const [file, code] of [
    ['src/ui/shared/controls.ts', "element('button', 'ui-button')"],
    ['src/config/domain.config.ts', 'const behaviorRanges = {}'],
    ['src/ui/theme.css', ':root { --space: 12px; }'],
    ['src/core/use.ts', "import type { Fish } from './schemas';"],
  ])
    assert.deepEqual(architectureErrors(file, code), []);
});
