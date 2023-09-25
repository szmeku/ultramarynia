const {generateFakeEvents} = require("./lib/generate-fake-events");
const {Firestore} = require('@google-cloud/firestore');
const {map} = require("ramda");

const firestore = new Firestore({
    keyFilename: '../service-key.json',
});

const docRef = firestore.collection('fakeEvents')

generateFakeEvents()
    .then(map(async (event) => {
        return await docRef.add(event)
    }))