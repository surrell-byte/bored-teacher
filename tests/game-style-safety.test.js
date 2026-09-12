const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

function cssFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return cssFiles(entryPath);
    return entry.name.endsWith('.css') ? [entryPath] : [];
  });
}

test('game styles do not contain unscoped page-level selectors', () => {
  const root = path.join(__dirname, '..', 'games');
  const violations = [];
  const globalSelector = /(?:^|,)\s*(?:html|body|\*)\s*(?:,|\{|$)/;

  for (const filePath of cssFiles(root)) {
    const css = fs.readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const selectorBlock of css.matchAll(/([^{}]+)\{/g)) {
      const selector = selectorBlock[1].trim();
      if (globalSelector.test(selector)) violations.push(`${path.relative(root, filePath)}: ${selector}`);
    }
  }

  assert.deepEqual(violations, [], `Unscoped game selectors found:\n${violations.join('\n')}`);
});