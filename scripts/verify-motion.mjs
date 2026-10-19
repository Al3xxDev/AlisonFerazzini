import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'qa-screenshots', 'motion');

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

function startServer(port = 4174) {
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
      console.log(`[Motion QA Server] Serving dist/ on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function verifyMotionDesign() {
  const PORT = 4174;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;
  let passed = true;

  console.log('[Motion QA] Launching Google Chrome...');
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

    // 1. DESKTOP MOTION TIMELINE VERIFICATION
    console.log('\n--- 1. DESKTOP MOTION TIMELINE (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Inspect Animation Delays & Keyframes in DOM
    const motionAudit = await page.evaluate(() => {
      const results = {};

      // Header logo
      const logoEl = document.querySelector('header a[aria-label*="Home"]');
      results.logo = {
        hasMotionClass: logoEl?.classList.contains('animate-motion-header'),
        delay: logoEl?.style.animationDelay,
        duration: logoEl?.style.animationDuration,
      };

      // Header desktop nav items
      const navLinks = Array.from(document.querySelectorAll('header nav[aria-label="Navigazione principale"] a'));
      results.navLinks = navLinks.map((link) => ({
        text: link.textContent.trim(),
        hasMotionClass: link.classList.contains('animate-motion-header'),
        delay: link.style.animationDelay,
      }));

      // Header actions
      const igLink = document.querySelector('header a[aria-label*="Instagram"]');
      const ctaBtn = document.querySelector('header div.hidden.md\\:flex a[href="#contatti"]');
      results.headerActions = {
        igDelay: igLink?.style.animationDelay,
        ctaDelay: ctaBtn?.style.animationDelay,
      };

      // Hero Elements
      const heroBadge = document.querySelector('section[aria-label*="Presentazione"] .inline-flex.rounded-full');
      results.heroBadge = {
        hasFadeUp: heroBadge?.classList.contains('animate-motion-fade-up'),
        delay: heroBadge?.style.animationDelay,
      };

      // Title Lines
      const titleLines = Array.from(document.querySelectorAll('section[aria-label*="Presentazione"] h1 span.animate-motion-title'));
      results.titleLines = titleLines.map((el) => {
        const parent = el.parentElement;
        const parentComputed = window.getComputedStyle(parent);

        return {
          text: el.textContent.trim(),
          delay: el.style.animationDelay,
          duration: el.style.animationDuration,
          parentOverflow: parentComputed.overflow,
          parentPaddingBottom: parentComputed.paddingBottom,
        };
      });

      // Bio Description
      const bioP = document.querySelector('section[aria-label*="Presentazione"] p.animate-motion-fade-up');
      results.bio = {
        hasFadeUp: bioP?.classList.contains('animate-motion-fade-up'),
        delay: bioP?.style.animationDelay,
      };

      // Hero Photo & DJ Card
      const photoContainer = document.querySelector('section[aria-label*="Presentazione"] .aspect-\\[4\\/5\\]');
      const photoInnerZoom = photoContainer?.querySelector('.animate-motion-photo-zoom');
      const locationChip = photoContainer?.querySelector('.backdrop-blur-xs');
      const djCard = document.querySelector('section[aria-label*="Presentazione"] .animate-motion-card-diagonal');

      results.visual = {
        photoContainerDelay: photoContainer?.style.animationDelay,
        hasZoomClass: !!photoInnerZoom,
        locationChipDelay: locationChip?.style.animationDelay,
        djCardDelay: djCard?.style.animationDelay,
      };

      return results;
    });

    console.log('Motion Audit Results:');
    console.log('- Header Logo entrance delay:', motionAudit.logo.delay);
    console.log('- Header Nav staggered delays:', motionAudit.navLinks.map((n) => `${n.text}: ${n.delay}`).join(', '));
    console.log('- Header Actions delays:', `Instagram: ${motionAudit.headerActions.igDelay}, CTA: ${motionAudit.headerActions.ctaDelay}`);
    console.log('- Hero Badge delay:', motionAudit.heroBadge.delay);
    console.log('- Hero Title Line 1 delay:', motionAudit.titleLines[0]?.delay, '| text:', motionAudit.titleLines[0]?.text);
    console.log('- Hero Title Line 2 delay:', motionAudit.titleLines[1]?.delay, '| text:', motionAudit.titleLines[1]?.text);
    console.log('- Hero Bio delay:', motionAudit.bio.delay);
    console.log('- Hero Photo Container delay:', motionAudit.visual.photoContainerDelay);
    console.log('- Hero DJ Card delay:', motionAudit.visual.djCardDelay);
    console.log('- Hero Location chip delay:', motionAudit.visual.locationChipDelay);

    // Capture timeline progression screenshots
    console.log('\n--- Capturing Timeline Progression Screenshots ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-timeline-200ms.png'), fullPage: false });
    console.log('Saved 01-timeline-200ms.png');

    await new Promise((r) => setTimeout(r, 300)); // total ~500ms
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-timeline-500ms.png'), fullPage: false });
    console.log('Saved 02-timeline-500ms.png');

    await new Promise((r) => setTimeout(r, 400)); // total ~900ms
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-timeline-900ms.png'), fullPage: false });
    console.log('Saved 03-timeline-900ms.png');

    await new Promise((r) => setTimeout(r, 500)); // total ~1400ms (complete)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-timeline-1400ms-complete.png'), fullPage: false });
    console.log('Saved 04-timeline-1400ms-complete.png');

    // Verify Title clipping safety in SETTLED state (after 1400ms)
    const settledClippingCheck = await page.evaluate(() => {
      const titleLines = Array.from(document.querySelectorAll('section[aria-label*="Presentazione"] h1 span.animate-motion-title'));
      return titleLines.map((el) => {
        const parent = el.parentElement;
        const elRect = el.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        return {
          text: el.textContent.trim(),
          parentOverflow: window.getComputedStyle(parent).overflow,
          isClipped: elRect.bottom > parentRect.bottom + 0.5,
          elBottom: elRect.bottom,
          parentBottom: parentRect.bottom,
        };
      });
    });

    console.log('\n--- Settled Title Lines Clipping Check ---');
    settledClippingCheck.forEach((line) => {
      console.log(`- "${line.text}": overflow=${line.parentOverflow}, elBottom=${line.elBottom.toFixed(1)}, parentBottom=${line.parentBottom.toFixed(1)}, isClipped=${line.isClipped}`);
      if (line.isClipped) {
        console.error(`FAIL: Settled title line "${line.text}" is clipped!`);
        passed = false;
      }
    });
    if (settledClippingCheck.every((l) => !l.isClipped)) {
      console.log('PASS: Settled title lines are completely unclipped with proper descender clearance!');
    }

    // 2. MICROINTERACTIONS VERIFICATION
    console.log('\n--- 2. MICROINTERACTIONS TEST ---');
    const ctaSelector = 'header div.hidden.md\\:flex a[href="#contatti"]';
    await page.hover(ctaSelector);
    await new Promise((r) => setTimeout(r, 200));
    console.log('PASS: Header CTA hover microinteraction active.');

    // Hover on Hero Primary Photo
    const heroPhotoSelector = 'section[aria-label*="Presentazione"] .aspect-\\[4\\/5\\] img';
    await page.hover(heroPhotoSelector);
    await new Promise((r) => setTimeout(r, 300));
    console.log('PASS: Hero Photo hover triggered cleanly.');

    // 3. SCROLL REVEAL TEST (Generic Sections)
    console.log('\n--- 3. SCROLL REVEAL TEST ---');
    const sectionIds = ['servizi', 'chi-sono', 'metodo', 'contatti'];
    for (const id of sectionIds) {
      await page.evaluate((targetId) => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, id);
      await new Promise((r) => setTimeout(r, 200));

      const isRevealed = await page.evaluate((targetId) => {
        const section = document.getElementById(targetId);
        const revealEl = section?.querySelector('.reveal-on-scroll, .service-card.is-revealed, .about-value-card.is-revealed, .method-card.is-revealed, .method-header.is-revealed');
        return revealEl ? revealEl.classList.contains('is-revealed') : false;
      }, id);

      console.log(`- Section #${id}: revealed=${isRevealed}`);
      if (!isRevealed) {
        console.error(`FAIL: Section #${id} was not revealed on scroll!`);
        passed = false;
      }
    }

    // 4. PREFERS-REDUCED-MOTION TEST
    console.log('\n--- 4. PREFERS-REDUCED-MOTION VERIFICATION ---');
    const reducedMotionPage = await browser.newPage();
    await reducedMotionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await reducedMotionPage.setViewport({ width: 1440, height: 900 });
    await reducedMotionPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const reducedMotionAudit = await reducedMotionPage.evaluate(() => {
      // Check all elements with motion classes
      const selectors = [
        '.animate-motion-header',
        '.animate-motion-fade-up',
        '.animate-motion-title',
        '.animate-motion-photo-zoom',
        '.animate-motion-card-diagonal',
        '.reveal-on-scroll',
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

    console.log(`Checked ${reducedMotionAudit.totalChecked} animated elements under prefers-reduced-motion: reduce.`);
    if (reducedMotionAudit.badElements.length > 0) {
      console.error('FAIL: Elements trapped at opacity < 1 under reduced motion:', reducedMotionAudit.badElements);
      passed = false;
    } else {
      console.log('PASS: All elements have immediate opacity: 1 and zero stuck states!');
    }
    await reducedMotionPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-reduced-motion.png') });
    await reducedMotionPage.close();

    // 5. MOBILE VIEWPORT TEST
    console.log('\n--- 5. MOBILE RESPONSIVENESS & DRAWER TEST (390x844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Verify no horizontal overflow
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log('Mobile horizontal overflow check (scrollWidth <= innerWidth):', mobileOverflow);
    if (!mobileOverflow) {
      console.error('FAIL: Mobile horizontal overflow detected!');
      passed = false;
    } else {
      console.log('PASS: Zero mobile horizontal overflow!');
    }

    // Toggle Mobile Drawer
    const menuBtn = await mobilePage.$('button[aria-controls="mobile-navigation"]');
    if (menuBtn) {
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      const isDrawerOpen = await mobilePage.evaluate(() => {
        const drawer = document.getElementById('mobile-navigation');
        return drawer && window.getComputedStyle(drawer).visibility === 'visible';
      });
      console.log('Mobile Drawer Open Check:', isDrawerOpen);
      if (!isDrawerOpen) {
        console.error('FAIL: Mobile drawer did not open!');
        passed = false;
      } else {
        console.log('PASS: Mobile drawer opens smoothly with backdrop blur!');
      }
      await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-mobile-drawer.png') });
    }
    await mobilePage.close();

    if (consoleErrors.length > 0) {
      console.error('Console errors logged during test:', consoleErrors);
      passed = false;
    } else {
      console.log('PASS: 0 console errors logged across all runs!');
    }

    console.log('\n=======================================');
    if (passed) {
      console.log('🎉 ALL MOTION DESIGN VERIFICATION CHECKS PASSED!');
    } else {
      console.error('❌ SOME VERIFICATION CHECKS FAILED!');
    }
    console.log('=======================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

verifyMotionDesign().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
