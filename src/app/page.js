import {fetchEventsGroupedByDates} from "@/services/events";
import {pipe, values} from "ramda";
import './styles.css';
const moment = require('moment');

const dateToGoogleCalendarDate = (rawDate) => {

    const date = moment(rawDate);
    const endDate = date.clone().add(1, 'hours');

    const formattedStartDate = date.utc().format("YYYYMMDDTHHmmss") + "Z";
    const formattedEndDate = endDate.utc().format("YYYYMMDDTHHmmss") + "Z";

    return `${formattedStartDate}/${formattedEndDate}`;
}

const Event = ({event}) => {

    const addToCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.title}&dates=${dateToGoogleCalendarDate(event.dateAndTime)}&details=${event.url}`
    // todo: add location at some point
    //  &location=Location

    return <li key={event.title} style={{padding: 5, marginBottom: 8}}>
        <span className="hourChip">{event.hourPl}</span>
        <a href={addToCalendarUrl} target="_blank">📅</a>
        <a href={event.url} target="_blank">{event.title}</a>
        <span className="lighter">{event.venue}</span>
        <span className="lighter">{event.category}</span>
    </li>
}

const EventsGroup = ({events, light}) => {

    const backgroundColor = light ? '#f2f2f2' : '#e6e6e6';

    return <div className="eventsGroup" style={{backgroundColor}}>
        <span style={{fontSize: 29, weight: 'bold', marginBottom: 15, display: 'inline-block',  textTransform: 'uppercase'}}>{events[0].dayOfTheWeekPl}</span>
        <span style={{color: 'gray', marginLeft: 10}}>{events[0].datePl}</span>
        <ul style={{listStyleType: 'none', margin: 0, padding: 0, paddingTop: 15, borderTop: '3px solid black'}}>
            {events.map(event => <Event key={event.title} event={event}/>)}
        </ul>
    </div>


}

export default async function Home() {

    const eventsGroupedByDate = await fetchEventsGroupedByDates()

    return (
        <div>
            {pipe(
                values,
                v => v.map((events, index) =>  <EventsGroup key={index} events={events} light={!!(index % 2)}/>),
            )(eventsGroupedByDate)}
        </div>
    );
};