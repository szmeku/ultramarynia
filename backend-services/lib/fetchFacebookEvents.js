const puppeteer = require('puppeteer');
const path = require('path')
const {browserWSEndpoint} = require('../browser-session.json');
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


const fetchRawEventsFromFBUrl = (pagesWithoutEventsPath) => pipe(
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

const fetchFBEventsForVenue = (pagesWithoutEventsPath) => pipe(
    fetchRawEventsFromFBUrl(pagesWithoutEventsPath),
    andThen(juxt([
        // todo: split could be put at the top for better performance
        pipe(pluck('text'), splitEvery(5), map(extractEventsFromStrings), Promise.all, andThen(flatten)),
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