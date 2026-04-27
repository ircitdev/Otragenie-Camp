// Playwright screenshot capture script for /v3 landing page
const { chromium } = require('D:/DevTools/NodeJS/global_modules/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/v3';
const OUT_DIR = 'D:/DevTools/Database/2026Otraghenie/Otragenie-Camp/public/qa-screenshots';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  // --- Desktop full page & sections ---
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Dump page structure info first
  const structure = await page.evaluate(() => {
    const info = {};
    info.sectionIds = Array.from(document.querySelectorAll('section[id], div[id], main[id]')).map(el => ({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      offsetTop: el.offsetTop,
      height: el.offsetHeight,
      className: el.className.slice(0, 100),
    }));
    info.allSections = Array.from(document.querySelectorAll('section')).map((el, i) => ({
      index: i,
      id: el.id || '(no id)',
      offsetTop: el.offsetTop,
      height: el.offsetHeight,
      firstHeading: (el.querySelector('h1,h2,h3') || {}).textContent?.trim().slice(0, 60) || '',
    }));
    info.headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 30).map(el => ({
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().slice(0, 80),
    }));
    info.bodyBg = getComputedStyle(document.body).backgroundColor;
    info.bodyFont = getComputedStyle(document.body).fontFamily;
    info.scrollHeight = document.body.scrollHeight;
    info.clientWidth = document.body.clientWidth;
    return info;
  });

  fs.writeFileSync(path.join(OUT_DIR, 'v3-structure.json'), JSON.stringify(structure, null, 2));
  console.log('Page height:', structure.scrollHeight, 'px');
  console.log('Section IDs found:', structure.sectionIds.map(s => '#' + s.id).join(', '));
  console.log('All sections:\n  ' + structure.allSections.map(s => `[${s.index}] #${s.id} "${s.firstHeading}"`).join('\n  '));

  // Full page screenshot
  await page.screenshot({ path: path.join(OUT_DIR, 'v3-full-page-desktop.png'), fullPage: true });
  results.push({ name: 'v3-full-page-desktop', status: 'OK' });

  // Above the fold
  await page.screenshot({ path: path.join(OUT_DIR, 'v3-hero-fold.png'), fullPage: false });
  results.push({ name: 'v3-hero-fold', status: 'OK' });

  // Capture sections by ID
  const sections = [
    { selector: '#hero',           name: 'v3-01-hero' },
    { selector: '#journey',        name: 'v3-02-journey' },
    { selector: '#about',          name: 'v3-03-about' },
    { selector: '#pains',          name: 'v3-04-pains' },
    { selector: '#system-problem', name: 'v3-05-system-problem' },
    { selector: '#what-happens',   name: 'v3-06-what-happens' },
    { selector: '#authors',        name: 'v3-07-authors' },
    { selector: '#location',       name: 'v3-08-location' },
    { selector: '#testimonials',   name: 'v3-09-testimonials' },
    { selector: '#pricing',        name: 'v3-10-pricing' },
    { selector: '#faq',            name: 'v3-11-faq' },
    { selector: 'footer',          name: 'v3-12-footer' },
    { selector: 'header, nav',     name: 'v3-00-header' },
  ];

  for (const sec of sections) {
    try {
      const el = await page.$(sec.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await el.screenshot({ path: path.join(OUT_DIR, sec.name + '.png') });
        const bbox = await el.boundingBox();
        results.push({ name: sec.name, status: 'OK', selector: sec.selector, height: bbox?.height });
      } else {
        results.push({ name: sec.name, status: 'SELECTOR_NOT_FOUND', selector: sec.selector });
        console.log('NOT FOUND:', sec.selector);
      }
    } catch (e) {
      results.push({ name: sec.name, status: 'ERROR', error: e.message });
    }
  }

  // Capture all sections by index (fallback)
  const sectionCount = await page.evaluate(() => document.querySelectorAll('section').length);
  console.log('Total <section> elements:', sectionCount);
  for (let i = 0; i < sectionCount; i++) {
    try {
      const el = await page.$(`section:nth-of-type(${i + 1})`);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await el.screenshot({ path: path.join(OUT_DIR, `v3-section-${String(i).padStart(2,'0')}.png`) });
        results.push({ name: `v3-section-${i}`, status: 'OK' });
      }
    } catch (e) {
      results.push({ name: `v3-section-${i}`, status: 'ERROR', error: e.message });
    }
  }

  // Scroll viewport captures
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewHeight = 900;
  const numScrolls = Math.ceil(pageHeight / viewHeight);
  console.log(`Taking ${numScrolls} scroll screenshots...`);

  for (let i = 0; i < numScrolls; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * viewHeight);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT_DIR, `v3-scroll-${String(i).padStart(2, '0')}.png`) });
    results.push({ name: `v3-scroll-${i}`, status: 'OK', scrollY: i * viewHeight });
  }

  // --- Mobile ---
  const mobile = await browser.newPage();
  await mobile.setViewportSize({ width: 375, height: 812 });
  await mobile.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await mobile.waitForTimeout(2000);
  await mobile.screenshot({ path: path.join(OUT_DIR, 'v3-mobile-hero.png'), fullPage: false });
  await mobile.screenshot({ path: path.join(OUT_DIR, 'v3-mobile-full.png'), fullPage: true });
  results.push({ name: 'v3-mobile-full', status: 'OK' });

  // --- Tablet ---
  const tablet = await browser.newPage();
  await tablet.setViewportSize({ width: 768, height: 1024 });
  await tablet.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await tablet.waitForTimeout(2000);
  await tablet.screenshot({ path: path.join(OUT_DIR, 'v3-tablet-full.png'), fullPage: true });
  results.push({ name: 'v3-tablet-full', status: 'OK' });

  fs.writeFileSync(path.join(OUT_DIR, 'v3-test-results.json'), JSON.stringify({ results, capturedAt: new Date().toISOString() }, null, 2));

  const failures = results.filter(r => r.status !== 'OK');
  console.log('\nDONE. Screenshots saved to:', OUT_DIR);
  console.log('Failures:', failures.length, '/', results.length);
  if (failures.length) console.log('Failed:', JSON.stringify(failures, null, 2));

  await browser.close();
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
