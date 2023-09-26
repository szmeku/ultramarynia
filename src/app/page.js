import {fetchEventsGroupedByDates} from "@/services/events";
import {pipe, values} from "ramda";

const EventsGroup = ({events, light}) => {

    const backgroundColor = light ? '#f2f2f2' : '#e6e6e6';

    return <div style={{backgroundColor, padding: 10, color: 'black'}}>
        <span style={{fontSize: 29, weight: 'bold', marginBottom: 15, display: 'inline-block',  textTransform: 'uppercase'}}>{events[0].dayOfTheWeekPl}</span>
        <span style={{color: 'gray', marginLeft: 10}}>{events[0].datePl}</span>
        <ul style={{listStyleType: 'none', margin: 0, padding: 0, paddingTop: 15, borderTop: '3px solid black'}}>
            {events.map(event => <li key={event.title} style={{padding: 5, marginBottom: 8}}>
                <span style={{backgroundColor: 'yellow', color: 'black'}}>{event.hourPl}</span>
                <a style={{marginLeft: 13}} href={event.url} target="_blank">{event.title}
                <span style={{color: 'gray', marginLeft: 13}}>{event.venue}</span></a>
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