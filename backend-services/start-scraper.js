const eventSources = require('../data/eventSources.json');
const {pipe, pluck, map, take, andThen, otherwise, flatten, tap, uniqBy, equals} = require("ramda");
const {fetchFBEventsForVenue} = require("./lib/fetchFacebookEvents");
const {Firestore} = require("@google-cloud/firestore");
const Promise = require('bluebird')
const {deleteFirestoreEvents} = require("./lib/deleteFirestoreEvents");
const {netlifyBuildHook} = require('../secrets.json');

const firestore = new Firestore({
    keyFilename: '../service-key.json',
});

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
    return fetch('https://katokult.pl').then(v => v.text()).then(v => {

        console.log('v', v)

        return v.includes('piątek')
    })
}

const convertToPlainObject = v => ({...v});

pipe(
    pluck('url'),
    // take(1), // just for testing
    v => Promise.mapSeries(v, fetchFBEventsForVenue),
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
    andThen(() => process.exit()),
    otherwise((err) => {
        console.log(err)
        process.exit()
    })
)(eventSources)