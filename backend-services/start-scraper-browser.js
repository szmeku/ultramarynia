const fs = require('fs');
const puppeteer = require('puppeteer');

// run this and in opened browser login to facebook

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
        headless: false,
        defaultViewport: null,
    });
    const browserWSEndpoint = browser.wsEndpoint();

    console.log("WebSocket Endpoint URL:", browserWSEndpoint);

    fs.writeFileSync('./browser-session.json', JSON.stringify({browserWSEndpoint}));

    // Remember to close the browser when you're done
    // await browser.close();
})();