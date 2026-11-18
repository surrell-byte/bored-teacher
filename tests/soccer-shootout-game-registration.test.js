const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('Soccer Shootout is registered and uses the supplied stadium background', () => {
  const catalog = fs.readFileSync(path.join(root, 'games/catalog.data.ts'), 'utf8');
  const components = fs.readFileSync(path.join(root, 'games/catalog.components.tsx'), 'utf8');
  const game = fs.readFileSync(path.join(root, 'games/soccer-shootout/SoccerShootout.jsx'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'games/soccer-shootout/soccerShootout.css'), 'utf8');
  const background = path.join(root, 'public/assets/games/soccer-shootout/stadium-background.png');
  const cover = path.join(root, 'public/assets/covers/soccer-shootout-cover.webp');
  const keeperSprites = path.join(root, 'public/assets/games/soccer-shootout/goalkeeper-sprites-v2.png');

  assert.match(catalog, /soccershootout:\s*\{[\s\S]*?name:\s*"Soccer Shootout"[\s\S]*?hasComponent:\s*true/);
  assert.match(components, /soccershootout:\s*lazyGame\('soccershootout',\s*\(\)\s*=>\s*import\('@\/games\/soccer-shootout\/SoccerShootout\.jsx'\)\)/);
  assert.match(styles, /background-image:\s*url\("\/assets\/games\/soccer-shootout\/stadium-background\.png"\)/);
  assert.ok(fs.existsSync(background), 'stadium background asset should be present');
  assert.ok(fs.existsSync(cover), 'game cover should be present');
  assert.ok(fs.existsSync(keeperSprites), 'goalkeeper sprite sheet should be present');
  assert.doesNotMatch(styles, /goalkeeper-moves-v3\.png/);
  assert.match(styles, /background-size:\s*500%\s+300%/);
  assert.match(styles, /\.soccer-shootout\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?border:\s*0;/);
  assert.match(styles, /border-radius:\s*0;/);
  assert.match(styles, /goalkeeper-sprites-v2\.png/);
  assert.match(game, /ss-keeper--\$\{keeperPose\}/);
  assert.match(game, /setKeeperPose\("ready"\)/);
  assert.doesNotMatch(game, /keeperSheet|keeperFrame|ADDITIONAL_KEEPER_POSES/);
  assert.match(game, /SHOT_LIMIT = 5/);
  assert.match(game, /onClick=\{shoot\}/);
  assert.match(game, /aria-label="Choose where to aim"/);
  assert.match(game, /left:\s*\{\s*x:\s*"39\.33%",\s*y:\s*"39\.5%"/);
  assert.match(styles, /left:\s*var\(--shot-x\);[\s\S]*?top:\s*var\(--shot-y\);/);
});
