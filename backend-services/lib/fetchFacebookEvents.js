const puppeteer = require('puppeteer');
const path = require('path')
const {
    pipe,
    map,
    andThen,
    juxt,
    pluck,
    identity,
    splitEvery,
    flatten,
    zipWith,
    apply,
    otherwise, replace, tap, when, isEmpty, prop
} = require("ramda");
const {extractEventsFromStrings} = require("./extractEventsFromStrings");
const Promise = require('bluebird');

const scrollToBottom = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            let count = 0;
            const timer = setInterval(() => {
                count += 1;

                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || count > 25) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

function normalizeUrlForFilename(inputUrl) {
    const parsedUrl = new URL(inputUrl);
    const normalizedPath = path.normalize(parsedUrl.hostname + parsedUrl.pathname);
    return normalizedPath.replace(/[^a-zA-Z0-9]/g, '_');
}


const fetchRawEventsFromFBUrl = (browserWSEndpoint, pagesWithoutEventsPath) => pipe(
    v => v + '/upcoming_hosted_events',
    async (venueEventsUrl) => {
        const browser = await puppeteer.connect({browserWSEndpoint, defaultViewport: null,});
        const page = await browser.newPage();
        await page.goto(venueEventsUrl);

        const page_unavailable = await page.evaluate(() => document.body.textContent.contains('Ta strona jest niedostępna'))

        if (page_unavailable) {
            await page.close();
            throw new Error(`Page unavailable: ${venueEventsUrl}`);
        }

        // Wait for the page to load completely
        await page.waitForTimeout(3000); // Adjust the timeout as needed

        try {
            // Check if there's a visible element with "Allow all cookies" or "Zezwól na wszystkie pliki cookie" text
            const allowCookiesButton = await page.$x(
                "//span[contains(., 'Allow all cookies') or contains(., 'Zezwól na wszystkie pliki cookie')]"
            );
            if (allowCookiesButton.length > 0) {
                // Click the button
                await allowCookiesButton[0].click();
                console.log('Clicked "Allow all cookies" or "Zezwól na wszystkie pliki cookie" button.');
            } else {
                console.log('"Allow all cookies" or "Zezwól na wszystkie pliki cookie" button not found.');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        try {
            // Wait for a dialog with role="dialog" to appear
            await page.waitForSelector('[role="dialog"]', { timeout: 2000 });

            // Click the first element inside the dialog
            const dialog = await page.$('[role="dialog"]');
            if (dialog) {
                const firstElement = await dialog.$('*');
                if (firstElement) {
                    await firstElement.click();
                    console.log('Clicked the first element inside the dialog.');
                } else {
                    console.log('No elements found inside the dialog.');
                }
            } else {
                console.log('Dialog with role="dialog" not found.');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        await scrollToBottom(page);

        const result = await page.$$eval('*[href^="https://www.facebook.com/events/"][aria-hidden="true"]', elements => elements.map(a => ({

                url: a.href,
                img: a.querySelector('img').src,
                text: a.parentElement.parentElement.textContent,
            })
        ));

        if (isEmpty(result)) {

            const filename = pagesWithoutEventsPath + '/' + normalizeUrlForFilename(venueEventsUrl) + '.png';
            await page.screenshot({ path: filename, fullPage: true });
        }

        await page.close();

        return map(v => ({
            ...v,
            source: venueEventsUrl,
            text: replace("Wydarzenie ", "", v.text),
        }))(result);
    },
    otherwise(v => {
        console.error({error: v});
        return ({error: v})
    })
);

const fetchFBEventsForVenue = (browserWSEndpoint, pagesWithoutEventsPath) => pipe(
    fetchRawEventsFromFBUrl(browserWSEndpoint, pagesWithoutEventsPath),
    andThen(juxt([
        // todo: split could be put at the top for better performance
        pipe(pluck('text'), extractEventsFromStrings),
        identity,
    ])),
    Promise.all,
    andThen(apply(zipWith((extractedEvent, rawEvent) => ({
        ...extractedEvent,
        ...rawEvent,
    })))),
)

module.exports = {
    fetchFBEventsForVenue
}