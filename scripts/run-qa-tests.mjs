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

// Complete MIME types map
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

async function runTests() {
  const PORT = 4173;
  const server = await startServer(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  const consoleErrors = [];
  const networkErrors = [];

  console.log('[QA] Launching Google Chrome...');
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
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });

    page.on('requestfailed', (req) => {
      networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
      console.warn(`[Network Request Failed] ${req.url()}`);
    });

    // 1. Desktop Test (1440x900)
    console.log('\n--- TEST 1: DESKTOP 1440x900 VIEWPORT ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Capture Full Page Screenshot
    const desktopScreenshot = path.join(SCREENSHOTS_DIR, '01-desktop-full.png');
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${desktopScreenshot}`);

    // Verify Title and Meta
    const pageTitle = await page.title();
    console.log(`Page title: "${pageTitle}"`);
    if (!pageTitle.includes('Alison Ferazzini')) {
      throw new Error(`Invalid page title: ${pageTitle}`);
    }

    // Verify Heading 1
    const h1Text = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`H1 text: "${h1Text.replace(/\n/g, ' ')}"`);

    // Verify Logo loaded
    const logoImg = await page.$eval('header img', (el) => ({
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
    }));
    console.log('Header Logo state:', logoImg);
    if (!logoImg.complete || logoImg.naturalWidth === 0) {
      throw new Error('Header logo failed to load or has 0 natural width!');
    }

    // Verify 6 Services Present
    const servicesCount = await page.$$eval('#servizi article', (els) => els.length);
    console.log(`Rendered Services count: ${servicesCount} (Expected: 6)`);
    if (servicesCount !== 6) {
      throw new Error(`Expected 6 services, found ${servicesCount}`);
    }

    // Verify Email link
    const emailHref = await page.$eval(
      'a[href^="mailto:alisonferazzini.photo@gmail.com"]',
      (el) => el.getAttribute('href')
    );
    console.log('Verified mailto link:', emailHref);

    // Verify Instagram link
    const igHref = await page.$eval(
      'a[href="https://www.instagram.com/alisonferazzini.ph/"]',
      (el) => ({
        href: el.getAttribute('href'),
        target: el.getAttribute('target'),
        rel: el.getAttribute('rel'),
      })
    );
    console.log('Verified Instagram link:', igHref);

    // 2. Portfolio Filtering Test
    console.log('\n--- TEST 2: PORTFOLIO FILTERING ---');
    const initialPhotoCount = await page.$$eval('#portfolio [role="button"]', (els) => els.length);
    console.log(`Initial visible photos: ${initialPhotoCount} (Total 24)`);

    // Click "Food & Drink" filter tab using element handle
    const filterTabs = await page.$$('#portfolio button[role="tab"]');
    console.log(`Found ${filterTabs.length} filter tabs. Clicking 'Food & Drink' tab...`);
    await filterTabs[3].click();
    await new Promise((r) => setTimeout(r, 400));

    const foodPhotoCount = await page.$$eval('#portfolio [role="button"]', (els) => els.length);
    console.log(`Visible photos after filtering to Food & Drink: ${foodPhotoCount}`);
    if (foodPhotoCount !== 4) {
      throw new Error(`Expected 4 food photos, got ${foodPhotoCount}`);
    }

    // Reset to "Tutti i Lavori"
    await filterTabs[0].click();
    await new Promise((r) => setTimeout(r, 400));
    const resetCount = await page.$$eval('#portfolio [role="button"]', (els) => els.length);
    console.log(`Reset back to all photos: ${resetCount}`);

    // 3. Lightbox Functionality Test
    console.log('\n--- TEST 3: LIGHTBOX INTERACTION & ACCESSIBILITY ---');
    console.log('Clicking the first photo to open Lightbox...');
    const firstPhoto = await page.$('#portfolio [role="button"]');
    await firstPhoto.click();
    await new Promise((r) => setTimeout(r, 500));

    // Check lightbox modal opened
    const isLightboxVisible = await page.$eval('[role="dialog"]', (el) => !!el);
    console.log('Lightbox open status:', isLightboxVisible);

    const lightboxScreenshot = path.join(SCREENSHOTS_DIR, '02-lightbox-open.png');
    await page.screenshot({ path: lightboxScreenshot });
    console.log(`Saved screenshot: ${lightboxScreenshot}`);

    // Navigate with Keyboard Arrow Right
    console.log('Pressing ArrowRight key...');
    await page.keyboard.press('ArrowRight');
    await new Promise((r) => setTimeout(r, 400));

    const nextPhotoTitle = await page.$eval('[role="dialog"] h2', (el) => el.innerText);
    console.log('Active photo title after ArrowRight:', nextPhotoTitle);

    // Close lightbox with Escape
    console.log('Pressing Escape key to close Lightbox...');
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));

    const lightboxClosed = (await page.$('[role="dialog"]')) === null;
    console.log('Lightbox closed successfully via Escape:', lightboxClosed);
    if (!lightboxClosed) {
      throw new Error('Lightbox did not close upon Escape key press!');
    }

    // 4. Tablet Viewport Test (768x1024)
    console.log('\n--- TEST 4: TABLET 768x1024 VIEWPORT ---');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 300));
    const tabletScreenshot = path.join(SCREENSHOTS_DIR, '03-tablet-view.png');
    await page.screenshot({ path: tabletScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${tabletScreenshot}`);

    // 5. Mobile Viewport Test (390x844 - iPhone 14 / modern smartphone)
    console.log('\n--- TEST 5: MOBILE 390x844 VIEWPORT ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 300));

    // Test Mobile Navigation Menu
    console.log('Testing mobile menu toggle...');
    await page.click('button[aria-label="Apri menu di navigazione"]');
    await new Promise((r) => setTimeout(r, 400));

    const mobileMenuOpen = await page.$eval('#mobile-navigation', (el) =>
      el.classList.contains('opacity-100')
    );
    console.log('Mobile menu opened:', mobileMenuOpen);

    const mobileMenuScreenshot = path.join(SCREENSHOTS_DIR, '04-mobile-menu.png');
    await page.screenshot({ path: mobileMenuScreenshot });
    console.log(`Saved screenshot: ${mobileMenuScreenshot}`);

    // Close mobile menu
    await page.click('button[aria-label="Chiudi menu di navigazione"]');
    await new Promise((r) => setTimeout(r, 400));

    // Capture Full Page Mobile Screenshot
    const mobileScreenshot = path.join(SCREENSHOTS_DIR, '05-mobile-full.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${mobileScreenshot}`);

    // 6. Compact Mobile Test (320x640)
    console.log('\n--- TEST 6: COMPACT MOBILE 320x640 VIEWPORT ---');
    await page.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 300));
    
    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('Compact mobile horizontal overflow detected:', hasHorizontalOverflow);
    if (hasHorizontalOverflow) {
      console.warn('[WARNING] Horizontal overflow detected on 320px screen!');
    } else {
      console.log('PASS: No horizontal overflow on 320px screen.');
    }

    // 7. Request Builder Test
    console.log('\n--- TEST 7: INTERACTIVE REQUEST BUILDER ---');
    await page.evaluate(() => {
      document.getElementById('contatti')?.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Click "Cerimonie & Matrimoni" option in the interactive assistant
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#contatti button'));
      const target = buttons.find((b) => b.innerText.toUpperCase().includes('CERIMONIE & MATRIMONI'));
      if (target) target.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Verify email link reflects selected service
    const generatedMailto = await page.$eval(
      '#dynamic-email-link',
      (el) => el.getAttribute('href')
    );
    console.log('Generated dynamic mailto URL:', decodeURIComponent(generatedMailto).slice(0, 100) + '...');
    if (!decodeURIComponent(generatedMailto).includes('Cerimonie & Matrimoni')) {
      throw new Error('Interactive builder did not update mailto subject/body!');
    }

    console.log('\n--- QA TEST SUMMARY ---');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Failures: ${networkErrors.length}`);

    if (consoleErrors.length > 0) {
      console.error('FAIL: Console errors were logged during testing.');
      process.exitCode = 1;
    } else {
      console.log('PASS: Zero console errors.');
    }

  } catch (err) {
    console.error('[QA Test Failed]', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('[QA] Server and browser closed.');
  }
}

runTests();
