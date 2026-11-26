const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('Pizza Fractions 2.0 is registered as a separate catalog game', () => {
  const catalog = fs.readFileSync(path.join(root, 'games/catalog.data.ts'), 'utf8');
  const components = fs.readFileSync(path.join(root, 'games/catalog.components.tsx'), 'utf8');
  const gameFile = path.join(root, 'games/pizza-fractions-2/PizzaFractions2.jsx');

  assert.match(catalog, /pizzafractions2:\s*\{[\s\S]*?name:\s*"Pizza Fractions 2\.0"[\s\S]*?hasComponent:\s*true/);
  assert.match(components, /pizzafractions2:\s*lazyGame\('pizzafractions2',\s*\(\)\s*=>\s*import\('@\/games\/pizza-fractions-2\/PizzaFractions2\.jsx'\)\)/);
  assert.ok(fs.existsSync(gameFile));
  assert.match(fs.readFileSync(gameFile, 'utf8'), /function createOrder\(round\)/);
});
