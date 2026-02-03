const fs = require('fs');
const puppeteer = require('puppeteer');
const {allowCookies} = require('./lib/allowCookies')
const secrets = require('../secrets/secrets.json');

let screenshotCounter = 0;

async function takeScreenshot(page, label) {
    screenshotCounter++;
    const filename = `screenshot_${String(screenshotCounter).padStart(3, '0')}_${label}.png`;
    await page.screenshot({ path: `/app/backend-services/${filename}`, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
}

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
    await takeScreenshot(page, 'after_goto');

    await allowCookies(page)
    await takeScreenshot(page, 'after_allowCookies');

    await page.type("#email", secrets.fb_login, { delay: Math.random() * 100 + 50 });
    await takeScreenshot(page, 'after_type_email');

    await page.type("#pass", secrets.fb_pass, { delay: Math.random() * 100 + 50 });
    await takeScreenshot(page, 'after_type_pass');

    // Click submit and wait for navigation to complete
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click("[type='submit']")
    ]);
    await takeScreenshot(page, 'after_click_submit');

    // Take screenshots every 2 seconds while waiting for login
    let loginSuccess = false;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max

    while (!loginSuccess && attempts < maxAttempts) {
        await page.waitForTimeout(2000);
        await takeScreenshot(page, `waiting_login_${attempts + 1}`);

        try {
            await page.waitForXPath("//span[contains(text(), 'Mirek')]", { timeout: 100 });
            loginSuccess = true;
        } catch (e) {
            attempts++;
        }
    }

    if (loginSuccess) {
        await takeScreenshot(page, 'after_login');
        console.log("Element found: Janek Koperwo");
    } else {
        console.log("Login timeout - element not found after 60 seconds");
    }

    const browserWSEndpoint = browser.wsEndpoint();
    fs.writeFileSync('./sessions/browser-session.json', JSON.stringify({browserWSEndpoint}));
    console.log(browserWSEndpoint);
}

(async () => {

    await login_and_save_browser_session()
})();