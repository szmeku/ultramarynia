const eventSources = require('../data/eventSources.json');
const {pipe, pluck, map, take, andThen, otherwise, flatten, tap} = require("ramda");
const {fetchFBEventsForVenue} = require("./lib/fetchFacebookEvents");
const {Firestore} = require("@google-cloud/firestore");
const Promise = require('bluebird')
const {deleteFirestoreEvents} = require("./lib/deleteFirestoreEvents");


const firestore = new Firestore({
    keyFilename: '../service-key.json',
});

const convertToPlainObject = v => ({...v});

deleteFirestoreEvents(firestore).then(() => pipe(
    pluck('url'),
    // take(1), // just for testing
    v => Promise.mapSeries(v, fetchFBEventsForVenue),
    tap(andThen(v => {
        console.log('DODODODODOD before concat length', v.length);

        v.map((v, index) => {
                console.log(index, 'DODODODODOD after series length', v.length);
        },v)
    })),
    v => Promise.all(v),
    andThen(flatten),
    tap(andThen(v => {
        console.log('DODODODODOD after series length', v.length);
    })),
    andThen((items)  => {

        const collection = firestore.collection('events')

        console.log('DODODODODOD all events length', items.length)

        return map(pipe(
            convertToPlainObject,
            v => collection.add(v),
        ))(items)
    }),
    v => Promise.all(v),
    otherwise((err) => console.log(err)),
    andThen(() => {
        console.log('Data scraped and saved!')
    })
)(eventSources))

