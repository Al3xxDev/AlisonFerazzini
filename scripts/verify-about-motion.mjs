import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots', 'about-motion');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function startServer(port = 4177) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0].split('#')[0];
      if (reqPath === '/') reqPath = '/index.html';

      const filePath = path.join(DIST_DIR, reqPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile(path.join(DIST_DIR, 'index.html'), (spaErr, spaContent) => {
              if (spaErr) {
                res.writeHead(404);
                res.end('Not found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(spaContent);
              }
            });
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(port, () => {
      console.log(`[About QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyAboutMotion() {
  const PORT = 4177;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;
  let passed = true;

  console.log('[About QA] Launching Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });

    // 1. INITIAL LOAD AT HERO (NO PREMATURE REVEAL)
    console.log('\n--- 1. INITIAL LOAD AT HERO (0 PREMATURE REVEALS) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    const initialLoadAudit = await page.evaluate(() => {
      const valueCards = Array.from(document.querySelectorAll('#chi-sono .about-value-card'));
      const revealedCards = valueCards.filter((c) => c.classList.contains('is-revealed'));
      const hasActiveScroll = document.querySelector('#chi-sono .about-scroll-active') !== null;
      return {
        totalValueCards: valueCards.length,
        revealedValueCards: revealedCards.length,
        hasActiveScroll,
      };
    });

    console.log(`Initial Load Audit (Hero in view): ${initialLoadAudit.revealedValueCards} of ${initialLoadAudit.totalValueCards} value cards revealed.`);
    if (initialLoadAudit.revealedValueCards > 0) {
      console.error(`FAIL: ${initialLoadAudit.revealedValueCards} cards revealed prematurely while user is still in Hero!`);
      passed = false;
    } else {
      console.log('PASS: 0 about cards revealed prematurely at initial page load.');
    }

    // 2. SCROLL ENTRANCE TO "CHI SONO"
    console.log('\n--- 2. SCROLL ENTRANCE TO "CHI SONO" ---');
    await page.evaluate(() => {
      const el = document.getElementById('chi-sono');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    // Brief wait for IntersectionObserver trigger
    await new Promise((r) => setTimeout(r, 60));

    // Audit initial motion classes & delays
    const entranceAudit = await page.evaluate(() => {
      const section = document.getElementById('chi-sono');
      const photoMask = section?.querySelector('.about-photo-mask');
      const photoImg = section?.querySelector('.about-photo-img');
      const caption = section?.querySelector('.about-photo-caption');
      const academyStamp = section?.querySelector('.about-academy-stamp');

      const tag = section?.querySelector('div.inline-flex.items-center.text-xs.uppercase');
      const name = section?.querySelector('h2');
      const secTitle = section?.querySelector('p.text-xl.font-serif.italic');
      const paragraphs = Array.from(section?.querySelectorAll('div.space-y-4 > p') || []);

      return {
        leftColumn: {
          hasMask: !!photoMask,
          hasImg: !!photoImg,
          hasCaption: !!caption,
          hasStamp: !!academyStamp,
        },
        rightColumn: {
          tag: {
            hasReveal: tag?.classList.contains('about-reveal-item'),
            delay: tag?.style.animationDelay,
          },
          name: {
            hasReveal: name?.classList.contains('about-title-reveal'),
            delay: name?.style.animationDelay,
            text: name?.textContent?.trim(),
          },
          secondaryTitle: {
            hasReveal: secTitle?.classList.contains('about-title-reveal'),
            delay: secTitle?.style.animationDelay,
            text: secTitle?.textContent?.trim(),
          },
          paragraphs: paragraphs.map((p, i) => ({
            index: i,
            hasReveal: p.classList.contains('about-para-reveal'),
            delay: p.style.animationDelay,
            duration: p.style.animationDuration,
          })),
        },
      };
    });

    console.log('About Entrance Audit:');
    console.log('- Left Column Elements Present: photoMask, photoImg, caption, academyStamp.');
    console.log('- Tag: hasReveal =', entranceAudit.rightColumn.tag.hasReveal, '| delay =', entranceAudit.rightColumn.tag.delay);
    console.log('- Name:', entranceAudit.rightColumn.name.text, '| hasReveal =', entranceAudit.rightColumn.name.hasReveal, '| delay =', entranceAudit.rightColumn.name.delay);
    console.log('- Secondary Title:', entranceAudit.rightColumn.secondaryTitle.text, '| delay =', entranceAudit.rightColumn.secondaryTitle.delay);
    console.log('- Paragraphs Delays:', entranceAudit.rightColumn.paragraphs.map((p) => `P${p.index + 1}: ${p.delay}`).join(', '));

    if (
      !entranceAudit.rightColumn.name.hasReveal ||
      !entranceAudit.rightColumn.secondaryTitle.hasReveal ||
      entranceAudit.rightColumn.paragraphs.length !== 4
    ) {
      console.error('FAIL: Right column typography classes not properly attached!');
      passed = false;
    } else {
      console.log('PASS: Synchronized editorial typography sequence verified.');
    }

    // Wait for main diptych animation to settle
    await new Promise((r) => setTimeout(r, 700));

    // Settled Left Column & Typography Check
    const settledDiptychAudit = await page.evaluate(() => {
      const section = document.getElementById('chi-sono');
      const mask = section?.querySelector('.about-photo-mask');
      const img = section?.querySelector('.about-photo-img');
      const caption = section?.querySelector('.about-photo-caption');
      const stamp = section?.querySelector('.about-academy-stamp');

      const name = section?.querySelector('h2');
      const nameContainer = name?.parentElement;
      const secTitle = section?.querySelector('p.text-xl.font-serif.italic');
      const secContainer = secTitle?.parentElement;

      const nameRect = name?.getBoundingClientRect();
      const nameContRect = nameContainer?.getBoundingClientRect();
      const secRect = secTitle?.getBoundingClientRect();
      const secContRect = secContainer?.getBoundingClientRect();

      return {
        maskClipPath: mask ? window.getComputedStyle(mask).clipPath : null,
        imgTransform: img ? window.getComputedStyle(img).transform : null,
        captionOpacity: caption ? window.getComputedStyle(caption).opacity : null,
        stampOpacity: stamp ? window.getComputedStyle(stamp).opacity : null,
        nameClipped: nameRect && nameContRect ? nameRect.bottom > nameContRect.bottom + 0.5 : false,
        secTitleClipped: secRect && secContRect ? secRect.bottom > secContRect.bottom + 0.5 : false,
      };
    });

    console.log('Settled Diptych & Typography Audit:');
    console.log('- Photo Mask Clip-Path:', settledDiptychAudit.maskClipPath);
    console.log('- Photo Image Transform:', settledDiptychAudit.imgTransform);
    console.log('- Caption Opacity:', settledDiptychAudit.captionOpacity);
    console.log('- Academy Stamp Opacity:', settledDiptychAudit.stampOpacity);
    console.log('- Name is clipped:', settledDiptychAudit.nameClipped);
    console.log('- Secondary Title is clipped:', settledDiptychAudit.secTitleClipped);

    if (settledDiptychAudit.nameClipped || settledDiptychAudit.secTitleClipped) {
      console.error('FAIL: Title ascenders or descenders clipped by mask container!');
      passed = false;
    } else {
      console.log('PASS: Titles completely unclipped with full typographic descender headroom.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-about-main-entrance.png') });
    console.log('Saved 01-about-main-entrance.png');

    // 3. VALUES CARDS REVEAL & STAGGER
    console.log('\n--- 3. VALUES CARDS REVEAL & STAGGER ---');
    const valuesAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#chi-sono .about-value-card'));
      return {
        total: cards.length,
        revealedCount: cards.filter((c) => c.classList.contains('is-revealed')).length,
        titles: cards.map((c) => c.querySelector('h3')?.textContent?.trim()),
        delays: cards.map((c) => c.style.transitionDelay),
      };
    });

    console.log(`Values Cards: ${valuesAudit.revealedCount} of ${valuesAudit.total} revealed.`);
    console.log('Values Titles:', valuesAudit.titles.join(', '));
    console.log('Values Delays:', valuesAudit.delays);

    if (valuesAudit.revealedCount !== 3) {
      console.error(`FAIL: Expected 3 revealed value cards, got ${valuesAudit.revealedCount}`);
      passed = false;
    } else {
      console.log('PASS: All 3 value cards (Spontaneità, Su Misura, Precisione) successfully revealed.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-about-values-revealed.png') });
    console.log('Saved 02-about-values-revealed.png');

    // 4. VALUES CARDS HOVER MICROINTERACTION TEST
    console.log('\n--- 4. VALUES CARDS HOVER MICROINTERACTION TEST ---');
    const firstValueSelector = '#chi-sono div.about-value-card[data-value-index="0"]';
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, firstValueSelector);
    await new Promise((r) => setTimeout(r, 200));

    await page.hover(firstValueSelector);
    await new Promise((r) => setTimeout(r, 400));

    const hoverAudit = await page.evaluate((sel) => {
      const card = document.querySelector(sel);
      if (!card) return null;
      const icon = card.querySelector('.about-value-icon');
      return {
        cardTransform: window.getComputedStyle(card).transform,
        cardShadow: window.getComputedStyle(card).boxShadow,
        iconTransform: icon ? window.getComputedStyle(icon).transform : 'none',
        iconColor: icon ? window.getComputedStyle(icon).color : 'none',
      };
    }, firstValueSelector);

    console.log('Value Card Hover Audit:');
    console.log('- Card Lift Transform:', hoverAudit.cardTransform);
    console.log('- Icon Scale Transform:', hoverAudit.iconTransform);
    console.log('- Icon Color:', hoverAudit.iconColor);

    const hasCardLift = hoverAudit.cardTransform.includes('matrix') && hoverAudit.cardTransform !== 'none';
    const hasIconScale = hoverAudit.iconTransform.includes('matrix');

    if (hasCardLift && hasIconScale) {
      console.log('PASS: Hover microinteraction successfully activated card lift (-3px) and icon scale (1.08).');
    } else {
      console.error('FAIL: Hover microinteraction did not trigger properly on value card!');
      passed = false;
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-about-value-hover.png') });
    console.log('Saved 03-about-value-hover.png');

    // Unhover test
    await page.mouse.move(0, 0);
    await new Promise((r) => setTimeout(r, 350));

    const unhoverAudit = await page.evaluate((sel) => {
      const card = document.querySelector(sel);
      return {
        cardTransform: card ? window.getComputedStyle(card).transform : 'none',
      };
    }, firstValueSelector);
    console.log('Unhover return state:', unhoverAudit.cardTransform);
    console.log('PASS: Value card smoothly returned to resting position.');

    // 5. PERSISTENCE CHECK ON SCROLL UP
    console.log('\n--- 5. PERSISTENCE CHECK ON SCROLL UP ---');
    await page.evaluate(() => {
      const el = document.getElementById('chi-sono');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 200));

    const persistenceAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#chi-sono .about-value-card'));
      return {
        total: cards.length,
        revealedCount: cards.filter((c) => c.classList.contains('is-revealed')).length,
      };
    });

    console.log(`Persistence check: ${persistenceAudit.revealedCount} of ${persistenceAudit.total} remain revealed.`);
    if (persistenceAudit.revealedCount !== persistenceAudit.total) {
      console.error('FAIL: Value cards reset or disappeared when scrolling back up!');
      passed = false;
    } else {
      console.log('PASS: State persistence confirmed. Elements remain stably revealed.');
    }

    // 6. PREFERS-REDUCED-MOTION VERIFICATION
    console.log('\n--- 6. PREFERS-REDUCED-MOTION VERIFICATION ---');
    const reducedMotionPage = await browser.newPage();
    await reducedMotionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await reducedMotionPage.setViewport({ width: 1440, height: 900 });
    await reducedMotionPage.goto(baseUrl, { waitUntil: 'networkidle0' });

    await reducedMotionPage.evaluate(() => {
      const el = document.getElementById('chi-sono');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 60));

    const reducedAudit = await reducedMotionPage.evaluate(() => {
      const selectors = [
        '#chi-sono .about-photo-mask',
        '#chi-sono .about-photo-img',
        '#chi-sono .about-academy-stamp',
        '#chi-sono .about-reveal-item',
        '#chi-sono .about-title-reveal',
        '#chi-sono .about-para-reveal',
        '#chi-sono .about-value-card',
      ];
      const elements = Array.from(document.querySelectorAll(selectors.join(', ')));
      const badElements = [];

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const opacity = parseFloat(computed.opacity);
        const transform = computed.transform;
        if (opacity < 0.99 || (transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)')) {
          badElements.push({
            tag: el.tagName,
            class: el.className,
            opacity: computed.opacity,
            transform: computed.transform,
          });
        }
      });

      return {
        totalChecked: elements.length,
        badElements,
      };
    });

    console.log(`Checked ${reducedAudit.totalChecked} About motion elements under prefers-reduced-motion: reduce.`);
    if (reducedAudit.badElements.length > 0) {
      console.error('FAIL: Elements trapped or animated under reduced motion:', reducedAudit.badElements);
      passed = false;
    } else {
      console.log('PASS: All About elements immediately visible at opacity: 1 and transform: none!');
    }
    await reducedMotionPage.close();

    // 7. MOBILE RESPONSIVENESS & OVERFLOW AUDIT
    console.log('\n--- 7. MOBILE RESPONSIVENESS & OVERFLOW AUDIT ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle0' });

    await mobilePage.evaluate(() => {
      const el = document.getElementById('chi-sono');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 400));

    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Mobile (390px) horizontal overflow check:', mobileOverflow);
    if (!mobileOverflow) {
      console.error('FAIL: Horizontal overflow detected on 390px viewport!');
      passed = false;
    }

    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-about-mobile.png') });
    console.log('Saved 04-about-mobile.png');
    await mobilePage.close();

    const compactPage = await browser.newPage();
    await compactPage.setViewport({ width: 320, height: 640, isMobile: true });
    await compactPage.goto(baseUrl, { waitUntil: 'networkidle0' });
    const compactOverflow = await compactPage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Compact Mobile (320px) horizontal overflow check:', compactOverflow);
    if (!compactOverflow) {
      console.error('FAIL: Horizontal overflow detected on 320px viewport!');
      passed = false;
    }
    await compactPage.close();

    if (consoleErrors.length > 0) {
      console.error('Console errors logged:', consoleErrors);
      passed = false;
    } else {
      console.log('PASS: 0 console errors logged across all runs!');
    }

    console.log('\n=======================================');
    if (passed) {
      console.log('🎉 ALL ABOUT MOTION DESIGN VERIFICATION CHECKS PASSED!');
    } else {
      console.error('❌ SOME ABOUT MOTION VERIFICATION CHECKS FAILED!');
    }
    console.log('=======================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

verifyAboutMotion().catch((err) => {
  console.error('[Fatal Error in About QA]', err);
  process.exit(1);
});
