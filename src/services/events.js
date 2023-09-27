import {pipe, groupBy, prop} from "ramda";
const {Firestore} = require('@google-cloud/firestore');

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT2);

const firestore = new Firestore({
    projectId: credentials.project_id,
    credentials,

});

import moment from 'moment';
require('moment/locale/pl');
moment.locale('pl');

export const fetchEventsGroupedByDates = async () => {
    const snapshot = await firestore
        .collection('events')
        // todo: this date is just for tests, should be "yesterday midnight" (very important at 20.30 i want to see events also that started at 20)
        // .where('dateAndTime', '>', new Date('2022-02-10'))
        .orderBy("dateAndTime", "asc")
        .get();

    return pipe(
        groupBy(prop('datePl')),
    )(snapshot.docs.map(pipe(
        doc => ({id: doc.id, ...doc.data()}),
        el => ({
            dayOfTheWeekPl: moment(el.dateAndTime).format('dddd'),
            datePl: moment(el.dateAndTime).format('DD-MM-YYYY'),
            hourPl: moment(el.dateAndTime).format('HH:mm'),
        ...el})
    )));
}