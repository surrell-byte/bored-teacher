import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3000';
const resultsDir = new URL('../qa-results/', import.meta.url);

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short-landscape', width: 844, height: 390 },
];

const viewportFilter = process.env.QA_VIEWPORT;
const activeViewports = viewportFilter
  ? viewports.filter((viewport) => viewport.name === viewportFilter)
  : viewports;
const gameFilter = process.env.QA_GAME_IDS
  ? new Set(process.env.QA_GAME_IDS.split(',').map((id) => id.trim()).filter(Boolean))
  : null;

function parseCatalogIds(source) {
  const match = source.match(/GAME_CATALOG[^{]*=\s*\{([\s\S]*?)\n\};/);
  if (!match) return [];
  return [...match[1].matchAll(/^  (\w+):\s*\{/gm)].map((item) => item[1]);
}

function parseComingSoon(source) {
  const match = source.match(/COMING_SOON_GAME_IDS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!match) return new Set();
  return new Set([...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]));
}

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`QA server did not become ready at ${baseUrl}`);
}

await main();

async function main() {
  await mkdir(resultsDir, { recursive: true });

  let server = null;
  if (!process.env.QA_BASE_URL) {
    server = spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '3000'], {
      cwd: new URL('../', import.meta.url),
      stdio: 'ignore',
      detached: false,
    });
  }

  try {
    await waitForServer();
    const catalog = await readFile(new URL('../games/catalog.data.ts', import.meta.url), 'utf8');
    const access = await readFile(new URL('../config/game-access.ts', import.meta.url), 'utf8');
    const ids = parseCatalogIds(catalog)
      .filter((id) => !parseComingSoon(access).has(id))
      .filter((id) => !gameFilter || gameFilter.has(id));

    const browser = await chromium.launch({ headless: true });
    const findings = [];

    for (const viewport of activeViewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await context.addInitScript(() => {
        localStorage.setItem('guestUser', 'true');
        localStorage.removeItem('currentUser');
      });

      for (const id of ids) {
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedAssets = [];
        const nonOkAssets = [];

        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 300));
        });
        page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 300)));
        page.on('requestfailed', (request) => {
          if (request.resourceType() === 'image' || request.resourceType() === 'media') {
            failedAssets.push(request.url());
          }
        });
        page.on('response', (response) => {
          if (response.status() >= 400 && /\.(?:png|jpe?g|webp|svg|mp3|wav|ogg|avif)$/i.test(new URL(response.url()).pathname)) {
            nonOkAssets.push({ status: response.status(), url: response.url() });
          }
        });

        let status = null;
        let error = null;
        try {
          const response = await page.goto(`${baseUrl}/games/${id}`, { waitUntil: 'domcontentloaded', timeout: 12_000 });
          status = response?.status() ?? null;
          await page.waitForTimeout(700);
        } catch (caught) {
          error = String(caught).slice(0, 300);
        }

        const layout = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          viewportHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight,
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        })).catch(() => null);

        const issues = [];
        if (status && status >= 400) issues.push(`HTTP ${status}`);
        if (error) issues.push(error);
        if (pageErrors.length) issues.push(...pageErrors);
        if (consoleErrors.length) issues.push(...consoleErrors);
        if (failedAssets.length) issues.push(...failedAssets.map((url) => `Failed asset: ${url}`));
        if (nonOkAssets.length) issues.push(...nonOkAssets.map((item) => `Asset ${item.status}: ${item.url}`));
        if (layout?.horizontalOverflow) issues.push(`Horizontal overflow: ${layout.documentWidth}px > ${layout.viewportWidth}px`);

        if (issues.length) findings.push({ id, viewport: viewport.name, issues });
        await page.close();
      }

      await context.close();
    }

    await browser.close();

    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      viewports: activeViewports,
      checkedGames: ids.length,
      findings,
    };
    await writeFile(new URL('game-smoke.json', resultsDir), JSON.stringify(report, null, 2));

    console.log(`QA smoke: checked ${ids.length} games across ${activeViewports.length} viewports`);
    console.log(`Findings: ${findings.length}`);
    for (const finding of findings) {
      console.log(`- ${finding.viewport}/${finding.id}: ${finding.issues.join(' | ')}`);
    }

    if (findings.length) process.exitCode = 1;
  } finally {
    if (server) server.kill('SIGTERM');
  }
}
