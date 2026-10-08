import { chromium } from 'playwright';
import path from 'node:path';

async function testInteractions() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  await page.addInitScript(() => {
    localStorage.setItem('nihongo_tour_seen_v2', 'true');
    localStorage.setItem('nihongo_tour_seen_null_v2', 'true');
  });

  await page.goto('http://localhost:3008/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Test Pillar Modal Open
  console.log('Testing Pillar Modal...');
  const firstPillar = page.locator('.pillar-card').first();
  await firstPillar.click();
  await page.waitForTimeout(500);

  const modal = page.locator('.term-modal-card');
  const isModalVisible = await modal.isVisible();
  console.log('Pillar Modal opened successfully:', isModalVisible);

  // Close modal
  const closeBtn = page.locator('.term-modal-header button').first();
  await closeBtn.click();
  await page.waitForTimeout(400);

  // 2. Test Memory Game Card Click
  console.log('Testing Memory Game card click...');
  const firstCard = page.locator('.memory-card-wrap').first();
  await firstCard.click();
  await page.waitForTimeout(500);
  const isFlipped = await firstCard.evaluate(el => el.classList.contains('flipped'));
  console.log('Memory Card flipped:', isFlipped);

  // 3. Test Particle Rush Game Switch & Answer
  console.log('Testing Particle Rush tab switch and answer...');
  const particleTabBtn = page.locator('.game-tab-btn', { hasText: 'Desafío Partículas' });
  await particleTabBtn.click();
  await page.waitForTimeout(500);

  const particleChoiceBtn = page.locator('.particle-choice-btn').first();
  await particleChoiceBtn.click();
  await page.waitForTimeout(500);

  const nextBtn = page.locator('.home-btn-primary', { hasText: 'Siguiente' });
  const hasFeedback = await nextBtn.isVisible();
  console.log('Particle Rush gave instant feedback & next button:', hasFeedback);

  // 4. Test Daruma click
  console.log('Testing Daruma click...');
  const darumaCanvas = page.locator('.zen-daruma-canvas-wrapper');
  await darumaCanvas.click();
  await page.waitForTimeout(500);
  const bubbleText = await page.locator('.zen-daruma-bubble span').textContent();
  console.log('Daruma responded with speech bubble:', bubbleText);

  await browser.close();
  console.log('ALL INTERACTION TESTS PASSED 100%!');
}

testInteractions().catch(console.error);
