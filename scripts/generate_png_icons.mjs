import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function generateIcons() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const page = await browser.newPage();
  const iconSvgPath = path.resolve('public/icons/icon.svg');
  const maskableSvgPath = path.resolve('public/icons/maskable-icon.svg');

  const iconSvg = fs.readFileSync(iconSvgPath, 'utf8');
  const maskableSvg = fs.readFileSync(maskableSvgPath, 'utf8');

  const iconHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>${iconSvg}</body>
    </html>
  `;

  const maskableHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>${maskableSvg}</body>
    </html>
  `;

  const sizes = [
    { name: 'public/icons/icon-512x512.png', size: 512, html: iconHtml },
    { name: 'public/icons/icon-384x384.png', size: 384, html: iconHtml },
    { name: 'public/icons/icon-192x192.png', size: 192, html: iconHtml },
    { name: 'public/icons/icon-152x152.png', size: 152, html: iconHtml },
    { name: 'public/icons/icon-144x144.png', size: 144, html: iconHtml },
    { name: 'public/icons/icon-128x128.png', size: 128, html: iconHtml },
    { name: 'public/icons/icon-96x96.png', size: 96, html: iconHtml },
    { name: 'public/icons/icon-72x72.png', size: 72, html: iconHtml },
    { name: 'public/icons/apple-touch-icon.png', size: 180, html: iconHtml },
    { name: 'public/apple-touch-icon.png', size: 180, html: iconHtml },
    { name: 'public/icons/favicon-32x32.png', size: 32, html: iconHtml },
    { name: 'public/icons/favicon-16x16.png', size: 16, html: iconHtml },
    { name: 'public/favicon.png', size: 48, html: iconHtml },
    { name: 'public/icons/maskable-icon-512x512.png', size: 512, html: maskableHtml },
    { name: 'public/icons/maskable-icon-192x192.png', size: 192, html: maskableHtml }
  ];

  for (const item of sizes) {
    await page.setViewportSize({ width: item.size, height: item.size });
    await page.setContent(item.html, { waitUntil: 'load' });
    const dest = path.resolve(item.name);
    await page.screenshot({ path: dest, omitBackground: true });
    console.log(`Generated: ${item.name} (${item.size}x${item.size})`);
  }

  // Copy favicon.png to favicon.ico
  fs.copyFileSync(path.resolve('public/favicon.png'), path.resolve('public/favicon.ico'));
  console.log('Copied favicon.png to favicon.ico');

  await browser.close();
  console.log('All Daruma PNG icons generated successfully!');
}

generateIcons().catch(console.error);
