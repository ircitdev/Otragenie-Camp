// UI audit screenshot capture for production /v3
const { chromium } = require('D:/DevTools/NodeJS/global_modules/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://otragenie-camp.ru/v3';
const OUT_DIR = 'D:/DevTools/Database/2026Otraghenie/Otragenie-Camp/public/qa-audit';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Disable smooth scroll for clean captures
  await page.addStyleTag({ content: 'html, body { scroll-behavior: auto !important; } *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }' });

  const structure = await page.evaluate(() => {
    return {
      sections: Array.from(document.querySelectorAll('section')).map((el, i) => ({
        index: i,
        id: el.id || '(no id)',
        offsetTop: el.offsetTop,
        height: el.offsetHeight,
        bg: getComputedStyle(el).backgroundColor,
        firstHeading: (el.querySelector('h1,h2,h3') || {}).textContent?.trim().slice(0, 80) || '',
      })),
      scrollHeight: document.body.scrollHeight,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  fs.writeFileSync(path.join(OUT_DIR, 'structure.json'), JSON.stringify(structure, null, 2));
  console.log('Sections found:', structure.sections.length, 'Total height:', structure.scrollHeight);

  // Full page
  await page.screenshot({ path: path.join(OUT_DIR, '00-full.png'), fullPage: true });

  // Each section captured at its position
  for (const s of structure.sections) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, s.offsetTop - 20));
    await page.waitForTimeout(800);
    const fname = `sec-${String(s.index).padStart(2,'0')}-${(s.id || 'noid').slice(0,20)}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, fname) });
    console.log(' shot', fname, '@', s.offsetTop, 'h', s.height, '·', s.firstHeading.slice(0,50));
  }

  // Mobile
  const mob = await browser.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await mob.waitForTimeout(2000);
  await mob.addStyleTag({ content: 'html, body { scroll-behavior: auto !important; } *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }' });
  await mob.screenshot({ path: path.join(OUT_DIR, 'mobile-full.png'), fullPage: true });
  await mob.screenshot({ path: path.join(OUT_DIR, 'mobile-fold.png') });

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error(e); process.exit(1); });
