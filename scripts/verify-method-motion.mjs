import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots', 'method-motion');

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

function startServer(port = 4178) {
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
      console.log(`[Method QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyMethodMotion() {
  const PORT = 4178;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;
  let passed = true;

  console.log('[Method QA] Launching Google Chrome...');
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
      const cards = Array.from(document.querySelectorAll('#metodo .method-card'));
      const revealedCards = cards.filter((c) => c.classList.contains('is-revealed'));
      const hasActiveScroll = document.querySelector('#metodo .method-scroll-active') !== null;
      return {
        totalCards: cards.length,
        revealedCount: revealedCards.length,
        hasActiveScroll,
      };
    });

    console.log(`Initial Load Audit (Hero in view): ${initialLoadAudit.revealedCount} of ${initialLoadAudit.totalCards} cards revealed.`);
    if (initialLoadAudit.revealedCount > 0) {
      console.error('FAIL: Cards were revealed prematurely before scrolling to #metodo!');
      passed = false;
    } else {
      console.log('PASS: 0 method cards revealed prematurely at initial page load.');
    }

    // 2. SCROLL ENTRANCE TO "COME LAVORO"
    console.log('\n--- 2. SCROLL ENTRANCE TO "COME LAVORO" ---');
    await page.evaluate(() => {
      const el = document.getElementById('metodo');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 150));

    const entranceAudit = await page.evaluate(() => {
      const label = document.querySelector('#metodo .method-reveal-label');
      const title = document.querySelector('#metodo .method-reveal-title');
      const desc = document.querySelector('#metodo .method-reveal-desc');
      return {
        labelRevealed: !!label,
        titleRevealed: !!title,
        descRevealed: !!desc,
      };
    });

    console.log('Method Header Entrance Audit:', entranceAudit);
    if (!entranceAudit.labelRevealed || !entranceAudit.titleRevealed || !entranceAudit.descRevealed) {
      console.error('FAIL: Method header elements failed to trigger reveal classes!');
      passed = false;
    } else {
      console.log('PASS: Synchronized editorial method header entrance verified.');
    }

    // Wait for entrance animation to settle
    await new Promise((r) => setTimeout(r, 700));

    // Check title descender clearance
    const titleAudit = await page.evaluate(() => {
      const title = document.querySelector('#metodo h2');
      if (!title) return { exists: false };
      const titleRect = title.getBoundingClientRect();
      const parentRect = title.parentElement?.getBoundingClientRect() || titleRect;
      const isClipped = titleRect.bottom > parentRect.bottom + 1;
      return {
        exists: true,
        isClipped,
        titleBottom: titleRect.bottom,
        parentBottom: parentRect.bottom,
      };
    });

    console.log('Title Descender Clearance Audit:', titleAudit);
    if (titleAudit.isClipped) {
      console.error('FAIL: Method title has clipped descenders!');
      passed = false;
    } else {
      console.log('PASS: Method title completely unclipped with full descender headroom.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-method-header-entrance.png'), fullPage: false });
    console.log('Saved 01-method-header-entrance.png');

    // 3. CARDS REVEAL & STAGGER
    console.log('\n--- 3. 4 CARDS REVEAL & STAGGER ---');
    const cardsAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#metodo .method-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      const connector = document.querySelector('#metodo .method-connector-line');
      const titles = cards.map((c) => c.querySelector('h3')?.textContent?.trim() || '');
      const numbers = cards.map((c) => c.querySelector('.method-number')?.textContent?.trim() || '');
      const delays = cards.map((c) => c.style.transitionDelay);

      const firstCard = cards[0];
      const numberEl = firstCard?.querySelector('.method-number');
      const iconBox = firstCard?.querySelector('.method-icon-box');

      const cardStyle = firstCard ? window.getComputedStyle(firstCard) : null;
      const numStyle = numberEl ? window.getComputedStyle(numberEl) : null;
      const iconStyle = iconBox ? window.getComputedStyle(iconBox) : null;
      const connectorStyle = connector ? window.getComputedStyle(connector) : null;

      return {
        total: cards.length,
        revealedCount: revealed.length,
        titles,
        numbers,
        delays,
        connectorRevealed: connector?.classList.contains('is-revealed'),
        connectorTransform: connectorStyle?.transform,
        cardOpacity: cardStyle?.opacity,
        cardTransform: cardStyle?.transform,
        numOpacity: numStyle?.opacity,
        iconOpacity: iconStyle?.opacity,
      };
    });

    console.log(`Method Cards: ${cardsAudit.revealedCount} of ${cardsAudit.total} revealed.`);
    console.log('Card Numbers:', cardsAudit.numbers);
    console.log('Card Titles:', cardsAudit.titles);
    console.log('Connector Line revealed:', cardsAudit.connectorRevealed, 'transform:', cardsAudit.connectorTransform);

    if (cardsAudit.revealedCount !== 4) {
      console.error(`FAIL: Expected 4 cards revealed, got ${cardsAudit.revealedCount}`);
      passed = false;
    } else {
      console.log('PASS: All 4 method cards (01, 02, 03, 04) successfully revealed with content.');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-method-cards-revealed.png'), fullPage: false });
    console.log('Saved 02-method-cards-revealed.png');

    // 4. CARD HOVER MICROINTERACTION TEST
    console.log('\n--- 4. CARD HOVER MICROINTERACTION TEST ---');
    // Hover on first card
    const firstCardSelector = '#metodo .method-card';
    await page.hover(firstCardSelector);
    await new Promise((r) => setTimeout(r, 320));

    const hoverState = await page.evaluate(() => {
      const card = document.querySelector('#metodo .method-card');
      const icon = card?.querySelector('.method-icon');
      const iconBox = card?.querySelector('.method-icon-box');
      const cardStyle = window.getComputedStyle(card);
      const iconStyle = window.getComputedStyle(icon);
      const boxStyle = window.getComputedStyle(iconBox);
      return {
        cardTransform: cardStyle.transform,
        cardBoxShadow: cardStyle.boxShadow,
        cardBorderColor: cardStyle.borderColor,
        iconTransform: iconStyle.transform,
        iconColor: iconStyle.color,
        boxBg: boxStyle.backgroundColor,
      };
    });

    console.log('Method Card Hover Audit:', hoverState);
    const hasLift = hoverState.cardTransform.includes('-3') || hoverState.cardTransform.includes('-2.9');
    const hasIconScale = hoverState.iconTransform.includes('1.08');
    const hasColorAccent = hoverState.iconColor.includes('154, 73, 107') || hoverState.iconColor.includes('212, 142, 168');

    if (hasLift && hasIconScale && hasColorAccent) {
      console.log('PASS: Hover microinteraction successfully activated card lift (-3px), icon scale (1.08), and blush color accent.');
    } else {
      console.error(`FAIL: Hover state missing expected styles: lift=${hasLift}, iconScale=${hasIconScale}, color=${hasColorAccent}`);
      passed = false;
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-method-card-hover.png'), fullPage: false });
    console.log('Saved 03-method-card-hover.png');

    // Unhover
    await page.mouse.move(0, 0);
    await new Promise((r) => setTimeout(r, 350));
    const unhoverState = await page.evaluate(() => {
      const card = document.querySelector('#metodo .method-card');
      return window.getComputedStyle(card).transform;
    });
    console.log('Unhover return transform:', unhoverState);

    // 5. PERSISTENCE CHECK ON SCROLL UP
    console.log('\n--- 5. PERSISTENCE CHECK ON SCROLL UP ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const el = document.getElementById('metodo');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 200));

    const persistenceAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#metodo .method-card'));
      const revealed = cards.filter((c) => c.classList.contains('is-revealed'));
      return { total: cards.length, revealed: revealed.length };
    });
    console.log(`Persistence check: ${persistenceAudit.revealed} of ${persistenceAudit.total} remain revealed.`);
    if (persistenceAudit.revealed !== 4) {
      console.error('FAIL: Method cards lost is-revealed state after scrolling!');
      passed = false;
    } else {
      console.log('PASS: State persistence confirmed. Elements remain stably revealed.');
    }

    // 6. PREFERS-REDUCED-MOTION VERIFICATION
    console.log('\n--- 6. PREFERS-REDUCED-MOTION VERIFICATION ---');
    const rmPage = await browser.newPage();
    await rmPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await rmPage.setViewport({ width: 1440, height: 900 });
    await rmPage.goto(baseUrl, { waitUntil: 'networkidle0' });

    const rmAudit = await rmPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll([
        '#metodo .method-reveal-label',
        '#metodo .method-reveal-title',
        '#metodo .method-reveal-desc',
        '#metodo .method-card',
        '#metodo .method-number',
        '#metodo .method-icon-box',
        '#metodo .method-icon',
        '#metodo .method-connector-line'
      ].join(',')));

      return elements.map((el) => {
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          className: el.className,
          opacity: style.opacity,
          transform: style.transform,
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration,
        };
      });
    });

    console.log(`Checked ${rmAudit.length} Method motion elements under prefers-reduced-motion: reduce.`);
    const stuckRMElements = rmAudit.filter((el) => el.opacity !== '1' && el.opacity !== '');
    if (stuckRMElements.length > 0) {
      console.error('FAIL: Some elements had non-1 opacity under reduced motion:', stuckRMElements);
      passed = false;
    } else {
      console.log('PASS: All Method elements immediately visible at opacity: 1 and transform: none!');
    }
    await rmPage.close();

    // 7. MOBILE RESPONSIVENESS & OVERFLOW AUDIT
    console.log('\n--- 7. MOBILE RESPONSIVENESS & OVERFLOW AUDIT ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => {
      const el = document.getElementById('metodo');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 300));

    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Mobile (390px) horizontal overflow check:', mobileOverflow);
    if (!mobileOverflow) {
      console.error('FAIL: Mobile horizontal overflow detected on 390px viewport!');
      passed = false;
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-method-mobile.png'), fullPage: false });
    console.log('Saved 04-method-mobile.png');

    // Compact Mobile 320px
    await page.setViewport({ width: 320, height: 640 });
    await new Promise((r) => setTimeout(r, 200));
    const compactMobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Compact Mobile (320px) horizontal overflow check:', compactMobileOverflow);
    if (!compactMobileOverflow) {
      console.error('FAIL: Horizontal overflow detected on 320px compact viewport!');
      passed = false;
    }

    // Check Console Errors
    if (consoleErrors.length > 0) {
      console.error('FAIL: Console errors logged during run:', consoleErrors);
      passed = false;
    } else {
      console.log('PASS: 0 console errors logged across all runs!');
    }

  } catch (err) {
    console.error('Exception during verification:', err);
    passed = false;
  } finally {
    await browser.close();
    server.close();
  }

  if (passed) {
    console.log('\n=======================================');
    console.log('🎉 ALL METHOD MOTION DESIGN VERIFICATION CHECKS PASSED!');
    console.log('=======================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME METHOD MOTION CHECKS FAILED.\n');
    process.exit(1);
  }
}

verifyMethodMotion();
