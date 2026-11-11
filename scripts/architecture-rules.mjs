/** Pure rules permit actual negative fixtures, not tests that bypass the checker. */
export function architectureErrors(file, text) {
  const errors = [];
  const reject = (condition, rule) => {
    if (condition) errors.push(`${file}: ${rule}`);
  };
  reject(
    /MockProvider|\bconsole\.log\s*\(|\binnerHTML\s*=|\beval\s*\(|\blocalStorage\b/.test(text),
    'unsafe production behavior',
  );
  reject(
    /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\s*\(/.test(text),
    'no authorized network service in S02',
  );
  if (file.endsWith('.css') && !file.endsWith('theme.css')) {
    reject(
      /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s)\b|@media/.test(text),
      'design values and breakpoints belong in theme.css',
    );
  }
  if (file.endsWith('.ts')) {
    reject(
      !file.endsWith('/shared/controls.ts') &&
        /(?:element|createElement)\(\s*['"](?:button|dialog)['"]/.test(text),
      'use shared control primitives',
    );
    reject(
      /(?:src\/core\/|src\/ai\/schemas\/)/.test(file) && /\bMath\.random\s*\(/.test(text),
      'use explicit seeded random',
    );
    reject(
      /src\/core\//.test(file) && /(?:from\s*['"][^'"]*\/(?:ui|render)\/|\bdocument\.)/.test(text),
      'core must not depend on renderer or DOM',
    );
    reject(
      !/(?:\/core\/schemas|\/ai\/schemas\/traits)\.ts$/.test(file) &&
        /(?:interface|type)\s+(?:Fish|TraitCard|TankSave)\b/.test(text),
      'derive domain types from canonical schemas',
    );
    reject(
      !file.endsWith('/config/domain.config.ts') &&
        /(?:const|let)\s+(?:behaviorRanges|personalityKeys)\s*=/.test(text),
      'duplicate canonical rule registry',
    );
  }
  return errors;
}

/**
 * The favicon is a shipped brand asset, so its colour is a design value like any other.
 * It cannot read theme.css, so the only defence against the two drifting apart is a check:
 * the single circle's fill must equal the --color-accent token in the one theme file.
 * Returns an error string, or undefined when the asset and the token agree.
 */
export function faviconAccentError(faviconSvg, themeCss) {
  const token = /--color-accent:\s*(#[0-9a-f]{6})\b/i.exec(themeCss)?.[1];
  if (!token) return 'theme.css must define --color-accent as a six-digit hex colour';
  const fills = [...faviconSvg.matchAll(/fill="(#[0-9a-f]{6})"/gi)].map((match) =>
    match[1].toLowerCase(),
  );
  if (fills.length !== 1)
    return `favicon.svg must fill exactly one shape, found ${String(fills.length)}`;
  return fills[0] === token.toLowerCase()
    ? undefined
    : `favicon.svg fill ${fills[0] ?? 'none'} must equal --color-accent ${token}`;
}
