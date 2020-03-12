import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import moment from "moment";
import { withApollo } from "../lib/apollo";

const localizer = momentLocalizer(moment);
let allViews = Object.keys(Views).map(k => Views[k]);

const TRIPS = gql`
  query Trips {
    trips {
      id
      tripName
      departDateTime
      returnDateTime
      destination {
        name
        address
      }
      organization {
        id
        name
      }
    }
  }
`;

const GeneralTripCalendar = props => {
  //const [events, setEvents] = useState([]);
  const { data, loading, error } = useQuery(TRIPS);
  // useEffect(() => {
  //   if (data) {

  //     data.trips.map(t => {
  //       t.departDateTime = new Date(t.departDateTime);
  //       t.returnDateTime = new Date(t.returnDateTime);
  //     });
  //   }
  // }, [data]);

  return (
    <div>
      <Calendar
        localizer={localizer}
        views={allViews}
        startAccessor="departDateTime"
        endAccessor="returnDateTime"
        defaultDate={new Date()}
        titleAccessor="tripName"
        style={{ height: 700, width: 900 }}
        events={data ? data.trips : []}
        onSelectEvent={event => {
          console.log(event);
        }}
      />
    </div>
  );
};

export default withApollo(GeneralTripCalendar);
