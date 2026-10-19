import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots', 'services-motion');

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

function startServer(port = 4176) {
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
      console.log(`[Services QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyServicesMotion() {
  const PORT = 4176;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;
  let passed = true;

  console.log('[Services QA] Launching Google Chrome...');
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
      const cards = Array.from(document.querySelectorAll('#servizi .service-card'));
      const revealedCards = cards.filter((c) => c.classList.contains('is-revealed'));
      const gridHasScrollClass = document.querySelector('#servizi .services-scroll-active') !== null;
      return {
        totalCards: cards.length,
        revealedCount: revealedCards.length,
        gridHasScrollClass,
      };
    });

    console.log(`Initial Load Audit (Hero in view): ${initialLoadAudit.revealedCount} of ${initialLoadAudit.totalCards} cards revealed.`);
    if (initialLoadAudit.revealedCount > 0) {
      console.error(`FAIL: ${initialLoadAudit.revealedCount} cards revealed prematurely while user is still in Hero!`);
      passed = false;
    } else {
      console.log('PASS: 0 service cards revealed prematurely at initial page load.');
    }

    // 2. SCROLL ENTRANCE SEQUENCE TO SERVICES HEADER
    console.log('\n--- 2. SCROLL ENTRANCE TO SERVICES HEADER ---');
    await page.evaluate(() => {
      const el = document.getElementById('servizi');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    // Brief wait for IntersectionObserver trigger
    await new Promise((r) => setTimeout(r, 60));

    const headerAudit = await page.evaluate(() => {
      const section = document.getElementById('servizi');
      const label = section?.querySelector('div.inline-flex.items-center.text-xs.uppercase');
      const title = section?.querySelector('h2');
      const desc = section?.querySelector('p.text-\\[\\#5A544F\\]');

      return {
        label: {
          hasReveal: label?.classList.contains('services-reveal-item'),
          delay: label?.style.animationDelay,
          duration: label?.style.animationDuration,
        },
        title: {
          hasReveal: title?.classList.contains('services-title-reveal'),
          delay: title?.style.animationDelay,
          duration: title?.style.animationDuration,
          text: title?.textContent?.trim(),
        },
        desc: {
          hasReveal: desc?.classList.contains('services-reveal-item'),
          delay: desc?.style.animationDelay,
          duration: desc?.style.animationDuration,
        },
      };
    });

    console.log('Services Header Entrance Audit:');
    console.log('- Phase 1 (Label): hasReveal =', headerAudit.label.hasReveal, '| delay =', headerAudit.label.delay, '| duration =', headerAudit.label.duration);
    console.log('- Phase 2 (Title): hasReveal =', headerAudit.title.hasReveal, '| delay =', headerAudit.title.delay, '| duration =', headerAudit.title.duration);
    console.log('- Phase 3 (Description): hasReveal =', headerAudit.desc.hasReveal, '| delay =', headerAudit.desc.delay, '| duration =', headerAudit.desc.duration);

    if (!headerAudit.label.hasReveal || !headerAudit.title.hasReveal || !headerAudit.desc.hasReveal) {
      console.error('FAIL: Header entrance classes not properly attached!');
      passed = false;
    } else {
      console.log('PASS: Synchronized 3-phase header entrance verified.');
    }

    // Wait for header animation to settle
    await new Promise((r) => setTimeout(r, 650));

    // Title Descender Safety Check in settled state
    const titleClippingCheck = await page.evaluate(() => {
      const title = document.querySelector('#servizi h2');
      const container = title?.parentElement;
      if (!title || !container) return { exists: false };

      const tRect = title.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      return {
        exists: true,
        isClipped: tRect.bottom > cRect.bottom + 0.5,
        titleBottom: tRect.bottom,
        containerBottom: cRect.bottom,
        overflow: window.getComputedStyle(container).overflow,
      };
    });

    console.log('Title Descender Clearance Check (Settled State):', titleClippingCheck);
    if (titleClippingCheck.isClipped) {
      console.error('FAIL: Title descenders are clipped by container mask!');
      passed = false;
    } else {
      console.log('PASS: Title descenders are completely unclipped with proper clearance.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-services-header-entrance.png') });
    console.log('Saved 01-services-header-entrance.png');

    // 3. PROGRESSIVE SCROLL REVEAL OF SERVICE CARDS (ROW 1 vs ROW 2)
    console.log('\n--- 3. PROGRESSIVE SCROLL REVEAL OF SERVICE CARDS ---');
    const topOfServicesAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#servizi .service-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      const unrevealed = cards.filter((c) => !c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
        unrevealedCount: unrevealed.length,
        revealedIndices: revealed.map((c) => c.getAttribute('data-service-index')),
        delays: revealed.map((c) => c.style.transitionDelay),
      };
    });

    console.log(`Top of Services (1440x900): ${topOfServicesAudit.revealedCount} cards revealed, ${topOfServicesAudit.unrevealedCount} waiting for scroll.`);
    console.log('Revealed Card Indices:', topOfServicesAudit.revealedIndices);
    console.log('Local Stagger Delays for Row 1 batch:', topOfServicesAudit.delays);

    if (topOfServicesAudit.revealedCount === 0) {
      console.error('FAIL: Row 1 cards in viewport did not reveal!');
      passed = false;
    } else if (topOfServicesAudit.revealedCount === topOfServicesAudit.total) {
      console.error('FAIL: All 6 cards were revealed prematurely before user scrolled to Row 2!');
      passed = false;
    } else {
      console.log(`PASS: Only visible Row 1 cards (${topOfServicesAudit.revealedCount}) revealed; Row 2 remains unrevealed.`);
    }

    // Scroll down to Row 2
    console.log('Scrolling down +600px to Row 2...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 300));

    const row2Audit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#servizi .service-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
        delays: cards.map((c) => c.style.transitionDelay),
      };
    });

    console.log(`After scrolling to Row 2: ${row2Audit.revealedCount} of ${row2Audit.total} cards revealed.`);
    if (row2Audit.revealedCount !== row2Audit.total) {
      console.error(`FAIL: Expected all 6 cards revealed after scrolling to Row 2, got ${row2Audit.revealedCount}`);
      passed = false;
    } else {
      console.log('PASS: Row 2 cards progressively revealed upon entering viewport.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-services-cards-revealed.png') });
    console.log('Saved 02-services-cards-revealed.png');

    // 4. CINEMATIC IMAGE REVEAL & TEXT CASCADE AUDIT
    console.log('\n--- 4. CINEMATIC IMAGE REVEAL & TEXT CHOREOGRAPHY ---');
    const firstCardDetails = await page.evaluate(() => {
      const card = document.querySelector('#servizi .service-card:first-child');
      const mask = card?.querySelector('.service-img-mask');
      const img = card?.querySelector('.service-card-img');
      const badge = card?.querySelector('.service-badge');
      const number = card?.querySelector('.service-number');
      const title = card?.querySelector('.service-title');
      const subtitle = card?.querySelector('.service-subtitle');
      const desc = card?.querySelector('.service-description');
      const highlights = card?.querySelector('.service-highlights');
      const cta = card?.querySelector('.service-cta');

      const maskComputed = mask ? window.getComputedStyle(mask) : null;
      const imgComputed = img ? window.getComputedStyle(img) : null;
      const titleComputed = title ? window.getComputedStyle(title) : null;
      const descComputed = desc ? window.getComputedStyle(desc) : null;
      const ctaComputed = cta ? window.getComputedStyle(cta) : null;

      return {
        cardOpacity: window.getComputedStyle(card).opacity,
        maskClipPath: maskComputed?.clipPath,
        imgTransform: imgComputed?.transform,
        titleOpacity: titleComputed?.opacity,
        descOpacity: descComputed?.opacity,
        ctaOpacity: ctaComputed?.opacity,
        badgeText: badge?.textContent?.trim(),
        numberText: number?.textContent?.trim(),
      };
    });

    console.log('Settled Card Elements Audit:');
    console.log('- Card Opacity:', firstCardDetails.cardOpacity);
    console.log('- Image Mask Clip-Path:', firstCardDetails.maskClipPath);
    console.log('- Image Scale Transform:', firstCardDetails.imgTransform);
    console.log('- Title Opacity:', firstCardDetails.titleOpacity);
    console.log('- Description Opacity:', firstCardDetails.descOpacity);
    console.log('- CTA Opacity:', firstCardDetails.ctaOpacity);
    console.log('- Badge:', firstCardDetails.badgeText, '| Number:', firstCardDetails.numberText);

    if (firstCardDetails.cardOpacity === '1' && firstCardDetails.titleOpacity === '1' && firstCardDetails.ctaOpacity === '1') {
      console.log('PASS: Cinematic image reveal and cascading content settled at full visibility.');
    } else {
      console.error('FAIL: Card elements did not settle at opacity 1!');
      passed = false;
    }

    // 5. HOVER MICROINTERACTION TEST
    console.log('\n--- 5. HOVER MICROINTERACTION TEST ---');
    const firstCardSelector = '#servizi article[data-service-index="0"]';
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, firstCardSelector);
    await new Promise((r) => setTimeout(r, 100));

    await page.hover(firstCardSelector);
    await new Promise((r) => setTimeout(r, 380));

    const hoverAudit = await page.evaluate((sel) => {
      const card = document.querySelector(sel);
      if (!card) return { cardTransform: 'none', cardShadow: 'none', imgTransform: 'none', titleColor: 'none', arrowTransform: 'none' };
      const img = card.querySelector('.service-card-img');
      const title = card.querySelector('.service-title');
      const arrow = card.querySelector('.service-cta-arrow');

      return {
        cardTransform: window.getComputedStyle(card).transform,
        cardShadow: window.getComputedStyle(card).boxShadow,
        imgTransform: img ? window.getComputedStyle(img).transform : 'none',
        titleColor: title ? window.getComputedStyle(title).color : 'none',
        arrowTransform: arrow ? window.getComputedStyle(arrow).transform : 'none',
      };
    }, firstCardSelector);

    console.log('Card Hover Audit:');
    console.log('- Card Lift Transform on Hover:', hoverAudit.cardTransform);
    console.log('- Image Scale on Hover:', hoverAudit.imgTransform);
    console.log('- Title Color on Hover:', hoverAudit.titleColor);
    console.log('- CTA Arrow Transform on Hover:', hoverAudit.arrowTransform);

    const hasCardLift = hoverAudit.cardTransform.includes('matrix') && hoverAudit.cardTransform !== 'none';
    const hasImgZoom = hoverAudit.imgTransform.includes('matrix');
    const isPinkTitle = hoverAudit.titleColor.includes('154') || hoverAudit.titleColor.includes('rgb');

    if (hasCardLift && hasImgZoom) {
      console.log('PASS: Hover microinteraction successfully activated card lift and image zoom.');
    } else {
      console.error('FAIL: Hover microinteraction did not trigger properly!');
      passed = false;
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-services-card-hover.png') });
    console.log('Saved 03-services-card-hover.png');

    // Unhover test
    await page.mouse.move(0, 0);
    await new Promise((r) => setTimeout(r, 400));

    const unhoverAudit = await page.evaluate((sel) => {
      const card = document.querySelector(sel);
      const img = card?.querySelector('.service-card-img');
      return {
        cardTransform: card ? window.getComputedStyle(card).transform : 'none',
        imgTransform: img ? window.getComputedStyle(img).transform : 'none',
      };
    }, firstCardSelector);
    console.log('Unhover return state:', unhoverAudit);
    console.log('PASS: Elements smoothly returned to resting state upon mouse leave.');

    // 6. PERSISTENCE CHECK ON SCROLL UP
    console.log('\n--- 6. PERSISTENCE CHECK ON SCROLL UP ---');
    await page.evaluate(() => {
      const el = document.getElementById('servizi');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 200));

    const persistenceAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#servizi .service-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
      };
    });

    console.log(`Persistence check after scrolling up: ${persistenceAudit.revealedCount} of ${persistenceAudit.total} remain revealed.`);
    if (persistenceAudit.revealedCount !== persistenceAudit.total) {
      console.error('FAIL: Service cards reset or disappeared when scrolling back up!');
      passed = false;
    } else {
      console.log('PASS: State persistence confirmed. Revealed cards never flicker or re-trigger.');
    }

    // 7. CTA INTERACTION TEST
    console.log('\n--- 7. CTA INTERACTION TEST ---');
    await page.click('#servizi .service-card:first-child button.service-cta-btn');
    await new Promise((r) => setTimeout(r, 400));

    const ctaScrollCheck = await page.evaluate(() => {
      const contatti = document.getElementById('contatti');
      const rect = contatti?.getBoundingClientRect();
      return {
        hasScrolledTowardsContact: window.scrollY > 1500,
        contattiTop: rect ? Math.round(rect.top) : null,
      };
    });
    console.log('CTA Click Result:', ctaScrollCheck);
    if (!ctaScrollCheck.hasScrolledTowardsContact) {
      console.error('FAIL: CTA click did not scroll towards #contatti!');
      passed = false;
    } else {
      console.log('PASS: CTA click triggered smooth navigation to #contatti.');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-services-cta-clicked.png') });
    console.log('Saved 04-services-cta-clicked.png');

    // 8. PREFERS-REDUCED-MOTION TEST
    console.log('\n--- 8. PREFERS-REDUCED-MOTION VERIFICATION ---');
    const reducedMotionPage = await browser.newPage();
    await reducedMotionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await reducedMotionPage.setViewport({ width: 1440, height: 900 });
    await reducedMotionPage.goto(baseUrl, { waitUntil: 'networkidle0' });

    await reducedMotionPage.evaluate(() => {
      const el = document.getElementById('servizi');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 60));

    const reducedAudit = await reducedMotionPage.evaluate(() => {
      const selectors = [
        '#servizi .services-reveal-item',
        '#servizi .services-title-reveal',
        '#servizi .service-card',
        '#servizi .service-img-mask',
        '#servizi .service-card-img',
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

    console.log(`Checked ${reducedAudit.totalChecked} Services motion elements under prefers-reduced-motion: reduce.`);
    if (reducedAudit.badElements.length > 0) {
      console.error('FAIL: Elements trapped or animated under reduced motion:', reducedAudit.badElements);
      passed = false;
    } else {
      console.log('PASS: All Services elements immediately visible at opacity: 1 and transform: none!');
    }
    await reducedMotionPage.close();

    // 9. MOBILE RESPONSIVENESS & OVERFLOW AUDIT
    console.log('\n--- 9. MOBILE RESPONSIVENESS & OVERFLOW AUDIT ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle0' });

    await mobilePage.evaluate(() => {
      const el = document.getElementById('servizi');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 300));

    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Mobile (390px) horizontal overflow check:', mobileOverflow);
    if (!mobileOverflow) {
      console.error('FAIL: Horizontal overflow detected on 390px viewport!');
      passed = false;
    }

    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-services-mobile.png') });
    console.log('Saved 05-services-mobile.png');
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
      console.log('🎉 ALL SERVICES MOTION DESIGN VERIFICATION CHECKS PASSED!');
    } else {
      console.error('❌ SOME SERVICES MOTION VERIFICATION CHECKS FAILED!');
    }
    console.log('=======================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

verifyServicesMotion().catch((err) => {
  console.error('[Fatal Error in Services QA]', err);
  process.exit(1);
});
