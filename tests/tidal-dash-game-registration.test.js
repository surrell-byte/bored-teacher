const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('Tidal Dash is registered as a playable two-player current race', () => {
  const catalog = fs.readFileSync(path.join(root, 'games/catalog.data.ts'), 'utf8');
  const components = fs.readFileSync(path.join(root, 'games/catalog.components.tsx'), 'utf8');
  const rules = fs.readFileSync(path.join(root, 'app/games/da-rules/page.tsx'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'games/tidal-dash/TidalDash.jsx'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'games/tidal-dash/tidalDash.css'), 'utf8');

  assert.match(catalog, /tidaldash:\s*\{[\s\S]*?name:\s*"Tidal Dash"[\s\S]*?badge:\s*"2 Players"[\s\S]*?hasComponent:\s*true/);
  assert.match(components, /tidaldash:\s*lazyGame\('tidaldash',\s*\(\)\s*=>\s*import\('@\/games\/tidal-dash\/TidalDash\.jsx'\)\)/);
  assert.match(rules, /tidaldash:[\s\S]*?Paddle, Anchor, or Steer/);
  assert.match(game, /First crew to \{WIN_SCORE\} steps wins/);
  assert.match(game, /className="td-countdown"/);
  assert.match(styles, /\.td-root\s*\{/);
});

test('Tidal Dash maps each current to its move and awards a step only for the right move', async () => {
  const { createTidalSignal, resolveTidalTurn, TIDAL_SIGNALS } = await import('../games/tidal-dash/tidalDashLogic.mjs');
  assert.equal(TIDAL_SIGNALS.length, 3);

  const nextSignal = createTidalSignal(() => 0, 'surge');
  assert.notEqual(nextSignal.id, 'surge');

  const correct = resolveTidalTurn([4, 2], 0, 'paddle', 'surge');
  assert.equal(correct.correct, true);
  assert.deepEqual(correct.scores, [5, 2]);
  assert.equal(correct.winnerIndex, 0);

  const wrong = resolveTidalTurn([4, 2], 1, 'anchor', 'crosscurrent');
  assert.equal(wrong.correct, false);
  assert.deepEqual(wrong.scores, [4, 2]);
  assert.equal(wrong.winnerIndex, -1);
  assert.equal(wrong.expectedAction, 'steer');

  const missed = resolveTidalTurn([0, 0], 0, null, 'slack');
  assert.equal(missed.correct, false);
  assert.deepEqual(missed.scores, [0, 0]);
});
