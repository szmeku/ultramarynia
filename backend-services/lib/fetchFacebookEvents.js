const puppeteer = require('puppeteer');

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
    otherwise
} = require("ramda");
const {extractEventsFromStrings} = require("./extractEventsFromStrings");
const Promise = require('bluebird');

const scrollToBottom = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const fetchRawEventsFromFBUrl = pipe(
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

        await page.close();

        return map(v => ({
            ...v,
            source: venueEventsUrl
        }))(result);
    },
    otherwise(v => {
        console.error({error: v});
        return ({error: v})
    })
);

const fetchFBEventsForVenue = pipe(
    fetchRawEventsFromFBUrl,
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