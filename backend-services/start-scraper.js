const eventSources = require('../data/eventSources.json');
const {pipe, pluck, map, andThen, otherwise, flatten, tap, uniqBy, equals} = require("ramda");
const {fetchFBEventsForVenue} = require("./lib/fetchFacebookEvents");
const {Firestore} = require("@google-cloud/firestore");
const Promise = require('bluebird')
const {deleteFirestoreEvents} = require("./lib/deleteFirestoreEvents");
const {netlifyBuildHook} = require('../secrets/secrets.json');
const puppeteer = require("puppeteer");
const {promises: fs_p} = require("fs");

const firestore = new Firestore({
    keyFilename: './secrets/service-key.json',
});

(async function () {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
        headless: true,
        defaultViewport: null,
    });
    const browserWSEndpoint = browser.wsEndpoint();

    const repeatUntilTrue = (fn) => fn()
        .then(v => {
            if (v === true) {
                console.log('success')
                return v;
            } else {
                console.log('failed, trying again');
                return repeatUntilTrue(fn)
            }
        })

    const testWebsite = () => {
        return fetch('https://katokult.pl')
            .then(v => v.text())
            .then(v => v.includes('piątek'))
    }

    const convertToPlainObject = v => ({...v});


    async function recreateFolder(folderPath) {
        try {
            await fs_p.rm(folderPath, {recursive: true, force: true});
        } catch (error) {
            // Handle error if needed, e.g., log it
            console.error(error);
        }
        try {
            await fs_p.mkdir(folderPath, {recursive: true});
        } catch (error) {
            // Handle error if needed, e.g., log it
            console.error(error);
        }
    }

    await (async () => {

        const pagesWithoutEventsPath = './pagesWithNoEvents';
        await recreateFolder(pagesWithoutEventsPath)

        pipe(
            pluck('url'),
            // take(1), // just for testing
            v => Promise.mapSeries(v, fetchFBEventsForVenue(browserWSEndpoint, pagesWithoutEventsPath)),
            tap(andThen(v => {
                console.log('DODODODODOD before concat length', v.length);

                v.map((v, index) => {
                    console.log(index, 'DODODODODOD after series length', v.length);
                }, v)
            })),
            v => Promise.all(v),
            andThen(flatten),
            tap(andThen(v => {
                console.log('DODODODODOD after series length', v.length);
            })),
            andThen(uniqBy(v => `${v.datePl}||${v.hourPl}||${v.venue}||${v.title}`)),
            andThen((items) => {

                if (items.length > 0) {
                    return deleteFirestoreEvents(firestore).then(() => {
                        const collection = firestore.collection('events');

                        console.log('DODODODODOD all events length', items.length)

                        return map(pipe(
                            convertToPlainObject,
                            v => collection.add(v),
                        ))(items)
                    })
                } else {
                    throw Error("didn't downloaded any events")
                }
            }),
            v => Promise.all(v),
            andThen(() => {
                console.log('Data scraped and saved!')

                return repeatUntilTrue(
                    () => fetch(netlifyBuildHook, {method: 'POST'})
                        .then(() => Promise.delay(120000))
                        .then(() => testWebsite())
                )
            }),
            andThen(() => {
                browser.close().then(
                    process.exit()
                )
            }),
            otherwise((err) => {
                console.log(err)

                browser.close().then(
                    process.exit()
                )
            })
        )(eventSources)
    })();
}())
