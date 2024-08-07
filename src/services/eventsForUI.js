import {pipe, tap, groupBy, prop} from "ramda";
const {Firestore} = require('@google-cloud/firestore');

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT2);

const firestore = new Firestore({
    projectId: credentials.project_id,
    credentials,

});

import moment from 'moment';
require('moment/locale/pl');
moment.locale('pl');

const fetchEventsGroupedByDates = async () => {
    const snapshot = await firestore
        .collection('fakeEvents')
        // todo: this date is just for tests, should be "yesterday midnight" (very important at 20.30 i want to see events also that started at 20)
        // .where('dateAndTime', '>', new Date('2022-02-10'))
        .orderBy("dateAndTime", "asc")
        .get();

    const documents = pipe(
        groupBy(prop('datePl')),
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

export const getServerSideProps = (async (context) => {
    const events = await fetchEventsGroupedByDates()
    return { props: { events } }
})

export default function events({
                                 events,
                             }) {
    return events
}