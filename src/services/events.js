import {pipe, groupBy, prop, uniqBy, trim} from "ramda";
const {Firestore} = require('@google-cloud/firestore');

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT2);

const firestore = new Firestore({
    projectId: credentials.project_id,
    credentials,

});

import moment from 'moment';
require('moment/locale/pl');
moment.locale('pl');
// const twoWeeksFromNow = moment().add(2, 'weeks').format('YYYY-MM-DD');

export const fetchEventsGroupedByDates = async () => {
    const yesterday = moment().subtract(1, 'days').startOf('day').format(); // Format as needed

    const snapshot = await firestore
        .collection('events')
        .where('dateAndTime', '>', yesterday)
        .orderBy("dateAndTime", "asc")
        .get();

    return pipe(
        groupBy(prop('datePl')),
    )(snapshot.docs.map(pipe(
        doc => ({id: doc.id, ...doc.data()}),
        el => {
            // el.dateAndTime is Firestore Timestamp, convert to Date
            const date = el.dateAndTime.toDate ? el.dateAndTime.toDate() : new Date(el.dateAndTime);
            return {
                dayOfTheWeekPl: moment(date).format('dddd'),
                datePl: moment(date).format('DD-MM-YYYY'),
                hourPl: moment(date).format('HH:mm'),
                dateAndTime: date.toISOString(), // Send ISO string to client
                ...el
            };
        }
    )));
}