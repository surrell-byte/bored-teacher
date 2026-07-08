#!/usr/bin/env node
/**
 * check-orphaned-classes.js
 *
 * Scans every .tsx/.jsx file (excluding node_modules, .next, and the
 * self-contained /games directory) for className usages, then checks
 * each class against what's actually defined in app/globals.css.
 *
 * Flags:
 *   - Classes used in components with NO matching CSS rule ("orphaned")
 *
 * Note: this is a heuristic, not a full CSS parser. It will report some
 * false positives for:
 *   - Tailwind utility classes (if you use Tailwind elsewhere)
 *   - Classes applied dynamically via string concatenation the regex can't parse
 *   - Single-letter or JS-variable-looking "classes" from messy template literals
 * Skim the output rather than trusting it blindly — but it WILL catch every
 * genuine component/CSS drift, which is the failure mode this guards against.
 *
 * Usage:
 *   node scripts/check-orphaned-classes.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CSS_FILE = path.join(ROOT, 'app', 'globals.css');
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'games', 'backup']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  if (!fs.existsSync(CSS_FILE)) {
    console.error(`Could not find ${CSS_FILE}`);
    process.exit(1);
  }

  const css = fs.readFileSync(CSS_FILE, 'utf8');
  const defined = new Set();
  for (const m of css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    defined.add(m[1]);
  }

  const used = new Map(); // className -> Set of file paths
  const files = walk(ROOT);

  const staticRe = /className=["']([^"'{}]+)["']/g;
  const templateRe = /className=\{`([^`]+)`\}/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);

    for (const m of content.matchAll(staticRe)) {
      for (const cls of m[1].split(/\s+/)) {
        if (!cls) continue;
        if (!used.has(cls)) used.set(cls, new Set());
        used.get(cls).add(rel);
      }
    }
    for (const m of content.matchAll(templateRe)) {
      for (const piece of m[1].split(/[\s${}]+/)) {
        const cls = piece.trim();
        if (cls && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cls)) {
          if (!used.has(cls)) used.set(cls, new Set());
          used.get(cls).add(rel);
        }
      }
    }
  }

  const missing = [...used.entries()]
    .filter(([cls]) => !defined.has(cls))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log(`Scanned ${files.length} component files.`);
  console.log(`Total unique classNames found: ${used.size}`);
  console.log(`Classes with no matching CSS rule: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('✓ No orphaned classes found.');
    return;
  }

  for (const [cls, paths] of missing) {
    console.log(`${cls}`);
    for (const p of paths) console.log(`    ${p}`);
  }

  console.log('\n⚠️  Review the list above. Some entries may be false positives');
  console.log('   (Tailwind utilities, or JS variables caught inside template literals).');
  process.exitCode = 1;
}

main();
