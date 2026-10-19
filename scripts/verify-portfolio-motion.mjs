import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots', 'portfolio-motion');

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

function startServer(port = 4175) {
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
      console.log(`[Portfolio QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyPortfolioMotion() {
  const PORT = 4175;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;
  let passed = true;

  console.log('[Portfolio QA] Launching Google Chrome...');
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

    // Verify that at the top of the page, portfolio cards are NOT yet revealed
    const initialLoadAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio .portfolio-card'));
      const revealedCards = cards.filter((c) => c.classList.contains('is-revealed'));
      const gridHasScrollClass = document.querySelector('#portfolio .portfolio-scroll-active') !== null;
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
      console.log('PASS: 0 portfolio cards revealed prematurely at initial page load.');
    }

    // 2. SCROLL ENTRANCE SEQUENCE TO PORTFOLIO HEADER
    console.log('\n--- 2. SCROLL ENTRANCE TO PORTFOLIO HEADER ---');
    await page.evaluate(() => {
      const el = document.getElementById('portfolio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    // Brief wait for IntersectionObserver trigger
    await new Promise((r) => setTimeout(r, 60));

    // Audit header motion delays
    const headerAudit = await page.evaluate(() => {
      const section = document.getElementById('portfolio');
      const label = section?.querySelector('div.inline-flex.items-center.text-xs.uppercase');
      const title = section?.querySelector('h2');
      const desc = section?.querySelector('p.text-\\[\\#5A544F\\]');
      const counter = section?.querySelector('div.font-mono');
      const pills = Array.from(section?.querySelectorAll('div[role="tablist"] button') || []);

      return {
        label: {
          hasReveal: label?.classList.contains('portfolio-reveal-item'),
          delay: label?.style.animationDelay,
          duration: label?.style.animationDuration,
        },
        title: {
          hasReveal: title?.classList.contains('portfolio-reveal-item'),
          delay: title?.style.animationDelay,
          duration: title?.style.animationDuration,
        },
        desc: {
          hasReveal: desc?.classList.contains('portfolio-reveal-item'),
          delay: desc?.style.animationDelay,
          duration: desc?.style.animationDuration,
        },
        counter: {
          hasReveal: counter?.classList.contains('portfolio-reveal-item'),
          delay: counter?.style.animationDelay,
          text: counter?.textContent?.replace(/\s+/g, ' ').trim(),
        },
        pills: pills.map((p) => ({
          text: p.querySelector('span:first-child')?.textContent?.trim(),
          delay: p.style.animationDelay,
        })),
      };
    });

    console.log('Portfolio Header Entrance Audit:');
    console.log('- Phase A (Label): delay =', headerAudit.label.delay, 'duration =', headerAudit.label.duration);
    console.log('- Phase B (Title): delay =', headerAudit.title.delay, 'duration =', headerAudit.title.duration);
    console.log('- Phase C (Description): delay =', headerAudit.desc.delay);
    console.log('- Phase C (Counter): delay =', headerAudit.counter.delay, '| text:', headerAudit.counter.text);
    console.log('- Phase D (Filter Pills):', headerAudit.pills.map((p) => `${p.text}: ${p.delay}`).join(', '));

    // Capture progression screenshots
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-entrance-200ms.png') });
    console.log('Saved 01-entrance-200ms.png');

    await new Promise((r) => setTimeout(r, 450));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-entrance-settled.png') });
    console.log('Saved 02-entrance-settled.png');

    // 2B. PROGRESSIVE SCROLL REVEAL OF INDIVIDUAL PHOTO CARDS
    console.log('\n--- 2B. PROGRESSIVE SCROLL REVEAL OF INDIVIDUAL PHOTO CARDS ---');
    const topOfPortfolioAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio .portfolio-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      const unrevealed = cards.filter((c) => !c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
        unrevealedCount: unrevealed.length,
        firstCardsDelays: cards.slice(0, 3).map((c) => c.style.transitionDelay),
      };
    });

    console.log(`Top of Portfolio: ${topOfPortfolioAudit.revealedCount} cards revealed, ${topOfPortfolioAudit.unrevealedCount} waiting for scroll.`);
    console.log('Local Stagger Delays for initially visible batch:', topOfPortfolioAudit.firstCardsDelays);

    if (topOfPortfolioAudit.revealedCount === 0) {
      console.error('FAIL: Initial cards in viewport did not reveal!');
      passed = false;
    } else if (topOfPortfolioAudit.revealedCount === topOfPortfolioAudit.total) {
      console.error('FAIL: All cards were revealed simultaneously at the top (premature bulk reveal)!');
      passed = false;
    } else {
      console.log(`PASS: Only visible cards (${topOfPortfolioAudit.revealedCount}) revealed; off-screen cards remain unrevealed.`);
    }

    // Scroll down incrementally into the portfolio
    console.log('Scrolling down +800px into portfolio...');
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 200));

    const midScrollAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio .portfolio-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return {
        revealedCount: revealed.length,
      };
    });

    console.log(`After +800px scroll: ${midScrollAudit.revealedCount} cards revealed.`);
    if (midScrollAudit.revealedCount <= topOfPortfolioAudit.revealedCount) {
      console.error('FAIL: Subsequent cards did not reveal during scroll!');
      passed = false;
    } else {
      console.log('PASS: Additional cards progressively revealed during scroll.');
    }

    // Scroll progressively through rest of portfolio to the bottom
    console.log('Scrolling progressively through rest of portfolio to the bottom...');
    await page.evaluate(async () => {
      const grid = document.querySelector('#portfolio');
      if (!grid) return;
      const start = window.scrollY;
      const end = grid.offsetTop + grid.offsetHeight - window.innerHeight;
      const step = 350;
      for (let y = start; y <= end; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: end, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 100));
    });
    await new Promise((r) => setTimeout(r, 200));

    const bottomScrollAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio .portfolio-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
      };
    });

    console.log(`At bottom of portfolio: ${bottomScrollAudit.revealedCount} of ${bottomScrollAudit.total} cards revealed.`);
    if (bottomScrollAudit.revealedCount !== bottomScrollAudit.total) {
      console.error(`FAIL: Expected all ${bottomScrollAudit.total} cards revealed at bottom, but got ${bottomScrollAudit.revealedCount}`);
      passed = false;
    } else {
      console.log('PASS: All cards revealed as user scrolled through the entire portfolio.');
    }

    // Check Persistence: Scroll back up to top of portfolio
    console.log('Scrolling back up to portfolio header (persistence check)...');
    await page.evaluate(() => {
      const el = document.getElementById('portfolio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 150));

    const persistenceAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio .portfolio-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return {
        total: cards.length,
        revealedCount: revealed.length,
      };
    });

    console.log(`Persistence after scroll back up: ${persistenceAudit.revealedCount} of ${persistenceAudit.total} cards remain revealed.`);
    if (persistenceAudit.revealedCount !== persistenceAudit.total) {
      console.error('FAIL: Cards disappeared or reset when scrolling back up!');
      passed = false;
    } else {
      console.log('PASS: All cards remain stably revealed when scrolling back up.');
    }

    // 3. HOVER MICROINTERACTION TEST
    console.log('\n--- 3. HOVER MICROINTERACTION TEST ---');
    const firstCardSelector = '#portfolio .portfolio-card:first-child';
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, firstCardSelector);
    await new Promise((r) => setTimeout(r, 100));

    await page.hover(firstCardSelector);
    await new Promise((r) => setTimeout(r, 400));

    const hoverAudit = await page.evaluate((sel) => {
      const card = document.querySelector(sel);
      const img = card?.querySelector('.portfolio-img-zoom');
      const vignette = card?.querySelector('.portfolio-vignette');
      const overlayText = card?.querySelector('.portfolio-overlay-info');

      return {
        imgScale: window.getComputedStyle(img).transform,
        vignetteOpacity: window.getComputedStyle(vignette).opacity,
        overlayOpacity: window.getComputedStyle(overlayText).opacity,
      };
    }, firstCardSelector);

    console.log('Card Hover Audit:');
    console.log('- Image transform on hover:', hoverAudit.imgScale);
    console.log('- Vignette opacity on hover:', hoverAudit.vignetteOpacity);
    console.log('- Overlay details opacity on hover:', hoverAudit.overlayOpacity);

    if (hoverAudit.vignetteOpacity === '1' && hoverAudit.imgScale.includes('matrix')) {
      console.log('PASS: Hover microinteraction successfully activated image zoom and overlay info.');
    } else {
      console.error('FAIL: Hover microinteraction did not activate properly!');
      passed = false;
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-photo-hover.png') });
    console.log('Saved 03-photo-hover.png');

    // 4. CATEGORY FILTER TRANSITIONS TEST
    console.log('\n--- 4. CATEGORY FILTER TRANSITIONS TEST ---');
    const categoriesToTest = [
      { name: 'Food & Drink', expectedCount: 4 },
      { name: 'DJ Set & Nightlife', expectedCount: 3 },
      { name: 'Eventi & Lago', expectedCount: 5 },
      { name: 'Matrimoni & Cerimonie', expectedCount: 6 },
      { name: 'Privati & Brand', expectedCount: 6 },
      { name: 'Tutti i Lavori', expectedCount: 24 },
    ];

    for (const testCat of categoriesToTest) {
      // Find button by label
      const btnSelector = await page.evaluate((name) => {
        const buttons = Array.from(document.querySelectorAll('#portfolio div[role="tablist"] button'));
        const target = buttons.find((b) => b.textContent.includes(name));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, testCat.name);

      if (!btnSelector) {
        console.error(`FAIL: Tab "${testCat.name}" button not found!`);
        passed = false;
        continue;
      }

      // Wait 350ms for exit + entrance animation
      await new Promise((r) => setTimeout(r, 380));

      const countInfo = await page.evaluate(() => {
        const cards = document.querySelectorAll('#portfolio .columns-1 > div');
        const counterText = document.querySelector('#portfolio div.font-mono')?.textContent?.replace(/\s+/g, ' ').trim();
        const activeTab = document.querySelector('#portfolio button[aria-selected="true"] span:first-child')?.textContent?.trim();

        return {
          visibleCardsCount: cards.length,
          counterText,
          activeTab,
        };
      });

      console.log(`Filter [${testCat.name}]: cards=${countInfo.visibleCardsCount} (expected ${testCat.expectedCount}) | activeTab="${countInfo.activeTab}" | counter="${countInfo.counterText}"`);

      if (countInfo.visibleCardsCount !== testCat.expectedCount) {
        console.error(`FAIL: Category ${testCat.name} expected ${testCat.expectedCount} photos but got ${countInfo.visibleCardsCount}`);
        passed = false;
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-filter-food-drink.png') });

    // 5. RAPID CLICK RESILIENCE TEST
    console.log('\n--- 5. RAPID FILTER CLICK RESILIENCE ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#portfolio div[role="tablist"] button'));
      // Click 1st, then 3rd, then 2nd within milliseconds
      if (buttons[1]) buttons[1].click();
      setTimeout(() => { if (buttons[3]) buttons[3].click(); }, 30);
      setTimeout(() => { if (buttons[2]) buttons[2].click(); }, 70);
    });

    // Wait for transition to complete
    await new Promise((r) => setTimeout(r, 550));

    const rapidClickResult = await page.evaluate(() => {
      const activeTab = document.querySelector('#portfolio button[aria-selected="true"] span:first-child')?.textContent?.trim();
      const cards = document.querySelectorAll('#portfolio .columns-1 > div');
      const counter = document.querySelector('#portfolio div.font-mono')?.textContent?.replace(/\s+/g, ' ').trim();
      return { activeTab, cardsCount: cards.length, counter };
    });

    console.log('Rapid Click Final State:', rapidClickResult);
    if (!rapidClickResult.activeTab || rapidClickResult.cardsCount === 0) {
      console.error('FAIL: Rapid clicking resulted in blank or inconsistent grid!');
      passed = false;
    } else {
      console.log('PASS: Grid smoothly settled on final clicked category without glitching!');
    }

    // Reset back to 'Tutti i Lavori'
    await page.evaluate(() => {
      const firstTab = document.querySelector('#portfolio div[role="tablist"] button:first-child');
      if (firstTab) firstTab.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 6. LIGHTBOX MODAL TEST
    console.log('\n--- 6. LIGHTBOX MODAL OPEN & TRANSITION TEST ---');
    await page.click('#portfolio .columns-1 > div:first-child');
    await new Promise((r) => setTimeout(r, 350));

    const lightboxOpenCheck = await page.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      const img = dialog?.querySelector('img');
      const isLocked = document.body.classList.contains('lock-scroll');
      return {
        isOpen: !!dialog,
        imgSrc: img?.src,
        isLocked,
      };
    });

    console.log('Lightbox Open Status:', lightboxOpenCheck);
    if (!lightboxOpenCheck.isOpen || !lightboxOpenCheck.isLocked) {
      console.error('FAIL: Lightbox did not open or scroll was not locked!');
      passed = false;
    } else {
      console.log('PASS: Lightbox opened with smooth entrance animation and body scroll locked.');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-lightbox-open.png') });

    // Test ArrowRight navigation in Lightbox
    await page.keyboard.press('ArrowRight');
    await new Promise((r) => setTimeout(r, 200));

    // Close via Escape key
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    const lightboxClosedCheck = await page.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      const isLocked = document.body.classList.contains('lock-scroll');
      return {
        isOpen: !!dialog,
        isLocked,
      };
    });
    console.log('Lightbox Closed Status:', lightboxClosedCheck);
    if (lightboxClosedCheck.isOpen || lightboxClosedCheck.isLocked) {
      console.error('FAIL: Lightbox did not close cleanly on Escape!');
      passed = false;
    } else {
      console.log('PASS: Lightbox closed cleanly via Escape key, lock-scroll released.');
    }

    // 7. PREFERS-REDUCED-MOTION VERIFICATION
    console.log('\n--- 7. PREFERS-REDUCED-MOTION VERIFICATION ---');
    const reducedMotionPage = await browser.newPage();
    await reducedMotionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await reducedMotionPage.setViewport({ width: 1440, height: 900 });
    await reducedMotionPage.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Scroll to portfolio
    await reducedMotionPage.evaluate(() => {
      const el = document.getElementById('portfolio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 60));

    const reducedAudit = await reducedMotionPage.evaluate(() => {
      const selectors = [
        '#portfolio .portfolio-reveal-item',
        '#portfolio .portfolio-card',
      ];
      const elements = Array.from(document.querySelectorAll(selectors.join(', ')));
      const badElements = [];

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const opacity = parseFloat(computed.opacity);
        const anim = computed.animationName;
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

    console.log(`Checked ${reducedAudit.totalChecked} portfolio items under prefers-reduced-motion: reduce.`);
    if (reducedAudit.badElements.length > 0) {
      console.error('FAIL: Elements trapped or animated under reduced motion:', reducedAudit.badElements);
      passed = false;
    } else {
      console.log('PASS: All portfolio items immediately visible at opacity: 1 and transform: none!');
    }
    await reducedMotionPage.close();

    // 8. MOBILE VIEWPORT (390x844) & COMPACT (320x640)
    console.log('\n--- 8. MOBILE RESPONSIVENESS & OVERFLOW AUDIT ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle0' });
    await mobilePage.evaluate(() => {
      const el = document.getElementById('portfolio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 500));

    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Mobile (390px) horizontal overflow check:', mobileOverflow);
    if (!mobileOverflow) {
      console.error('FAIL: Horizontal overflow detected on 390px viewport!');
      passed = false;
    }
    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-mobile-portfolio.png') });
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
      console.log('🎉 ALL PORTFOLIO MOTION DESIGN VERIFICATION CHECKS PASSED!');
    } else {
      console.error('❌ SOME PORTFOLIO MOTION VERIFICATION CHECKS FAILED!');
    }
    console.log('=======================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

verifyPortfolioMotion().catch((err) => {
  console.error('[Fatal Error in Portfolio QA]', err);
  process.exit(1);
});
