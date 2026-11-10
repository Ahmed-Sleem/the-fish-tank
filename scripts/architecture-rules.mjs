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
