import {pipe, values} from "ramda";
import {fetchEventsGroupedByDates} from "@/services/events";

const EventsGroup = ({events, light}) => {

    const backgroundColor = light ? '#f2f2f2' : '#e6e6e6';

    return <div style={{backgroundColor, padding: 10}}>
        <span style={{fontSize: 20, weight: 'bold'}}>{events[0].dayOfTheWeekPl}</span> {events[0].datePl}
        <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
            {events.map(event => <li key={event.title} style={{padding: 5}}>
                {event.hourPl} <a href={event.url} target="_blank">{event.title}</a>
            </li>)}
        </ul>
    </div>


}

export default async function Home() {

    const eventsGroupedByDate = await fetchEventsGroupedByDates()

    return (
        <div>
            {pipe(
                values,
                v => v.map((events, index) =>  <EventsGroup key={index} events={events} light={index % 2 ? true : false}/>),
            )(eventsGroupedByDate)}
        </div>
    );
};