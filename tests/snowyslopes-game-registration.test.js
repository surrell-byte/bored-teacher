const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Snowy Slopes is registered in the shared component and catalog registries', () => {
  const components = fs.readFileSync(path.join(root, 'games/catalog.components.tsx'), 'utf8');
  const catalog = fs.readFileSync(path.join(root, 'games/catalog.data.ts'), 'utf8');

  assert.match(components, /snowyslopes:\s*lazyGame\('snowyslopes',\s*\(\)\s*=>\s*import\('@\/games\/snowy-slopes\/SnowySlopes\.jsx'\)\)/);
  assert.match(catalog, /snowyslopes:\s*\{/);
  assert.match(catalog, /name:\s*"Snowy Slopes"/);
});
