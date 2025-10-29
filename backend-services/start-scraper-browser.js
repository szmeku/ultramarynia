const fs = require('fs');
const puppeteer = require('puppeteer');
const {allowCookies} = require('./lib/allowCookies')
const secrets = require('../secrets/secrets.json');

async function login_and_save_browser_session(){

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',

            // added
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--remote-debugging-address=0.0.0.0',
            '--remote-debugging-port=9222',

            '--start-maximized'],
        headless: true,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto("https://facebook.com");

    await allowCookies(page)

    await page.type("#email", secrets.fb_login );
    await page.type("#pass", secrets.fb_pass);
    await page.click("[type='submit']");

    await page.waitForXPath("//span[contains(text(), 'Jan Skoczynski')]");
    console.log("Element found: Jan Skoczynski");

    const browserWSEndpoint = browser.wsEndpoint();
    fs.writeFileSync('./sessions/browser-session.json', JSON.stringify({browserWSEndpoint}));
    console.log(browserWSEndpoint);
}

(async () => {

    await login_and_save_browser_session()
})();