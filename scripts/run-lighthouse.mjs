import http from 'http';
import fs from 'fs';
import path from 'path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

// MIME types
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
      resolve(server);
    });
  });
}

async function runLighthouseAudit() {
  const PORT = 4173;
  const server = await startServer(PORT);
  const url = `http://localhost:${PORT}`;

  console.log('[Lighthouse] Launching Chrome...');
  const browser = await chromeLauncher.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=9222'],
    headless: true,
  });

  try {
    console.log('[Lighthouse] Running Mobile Audit...');
    const mobileResult = await lighthouse(url, {
      port: 9222,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }, {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
        },
        throttlingMethod: 'provided',
      }
    });

    const mCats = mobileResult.lhr.categories;
    console.log('\n=======================================');
    console.log('--- LIGHTHOUSE AUDIT RESULTS (MOBILE) ---');
    console.log(`Performance:    ${Math.round(mCats.performance.score * 100)}`);
    console.log(`Accessibility:  ${Math.round(mCats.accessibility.score * 100)}`);
    console.log(`Best Practices: ${Math.round(mCats['best-practices'].score * 100)}`);
    console.log(`SEO:            ${Math.round(mCats.seo.score * 100)}`);
    console.log('=======================================\n');

    console.log('[Lighthouse] Running Desktop Audit...');
    const desktopResult = await lighthouse(url, {
      port: 9222,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }, {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
        },
        throttlingMethod: 'provided',
      }
    });

    const dCats = desktopResult.lhr.categories;
    console.log('=======================================');
    console.log('--- LIGHTHOUSE AUDIT RESULTS (DESKTOP) ---');
    console.log(`Performance:    ${Math.round(dCats.performance.score * 100)}`);
    console.log(`Accessibility:  ${Math.round(dCats.accessibility.score * 100)}`);
    console.log(`Best Practices: ${Math.round(dCats['best-practices'].score * 100)}`);
    console.log(`SEO:            ${Math.round(dCats.seo.score * 100)}`);
    console.log('=======================================\n');

    // Save report to qa-screenshots/lighthouse-report.json
    fs.writeFileSync(
      path.join(__dirname, '..', 'qa-screenshots', 'lighthouse-mobile.json'),
      JSON.stringify(mobileResult.lhr, null, 2)
    );
    console.log('Saved Lighthouse report to qa-screenshots/lighthouse-mobile.json');

  } catch (err) {
    console.error('[Lighthouse Error]', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runLighthouseAudit();
