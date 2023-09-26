const {Firestore} = require('@google-cloud/firestore');

const firestore = new Firestore({
    keyFilename: './service-key.json',
});

export const fetchEvents = async () => {
    const snapshot = await firestore
        .collection('fakeEvents')
        // todo: this date is just for tests, should be "yesterday midnight" (very important at 20.30 i want to see events also that started at 20)
        .where('dateAndTime', '>', new Date('2022-02-10'))
        .get();

    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return documents;
}