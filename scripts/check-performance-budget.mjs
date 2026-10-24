import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const optimizedBackground = path.join(root, 'public/assets/.optimized/images/plain-bg.webp');
const backgroundBytes = fs.statSync(optimizedBackground).size;
const serviceWorker = read('public/sw.js');
const head = read('app/head.tsx');
const backgrounds = read('components/AppBackground.tsx');
const maxBackgroundBytes = 20 * 1024;

if (backgroundBytes > maxBackgroundBytes) {
  throw new Error(`Optimized app background is ${backgroundBytes} bytes; maximum is ${maxBackgroundBytes}.`);
}

if (!/replace\(\/\\\.\(\?:png\|jpe\?g\)\$\/i, '\.webp'\)/.test(serviceWorker)) {
  throw new Error('The service worker must rewrite PNG and JPEG images to their optimized WebP paths.');
}

if (!/if \(!isPublicAsset\) return;/.test(serviceWorker) || /_next\/static/.test(serviceWorker)) {
  throw new Error('The service worker must not cache Next.js chunks, which can become stale across builds.');
}

if (/rel="preload"[^>]*as="image"/.test(head)) {
  throw new Error('Page-specific images must not be preloaded globally on every route.');
}

if (/\/assets\/images\/plain-bg\.png/.test(backgrounds)) {
  throw new Error('App backgrounds must use the optimized WebP instead of the original PNG.');
}

console.log(`Critical app background is within budget (${backgroundBytes} / ${maxBackgroundBytes} bytes); global image preloads are disabled.`);
