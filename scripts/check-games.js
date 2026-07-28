#!/usr/bin/env node
// scripts/check-games.js
// Run: npm run check-games
//
// Verifies the game catalog has no drift between:
//   1. games/catalog.data.ts        (GAME_CATALOG — metadata + hasComponent/legacyUrl)
//   2. games/catalog.components.tsx (GAME_COMPONENTS — the actual lazy() import map)
//   3. games/*                       (folders that physically exist on disk)
//   4. public/assets/covers/*.webp   (cover images that physically exist on disk)
//
// Exits with code 1 (and fails CI / a git hook) if anything doesn't match up.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let problems = 0;

function fail(msg) {
  console.log(`  ❌ ${msg}`);
  problems++;
}
function warn(msg) {
  console.log(`  ⚠️  ${msg}`);
}

// ---- 1. parse GAME_CATALOG ids + flags out of catalog.data.ts ----
const dataSrc = fs.readFileSync(path.join(ROOT, 'games/catalog.data.ts'), 'utf8');
const catalogBlockMatch = dataSrc.match(/GAME_CATALOG[^{]*=\s*{([\s\S]*?)\n};/);
if (!catalogBlockMatch) {
  console.error('Could not find GAME_CATALOG in games/catalog.data.ts — check the file wasn\'t moved/renamed.');
  process.exit(1);
}
const catalogBlock = catalogBlockMatch[1];

// split into one chunk per top-level "id: { ... }," entry
const entryRe = /^\s{2}(\w+):\s*{([\s\S]*?)\n\s{2}},/gm;
const catalog = {};
let m;
while ((m = entryRe.exec(catalogBlock))) {
  const [, id, body] = m;
  catalog[id] = {
    hasComponent: /hasComponent:\s*true/.test(body),
    legacyUrl: (body.match(/legacyUrl:\s*"([^"]+)"/) || [])[1] || null,
    cover: (body.match(/cover:\s*"([^"]+)"/) || [])[1] || null,
  };
}
const catalogIds = Object.keys(catalog);
console.log(`Catalog: ${catalogIds.length} games declared in games/catalog.data.ts\n`);

// ---- 2. parse GAME_COMPONENTS ids out of catalog.components.tsx ----
const compSrc = fs.readFileSync(path.join(ROOT, 'games/catalog.components.tsx'), 'utf8');
const compIds = new Set();
const compRe = /^\s*(\w+):\s*lazy\(/gm;
while ((m = compRe.exec(compSrc))) compIds.add(m[1]);

console.log('Checking catalog.data.ts <-> catalog.components.tsx...');
for (const id of catalogIds) {
  if (catalog[id].hasComponent && !compIds.has(id)) {
    fail(`"${id}" has hasComponent: true but no lazy() entry in catalog.components.tsx`);
  }
  if (!catalog[id].hasComponent && compIds.has(id)) {
    fail(`"${id}" has a lazy() entry in catalog.components.tsx but hasComponent is not true`);
  }
}
for (const id of compIds) {
  if (!catalogIds.includes(id)) fail(`"${id}" is in catalog.components.tsx but has no GAME_CATALOG entry`);
}

// ---- 3. compare against physical games/ folders ----
// Instead of guessing folder<->id matches by name similarity (that's exactly
// the kind of fragile heuristic that caused the original drift), resolve each
// catalog entry to its REAL import path (from catalog.components.tsx) or its
// real legacyUrl, and check that file/folder actually exists on disk. Then
// separately flag any games/ folder that no entry points at all.
console.log('\nChecking catalog entries resolve to real files on disk...');
const importPathById = {};
// Allow a lazy import to adapt a shared component with `.then(...)` as well
// as returning the imported module directly.
const importRe = /^\s*(\w+):\s*lazy\(\(\)\s*=>\s*import\('([^']+)'\)/gm;
while ((m = importRe.exec(compSrc))) importPathById[m[1]] = m[2];

const referencedFolders = new Set();
for (const id of catalogIds) {
  if (catalog[id].hasComponent) {
    const p = importPathById[id];
    if (!p) continue; // already flagged above
    const relPath = p.replace(/^@\//, '') + (/\.[jt]sx?$/.test(p) ? '' : '');
    const candidates = [relPath, relPath + '.jsx', relPath + '.tsx', relPath + '.ts', relPath + '.js'];
    const found = candidates.some((c) => fs.existsSync(path.join(ROOT, c)));
    if (!found) fail(`"${id}" imports "${p}" but that file does not exist on disk`);
    const folderMatch = p.match(/^@\/games\/([^/]+)\//);
    if (folderMatch) referencedFolders.add(folderMatch[1]);
  } else if (catalog[id].legacyUrl) {
    const full = path.join(ROOT, 'public', catalog[id].legacyUrl);
    if (!fs.existsSync(full)) fail(`"${id}" points to legacyUrl "${catalog[id].legacyUrl}" but that file does not exist`);
    const folderMatch = catalog[id].legacyUrl.match(/^games\/([^/]+)\//);
    if (folderMatch) referencedFolders.add(folderMatch[1]);
  }
}

const gamesDir = path.join(ROOT, 'games');
const IGNORE_DIRS = new Set(['sdk', 'shared', 'templates', 'my-first-sdk-game', 'registry.ts', 'index.ts', 'README.md', '.DS_Store']);
const physicalFolders = fs.readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !IGNORE_DIRS.has(d.name))
  .map((d) => d.name);
for (const folder of physicalFolders) {
  if (!referencedFolders.has(folder)) {
    warn(`games/${folder} exists on disk but no GAME_CATALOG entry imports anything from it — dead folder, or a game waiting to be registered?`);
  }
}

// ---- 4. compare cover paths against public/assets/covers ----
console.log('\nChecking catalog cover paths against public/assets/covers...');
const coversDir = path.join(ROOT, 'public/assets/covers');
const coverFiles = new Set(fs.readdirSync(coversDir).filter((f) => f.endsWith('.webp')));
for (const id of catalogIds) {
  const cover = catalog[id].cover;
  if (!cover) { fail(`"${id}" has no cover set`); continue; }
  const filename = cover.split('/').pop();
  if (!coverFiles.has(filename)) fail(`"${id}" points to cover "${filename}" which does not exist in public/assets/covers`);
}

console.log('\n' + '─'.repeat(50));
if (problems === 0) {
  console.log(`✅ All ${catalogIds.length} games are consistent.`);
  process.exit(0);
} else {
  console.log(`❌ ${problems} problem(s) found — see above.`);
  process.exit(1);
}
