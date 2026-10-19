import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots');

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
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function startServer(port = 4173) {
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
      console.log(`[QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyFixes() {
  const PORT = 4173;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  const consoleErrors = [];

  console.log('[QA Verification] Launching Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });

  try {
    const page = await browser.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`[Console Error] ${msg.text()}`);
      }
    });

    // 1. Desktop Verification (1440x900)
    console.log('\n--- VERIFICATION 1: DESKTOP HERO & TICKER ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Verify Food & Drink badge is REMOVED from Hero
    const heroBadges = await page.evaluate(() => {
      const hero = document.querySelector('section[aria-label="Presentazione e introduzione"]');
      if (!hero) return { foundHero: false, hasFoodBadge: false };
      const text = hero.innerText;
      const hasFoodBadge = text.includes('Yume Sushi Fusion');
      return { foundHero: true, hasFoodBadge };
    });

    console.log('Hero food badge check:', heroBadges);
    if (heroBadges.hasFoodBadge) {
      throw new Error('FAIL: Food & Drink — Yume Sushi Fusion badge is still present in Hero!');
    } else {
      console.log('PASS: "Food & Drink — Yume Sushi Fusion" badge is completely removed from Hero.');
    }

    // Verify DJ Set bottom-left card is STILL preserved
    const djCardPreserved = await page.evaluate(() => {
      const hero = document.querySelector('section[aria-label="Presentazione e introduzione"]');
      return hero ? hero.innerText.toUpperCase().includes('DJ SET · NIGHT') : false;
    });
    console.log('Hero DJ set card preserved:', djCardPreserved);
    if (!djCardPreserved) {
      throw new Error('FAIL: Bottom DJ set card was accidentally removed!');
    }

    // Verify Ticker has NO scrollbar
    const tickerMetrics = await page.evaluate(() => {
      const marqueeContainer = document.querySelector('div[aria-label="Discipline fotografiche"]');
      if (!marqueeContainer) return null;
      const computed = window.getComputedStyle(marqueeContainer);
      const track = marqueeContainer.querySelector('.animate-marquee');
      const trackComputed = track ? window.getComputedStyle(track) : null;
      return {
        containerOverflow: computed.overflow,
        containerOverflowX: computed.overflowX,
        hasHorizontalScroll: marqueeContainer.scrollWidth > marqueeContainer.clientWidth && computed.overflowX === 'scroll',
        trackAnimationName: trackComputed ? trackComputed.animationName : null,
        trackAnimationDuration: trackComputed ? trackComputed.animationDuration : null,
      };
    });

    console.log('Ticker metrics:', tickerMetrics);
    if (tickerMetrics.containerOverflowX === 'auto' || tickerMetrics.containerOverflowX === 'scroll') {
      throw new Error(`FAIL: Ticker container has overflowX: ${tickerMetrics.containerOverflowX}`);
    } else {
      console.log('PASS: Ticker container has overflow hidden and zero scrollbars.');
    }

    // Verify Ticker is actually moving smoothly
    console.log('Testing ticker movement over 2 seconds...');
    const pos1 = await page.evaluate(() => {
      const track = document.querySelector('.animate-marquee');
      return track ? track.getBoundingClientRect().left : 0;
    });
    await new Promise((r) => setTimeout(r, 1500));
    const pos2 = await page.evaluate(() => {
      const track = document.querySelector('.animate-marquee');
      return track ? track.getBoundingClientRect().left : 0;
    });

    console.log(`Ticker movement: pos1=${pos1.toFixed(1)}px, pos2=${pos2.toFixed(1)}px (delta=${(pos2 - pos1).toFixed(1)}px)`);
    if (pos1 === pos2) {
      throw new Error('FAIL: Ticker is not moving!');
    } else {
      console.log('PASS: Ticker animation is actively running smoothly.');
    }

    // Capture screenshot of Hero & Ticker
    const heroScreenshotPath = path.join(SCREENSHOTS_DIR, 'fix-hero-clean.png');
    const heroElem = await page.$('section[aria-label="Presentazione e introduzione"]');
    if (heroElem) {
      await heroElem.screenshot({ path: heroScreenshotPath });
      console.log(`Saved screenshot: ${heroScreenshotPath}`);
    }

    const tickerScreenshotPath = path.join(SCREENSHOTS_DIR, 'fix-ticker-clean.png');
    const tickerElem = await page.$('div[aria-label="Discipline fotografiche"]');
    if (tickerElem) {
      await tickerElem.screenshot({ path: tickerScreenshotPath });
      console.log(`Saved screenshot: ${tickerScreenshotPath}`);
    }

    // 2. Mobile Verification (390x844)
    console.log('\n--- VERIFICATION 2: MOBILE 390x844 ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 400));

    // Check no horizontal overflow on mobile
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('Mobile horizontal overflow detected:', mobileOverflow);
    if (mobileOverflow) {
      throw new Error('FAIL: Horizontal overflow detected on 390px mobile viewport!');
    } else {
      console.log('PASS: No horizontal overflow on 390px viewport.');
    }

    const mobileHeroScreenshot = path.join(SCREENSHOTS_DIR, 'fix-mobile-hero-ticker.png');
    await page.screenshot({ path: mobileHeroScreenshot, clip: { x: 0, y: 0, width: 390, height: 950 } });
    console.log(`Saved screenshot: ${mobileHeroScreenshot}`);

    // 3. Compact Mobile (320x640)
    console.log('\n--- VERIFICATION 3: COMPACT MOBILE 320x640 ---');
    await page.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 400));

    const compactOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('Compact mobile horizontal overflow detected:', compactOverflow);
    if (compactOverflow) {
      throw new Error('FAIL: Horizontal overflow detected on 320px compact viewport!');
    } else {
      console.log('PASS: No horizontal overflow on 320px compact viewport.');
    }

    console.log('\n--- SUMMARY ---');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      throw new Error('FAIL: Console errors occurred.');
    }
    console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('[Verification Failed]', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

verifyFixes();
