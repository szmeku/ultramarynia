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
        el => ({
            dayOfTheWeekPl: moment(el.dateAndTime).format('dddd'),
            datePl: moment(el.dateAndTime).format('DD-MM-YYYY'),
            hourPl: moment(el.dateAndTime).format('HH:mm'),
        ...el})
    )));
}