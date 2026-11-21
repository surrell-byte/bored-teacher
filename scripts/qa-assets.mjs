import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const skipDirs = new Set(['.git', '.next', '.next-dev', 'node_modules', 'qa-results', 'backup', '.kilo']);
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json']);
const assetExtensions = /\.(?:png|jpe?g|webp|svg|gif|avif|mp3|wav|ogg)$/i;
const findings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) await walk(path.join(directory, entry.name));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      await auditFile(path.join(directory, entry.name));
    }
  }
}

async function auditFile(filePath) {
  let source;
  try {
    source = await readFile(filePath, 'utf8');
  } catch {
    return;
  }

  const refs = new Set();
  const absolutePattern = /["'`]\/(assets\/[^"'`?\s)#]+|images\/[^"'`?\s)#]+|icons\/[^"'`?\s)#]+)["'`]/g;
  for (const match of source.matchAll(absolutePattern)) refs.add(`/${match[1]}`);

  const cssPattern = /url\(["'?]?([^)"'?]+)["'?]?\)/g;
  for (const match of source.matchAll(cssPattern)) {
    const ref = match[1];
    if (ref.startsWith('/') && assetExtensions.test(ref)) refs.add(ref);
  }

  for (const ref of refs) {
    if (ref.includes('${')) continue;
    if (!assetExtensions.test(ref)) continue;
    const diskPath = path.join(publicDir, ref.replace(/^\/(?:assets|images|icons)\//, (match) => match.slice(1)));
    if (!existsSync(diskPath)) {
      findings.push({
        file: path.relative(root, filePath),
        ref,
      });
    }
  }
}

await walk(root);

await readdir(path.join(publicDir, 'assets')).catch(() => {});

const report = {
  generatedAt: new Date().toISOString(),
  findings,
};
await import('node:fs/promises').then(({ mkdir, writeFile }) =>
  mkdir(path.join(root, 'qa-results'), { recursive: true }).then(() =>
    writeFile(path.join(root, 'qa-results', 'asset-audit.json'), JSON.stringify(report, null, 2))
  )
);

if (findings.length) {
  console.log(`Asset audit: ${findings.length} missing reference(s)`);
  for (const finding of findings) console.log(`- ${finding.file}: ${finding.ref}`);
  process.exitCode = 1;
} else {
  console.log('Asset audit: no missing direct asset references found');
}
