import {pipe, tap, groupBy, prop} from "ramda";
const {Firestore} = require('@google-cloud/firestore');

const firestore = new Firestore({
    keyFilename: './service-key.json',
});

import moment from 'moment';
require('moment/locale/pl');
moment.locale('pl');

export const fetchEventsGroupedByDates = async () => {
    const snapshot = await firestore
        .collection('fakeEvents')
        // todo: this date is just for tests, should be "yesterday midnight" (very important at 20.30 i want to see events also that started at 20)
        // .where('dateAndTime', '>', new Date('2022-02-10'))
        .orderBy("dateAndTime", "asc")
        .get();

    const documents = pipe(
        groupBy(prop('datePl')),
        tap(console.log),
    )(snapshot.docs.map(pipe(
        doc => ({id: doc.id, ...doc.data()}),
        el => ({
            dayOfTheWeekPl: moment(el.dateAndTime).format('dddd'),
            datePl: moment(el.dateAndTime).format('DD-MM-YYYY'),
            hourPl: moment(el.dateAndTime).format('HH:mm'),
        ...el})
    )));

    return documents;
}