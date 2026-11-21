import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3000';
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

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

async function runFlagmaster(page) {
  await page.goto(`${baseUrl}/games/flagmaster`, { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.locator('.fm-btn-expedition').first().click({ force: true });
  await page.locator('.fm-field-input').nth(0).fill('QA Explorer');
  await page.locator('.fm-field-input').nth(1).fill('12');
  await page.locator('select.fm-field-input').selectOption('US');
  await page.locator('.fm-btn-expedition').last().click({ force: true });
  await page.waitForTimeout(500);

  if (await page.getByRole('button', { name: /Enter Mission Map/ }).count()) {
    await page.getByRole('button', { name: /Enter Mission Map/ }).click({ force: true });
  }
  await page.waitForTimeout(300);
  if (await page.locator('.fm-region-btn').count()) {
    await page.locator('.fm-region-btn').nth(0).click({ force: true });
  }
  await page.waitForTimeout(500);

  for (let index = 0; index < 20; index += 1) {
    const option = page.locator('.fm-option-btn:not([disabled])').first();
    if (!(await option.count())) {
      await page.waitForTimeout(1700);
      if (await page.locator('.fm-map-frame').count()) break;
      continue;
    }
    await option.click({ force: true });
    await page.waitForTimeout(1550);
  }

  return await page.locator('.fm-map-frame').count()
    + await page.getByText(/WORLD PROGRESSION|EXPEDITION PROGRESS/i).count();
}

async function main() {
  await mkdir(new URL('../qa-results/', import.meta.url), { recursive: true });
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
    const browser = await chromium.launch({ headless: true });
    const findings = [];

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await context.addInitScript(() => {
        localStorage.setItem('guestUser', 'true');
        localStorage.removeItem('currentUser');
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 300));
      });
      page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 300)));

      let completed = false;
      try {
        completed = (await runFlagmaster(page)) > 0;
      } catch (error) {
        pageErrors.push(String(error).slice(0, 300));
      }

      const layout = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        cardBottom: document.querySelector('.fm-card')?.getBoundingClientRect().bottom ?? null,
        viewportHeight: window.innerHeight,
      }));

      const issues = [];
      if (!completed) issues.push('Flagmaster did not reach world progression');
      if (pageErrors.length) issues.push(...pageErrors);
      if (consoleErrors.length) issues.push(...consoleErrors);
      if (layout.horizontalOverflow) issues.push(`Horizontal overflow: ${layout.documentWidth}px > ${layout.viewportWidth}px`);

      await page.screenshot({
        path: new URL(`../qa-results/flagmaster-${viewport.name}.png`, import.meta.url).pathname,
        fullPage: true,
      });

      if (issues.length) findings.push({ viewport: viewport.name, issues });
      await context.close();
    }

    await browser.close();
    const report = { generatedAt: new Date().toISOString(), findings };
    await writeFile(new URL('../qa-results/flagmaster-featured.json', import.meta.url), JSON.stringify(report, null, 2));

    console.log(`Flagmaster featured QA: ${viewports.length - findings.length}/${viewports.length} viewports passed`);
    for (const finding of findings) console.log(`- ${finding.viewport}: ${finding.issues.join(' | ')}`);
    if (findings.length) process.exitCode = 1;
  } finally {
    if (server) server.kill('SIGTERM');
  }
}

await main();
