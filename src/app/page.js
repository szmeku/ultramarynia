import { fetchEventsGroupedByDates } from "@/services/events";
import { pipe, values } from "ramda";
import './styles.css';
const moment = require('moment');

const dateToGoogleCalendarDate = (rawDate) => {
    const date = moment(rawDate);
    const endDate = date.clone().add(1, 'hours');
    const formattedStartDate = date.utc(true).format("YYYYMMDDTHHmmss");
    const formattedEndDate = endDate.utc(true).format("YYYYMMDDTHHmmss");
    return `${formattedStartDate}/${formattedEndDate}`;
}

const Event = ({ event }) => {
    const addToCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.title}&dates=${dateToGoogleCalendarDate(event.dateAndTime)}&details=${event.url}`;

    return (
        <li key={event.title}>
            <div className="hourChip">
                <a target="_blank" href={addToCalendarUrl}>
                <img src={'save.png'} alt={'calendar icon'} /></a>
                &nbsp;{event.hourPl}
            </div>
            <a className="event-title" href={event.url} target="_blank">{event.title}</a>
            <div className="venue-category">
                {event.venue}&nbsp;&nbsp;|&nbsp;&nbsp;{event.category}
            </div>
        </li>
    );
}

const EventsGroup = ({ events }) => {
    return (
        <div className="eventsGroup">
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{events[0].dayOfTheWeekPl}</span>
            <span className="date">{events[0].datePl}</span>
            <ul>
                {events.map(event => <Event key={event.title} event={event} />)}
            </ul>
        </div>
    );
}

export default async function Home() {
    const eventsGroupedByDate = await fetchEventsGroupedByDates();

    return (
        <div className="main">
            <div className="top-info">
                <h1>Kato Kult</h1>
                <div className="disclaimer">
                    <p>Agregator wydarzeń kulturalnych w Katowicach.</p>
                    <a target="_blank" href={"https://www.facebook.com/permalink.php?story_fbid=pfbid02FGiF5Lm1tNTVLytkB1TUyXxf8MJEhkSrDFFYeN9kzGjVpWUfqwJ1gTcCFsBaSQhwl&id=61551928588592&__cft__[0]=AZUNh--sPO_JfYI_2nRFEXkeY9igDfsIpo6wtfP9-1-OQKVrJNli_JbAnnzKUUi1vUmgWMY7tYmed7U6UrrvYcruEJq7Kw18Is9fkRHqDyyRqHUmIa5WBhVWbUDSJ4Kcr8fN4VKcPFy7NtadB34sTGci&__tn__=%2CO%2CP-R"}>Pomóż, ponarzekaj, zgłoś buga.</a>
                </div>
            </div>
            {pipe(
                values,
                v => v.map((events, index) => <EventsGroup key={index} events={events} />),
            )(eventsGroupedByDate)}
        </div>
    );
}
