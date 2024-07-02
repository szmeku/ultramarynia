const admin = require('firebase-admin');
const serviceAccount = require('./secrets/service-key.json');

const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
    keyFilename: './secrets/service-key.json',
});

async function addData() {
    const docRef = firestore.collection('users').doc('user1');
    await docRef.set({
        name: 'John',
        email: 'john@example.com'
    });
}

addData().catch(console.error);
