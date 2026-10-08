import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function run() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const outDir = path.resolve('reports/evidence');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Mobile Screenshot (Dark mode)
  const mobileDarkContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobileDarkPage = await mobileDarkContext.newPage();
  
  await mobileDarkPage.addInitScript(() => {
    localStorage.setItem('nihongo_tour_seen_v2', 'true');
    localStorage.setItem('nihongo_tour_seen_null_v2', 'true');
    localStorage.setItem('nihongo_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  await mobileDarkPage.goto('http://localhost:3008/', { waitUntil: 'networkidle' });
  await mobileDarkPage.waitForTimeout(1500);

  await mobileDarkPage.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
  });
  await mobileDarkPage.waitForTimeout(500);
  await mobileDarkPage.screenshot({ path: path.join(outDir, 'home_mobile_dark_clean.png'), fullPage: true });

  // 2. Mobile Screenshot (Light mode)
  const mobileLightContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobileLightPage = await mobileLightContext.newPage();
  await mobileLightPage.addInitScript(() => {
    localStorage.setItem('nihongo_tour_seen_v2', 'true');
    localStorage.setItem('nihongo_tour_seen_null_v2', 'true');
    localStorage.setItem('nihongo_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await mobileLightPage.goto('http://localhost:3008/', { waitUntil: 'networkidle' });
  await mobileLightPage.waitForTimeout(1500);
  await mobileLightPage.evaluate(() => {
    document.body.setAttribute('data-theme', 'light');
  });
  await mobileLightPage.waitForTimeout(500);
  await mobileLightPage.screenshot({ path: path.join(outDir, 'home_mobile_light_clean.png'), fullPage: true });

  // 3. Desktop Screenshot (Dark mode)
  const desktopDarkContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopDarkPage = await desktopDarkContext.newPage();
  await desktopDarkPage.addInitScript(() => {
    localStorage.setItem('nihongo_tour_seen_v2', 'true');
    localStorage.setItem('nihongo_tour_seen_null_v2', 'true');
    localStorage.setItem('nihongo_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await desktopDarkPage.goto('http://localhost:3008/', { waitUntil: 'networkidle' });
  await desktopDarkPage.waitForTimeout(1500);
  await desktopDarkPage.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
  });
  await desktopDarkPage.waitForTimeout(500);
  await desktopDarkPage.screenshot({ path: path.join(outDir, 'home_desktop_dark_clean.png'), fullPage: true });

  // 4. Desktop Screenshot (Light mode)
  const desktopLightContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopLightPage = await desktopLightContext.newPage();
  await desktopLightPage.addInitScript(() => {
    localStorage.setItem('nihongo_tour_seen_v2', 'true');
    localStorage.setItem('nihongo_tour_seen_null_v2', 'true');
    localStorage.setItem('nihongo_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await desktopLightPage.goto('http://localhost:3008/', { waitUntil: 'networkidle' });
  await desktopLightPage.waitForTimeout(1500);
  await desktopLightPage.evaluate(() => {
    document.body.setAttribute('data-theme', 'light');
  });
  await desktopLightPage.waitForTimeout(500);
  await desktopLightPage.screenshot({ path: path.join(outDir, 'home_desktop_light_clean.png'), fullPage: true });

  await browser.close();
  console.log('Clean screenshots captured successfully!');
}

run().catch(console.error);
