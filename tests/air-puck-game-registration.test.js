const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Air Puck card mode schedules AI turns, reveals cards, and animates doubled sprites', () => {
  const component = fs.readFileSync(path.join(root, 'AirPuck.jsx'), 'utf8');
  const route = fs.readFileSync(path.join(root, 'app/games/[game]/page.tsx'), 'utf8');
  const routeLayout = fs.readFileSync(path.join(root, 'app/games/[game]/layout.tsx'), 'utf8');
  const nextConfig = fs.readFileSync(path.join(root, 'next.config.js'), 'utf8');

  assert.doesNotMatch(component, /<canvas\b|createElement\(['"]canvas['"]\)/);
  assert.match(component, /className="welcome-hitbox"[^>]*aria-label="Start Air Puck"/);
  assert.match(component, /\.playfield\{position:absolute;inset:0;width:100%;height:100%;overflow:hidden/);
  assert.equal((component.match(/className="sprite sprite-mallet"/g) || []).length, 4);
  assert.match(component, /\.sprite-mallet\{width:20\.8cqw/);
  assert.match(component, /\.sprite-puck\{width:8\.4cqw/);
  assert.match(component, /r: 168/);
  assert.match(component, /r: 68/);
  assert.match(component, /GOAL_HEIGHT = 220/);
  assert.match(component, /image\.decode\(\)/);
  assert.match(component, /Promise\.all\(required\.map/);
  assert.match(component, /air-hockey-game-screen-bg\.webp/);
  assert.match(component, /air-hockey-game-screen-card-mode-bg\.webp/);
  assert.match(component, /const BOARD = \{ left: 0\.19, top: 0\.225, width: 0\.62, height: 0\.55 \}/);
  assert.match(component, /const inGoal = puck\.y - puck\.r >= GOAL_T && puck\.y \+ puck\.r <= GOAL_B/);
  assert.match(component, /height:100%;min-height:0;max-height:100%/);
  assert.match(component, /\.ap\[data-screen="game"\]::before[\s\S]*rotate\(90deg\)/);
  assert.match(component, /const finishTurn = \(actor\) =>[\s\S]*?later\(\(\) =>[\s\S]*?aiCardTurn\(\)/);
  assert.match(component, /element\.animate\(frames, \{ duration, easing:/);
  assert.match(component, /aria-label=\{pendingCard\.revealed \? `Revealed/);
  assert.match(component, /onClick=\{\(\) => revealSelectedCard\(\)\}/);
  assert.match(component, /TAP TO REVEAL/);
  assert.match(component, /animateCardPaddles\(actor\)/);
  assert.match(component, /if \(actor === "ai"\) later\(\(\) => revealSelectedCard/);
  assert.match(component, /resolvePenalty\(initiator, shooter\)/);
  assert.match(component, /onHudUpdate\(\{/);
  assert.match(route, /air-puck:set-difficulty/);
  assert.match(route, /onHudUpdate: setAirPuckHud/);
  assert.match(route, /if \(!accessReady && requiresAccessCheck\)/);
  assert.match(routeLayout, /generateStaticParams/);
  assert.match(routeLayout, /Object\.keys\(GAME_CATALOG\)/);
  assert.match(route, /const \[clientReady, setClientReady\] = useState\(false\)/);
  assert.match(route, /\) : !clientReady \?/);
  assert.match(nextConfig, /source: '\/games\/airpuck'[\s\S]*?max-age=3600, s-maxage=86400, stale-while-revalidate=604800/);
  assert.ok(fs.existsSync(path.join(root, 'public', 'assets', 'covers', 'air-hockey-cover.webp')));

  for (const asset of [
    'air-puck-welcome-screen-bg.webp',
    'air-puck-user-input-bg.webp',
    'air-puck-main-menu-bg.webp',
    'air-hockey-game-screen-bg.webp',
    'air-hockey-game-screen-card-mode-bg.webp',
    'air-hockey-blue-mallet.webp',
    'air-hockey-red-mallet.webp',
    'air-hockey-red-puck.webp',
  ]) {
    assert.ok(fs.existsSync(path.join(root, 'public', 'games', 'air-puck', asset)), `${asset} should be published`);
  }
});