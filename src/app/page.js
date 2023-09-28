import {fetchEventsGroupedByDates} from "@/services/events";
import {pipe, values} from "ramda";
import './styles.css';
const moment = require('moment');

const dateToGoogleCalendarDate = (rawDate) => {

    const date = moment(rawDate);
    const endDate = date.clone().add(1, 'hours');

    const formattedStartDate = date.utc(true).format("YYYYMMDDTHHmmss");
    const formattedEndDate = endDate.utc(true).format("YYYYMMDDTHHmmss");

    return `${formattedStartDate}/${formattedEndDate}`;
}

const Event = ({event}) => {

    const addToCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.title}&dates=${dateToGoogleCalendarDate(event.dateAndTime)}&details=${event.url}`
    // todo: add location at some point
    //  &location=Location

    return <li key={event.title} style={{padding: 5, marginBottom: 8}}>
        <span className="hourChip">{event.hourPl}</span>&nbsp;&nbsp;
        <a className={"save"} href={addToCalendarUrl} target="_blank"><img src={'save.png'} alt={'save'}/></a>&nbsp;&nbsp;
        <a href={event.url} target="_blank">{event.title}</a>&nbsp;&nbsp;
        <span className="lighter">{event.venue}</span>&nbsp;&nbsp;
        <span className="lighter">{event.category}</span>
    </li>
}

const EventsGroup = ({events, light}) => {

    const backgroundColor = light ? '#f2f2f2' : '#e6e6e6';

    return <div className="eventsGroup" style={{backgroundColor}}>
        <span style={{fontSize: 29, weight: 'bold', marginBottom: 15, display: 'inline-block',  textTransform: 'uppercase'}}>{events[0].dayOfTheWeekPl}</span>
        <span className="date" style={{marginLeft: 10}}>{events[0].datePl}</span>
        <ul style={{listStyleType: 'none', margin: 0, padding: 0, paddingTop: 15, borderTop: '3px solid black'}}>
            {events.map(event => <Event key={event.title} event={event}/>)}
        </ul>
    </div>


}

export default async function Home() {

    const eventsGroupedByDate = await fetchEventsGroupedByDates()

    return (
        <div className={"main"}>
            <div className="top-info">
                {/*<img src="logo.png" alt="Kato Kult"/>*/}
                <h1>Kato Kult</h1>
                <div className="disclaimer">
                    <p>Agregator wydarzeń kulturalnych w Katowicach.</p>
                    <a target="_blank" href={"https://www.facebook.com/permalink.php?story_fbid=pfbid02FGiF5Lm1tNTVLytkB1TUyXxf8MJEhkSrDFFYeN9kzGjVpWUfqwJ1gTcCFsBaSQhwl&id=61551928588592&__cft__[0]=AZUNh--sPO_JfYI_2nRFEXkeY9igDfsIpo6wtfP9-1-OQKVrJNli_JbAnnzKUUi1vUmgWMY7tYmed7U6UrrvYcruEJq7Kw18Is9fkRHqDyyRqHUmIa5WBhVWbUDSJ4Kcr8fN4VKcPFy7NtadB34sTGci&__tn__=%2CO%2CP-R"}>Pomóż, ponarzekaj, zgłoś buga.</a>
                </div>
            </div>
            {pipe(
                values,
                v => v.map((events, index) =>  <EventsGroup key={index} events={events} light={!!(index % 2)}/>),
            )(eventsGroupedByDate)}
        </div>
    );
};