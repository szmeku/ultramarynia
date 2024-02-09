const {Firestore} = require("@google-cloud/firestore");
const admin = require('firebase-admin');
const firestore = new Firestore({
    keyFilename: '../service-key.json',
});

(async function(){
    const collectionRef = firestore.collection('fakeEvents')
    const snapshot = await collectionRef.get();

    const batch = firestore.batch();

    snapshot.docs.forEach((doc) => {
        const docRef = collectionRef.doc(doc.id);
        const dateStr = doc.data().dateAndTime;

        // Convert string to Timestamp
        const date = new Date(dateStr);
        const timestamp = admin.firestore.Timestamp.fromDate(date);

        batch.update(docRef, { dateAndTime: timestamp });
    });

    await batch.commit();
    console.log('Documents updated.');
})()