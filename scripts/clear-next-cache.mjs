import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const nextDir = path.join(repoRoot, '.next');

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Cleared stale .next cache.');
} catch (error) {
  console.warn('Could not clear stale .next cache:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
