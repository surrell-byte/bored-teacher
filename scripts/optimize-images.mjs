import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const rootDir = process.cwd();
const assetRoot = path.join(rootDir, 'public', 'assets');
const outputRoot = path.join(rootDir, 'public', 'assets', '.optimized');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const MAX_PARALLEL = 4;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }

    if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function toWebpPath(filePath) {
  const parsed = path.parse(filePath);
  const relative = path.relative(assetRoot, filePath);
  const optimizedDir = path.join(outputRoot, path.dirname(relative));
  ensureDir(optimizedDir);
  return path.join(optimizedDir, `${parsed.name}.webp`);
}

async function optimizeFile(filePath) {
  const outPath = toWebpPath(filePath);
  const sourceStat = fs.statSync(filePath);

  if (fs.existsSync(outPath)) {
    const outStat = fs.statSync(outPath);
    if (outStat.mtimeMs >= sourceStat.mtimeMs) {
      return;
    }
  }

  await sharp(filePath)
    .webp({ quality: 78, effort: 6 })
    .toFile(outPath);
}

async function main() {
  ensureDir(outputRoot);
  const files = collectFiles(assetRoot).filter(file => !file.includes('/.optimized/'));

  let index = 0;
  const workers = Array.from({ length: Math.min(MAX_PARALLEL, files.length || 1) }, async () => {
    while (index < files.length) {
      const current = files[index++];
      await optimizeFile(current);
    }
  });

  await Promise.all(workers);
  console.log(`Optimized ${files.length} image file(s) into ${outputRoot}`);
}

main().catch(error => {
  console.error('Image optimization failed:', error);
  process.exit(1);
});
