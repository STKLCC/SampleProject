// screenshot.js
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.goto('https://example.com', {
  waitUntil: 'networkidle2',
  timeout: 60000
});
await page.screenshot({ path: 'page.png', fullPage: true });

await browser.close();
console.log('Screenshot saved as page.png');
