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
test('rejects any CSS border that would draw a frame', () => {
  for (const css of [
    '.x { border: var(--w) solid var(--c); }',
    '.x { border-top: var(--w) solid var(--c); }',
    '.x { border: solid var(--c); }',
    '.x { border-bottom: 2px solid red; }',
    '.x { border-right: thin var(--c); }',
  ])
    assert.ok(
      architectureErrors('src/ui/card.css', css).some((e) => e.includes('borders are banned')),
      css,
    );
});
test('allows border resets and radii, which paint nothing', () => {
  for (const css of [
    '.x { border: 0; }',
    '.x { border: none; }',
    '.x { border-radius: var(--radius-pill); }',
  ])
    assert.equal(architectureErrors('src/ui/card.css', css).length, 0, css);
});
test('rejects a one-pixel rule painted with a background', () => {
  assert.ok(
    architectureErrors('src/ui/card.css', '.x { height: 1px; background: var(--c); }').some((e) =>
      e.includes('no one-pixel rules'),
    ),
  );
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
import { faviconAccentError } from '../../scripts/architecture-rules.mjs';
const theme = ':root { --color-accent: #396aab; }';
test('rejects a favicon whose brand fill drifted from the theme token', () => {
  assert.match(
    faviconAccentError('<circle r="30" fill="#00ff00"/>', theme) ?? '',
    /must equal --color-accent/,
  );
});
test('rejects a favicon with more than one filled shape', () => {
  assert.match(
    faviconAccentError('<circle r="30" fill="#396aab"/><circle r="4" fill="#396aab"/>', theme) ??
      '',
    /exactly one shape/,
  );
});
test('rejects a theme without a usable accent token', () => {
  assert.match(faviconAccentError('<circle fill="#396aab"/>', ':root{}') ?? '', /must define/);
});
test('accepts the shipped asset and token, case-insensitively', () => {
  assert.equal(faviconAccentError('<circle r="30" fill="#396AAB"/>', theme), undefined);
});
