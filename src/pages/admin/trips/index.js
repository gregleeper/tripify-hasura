import { userContext } from "../../_app";
import React, { useMemo, useEffect, useState, useContext } from "react";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import gql from "graphql-tag";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../../components/shared/table";
import Link from "next/link";
import { useRouter } from "next/router";
import moment from "moment";
import Card from "../../../components/shared/Card";
import {
  AiFillEdit,
  AiFillEye,
  AiFillPlusCircle,
  AiFillDelete
} from "react-icons/ai";
import SideNav from "../../../components/sideAdminNav";

const GET_TRIPS = gql`
  query Trips($departDate: timestamptz!) {
    trips(where: { departDateTime: { _gte: $departDate } }) {
      id
      tripName
      departDateTime
      returnDateTime
      organization {
        id
        name
      }

      pickupLocation {
        id
        name
      }
      tripVehiclesByTripId {
        vehicle {
          id
          name
        }
      }
    }
  }
`;

const DELETE_TRIP = gql`
  mutation DeleteTrip($id: ID!) {
    delete_trips(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const Trips = () => {
  const router = useRouter();
  const userId = router.query.id;
  const today = new Date();
  const [trips, setTrips] = useState([]);
  const [
    GetFutureTrips,
    { data: tripsData, error: tripsEror, loading: tripsLoading, refetch }
  ] = useLazyQuery(GET_TRIPS);
  const [DeleteTrip] = useMutation(
    DELETE_TRIP,

    {
      update(cache, { data: { DeleteTrip } }) {
        const { trips } = cache.readQuery({ query: GET_TRIPS });

        cache.writeQuery({
          query: GET_TRIPS,
          data: { trips: trips.concat([DeleteTrip]) }
        });
      }
    }
  );

  useEffect(() => {
    GetFutureTrips({ variables: { departDate: today } });
  }, []);

  useEffect(() => {
    if (tripsData) {
      setTrips(tripsData.trips);
    }
  }, [tripsData]);

  const handleDelete = id => {
    DeleteTrip({ variables: { id } });
    refetch();
  };

  const columns = useMemo(
    () => [
      { id: "name", Header: "Name", accessor: "tripName" },
      // {
      //   id: "destination",
      //   Header: "Destination",
      //   accessor: "destination.name"
      // },
      {
        Header: "Depart Date",
        accessor: d =>
          moment(d.departDateTime)
            .local()
            .format("MM/DD/YYYY h:mm a")
      },
      {
        Header: "Return Date",
        accessor: d =>
          moment(d.returnDateTime)
            .local()
            .format("MM/DD/YYYY h:mm a")
      },
      {
        id: "edit",
        Header: "Edit",
        accessor: "id",
        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/user/trip/edit/[id]"
            as={`/user/trip/edit/${original.id}`}
          >
            <a>
              <AiFillEdit className="text-lg text-teal-700" />
            </a>
          </Link>
        )
      },
      {
        id: "delete",
        Header: "Delete",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <button onClick={() => handleDelete(original.id)} alt="delete">
            <AiFillDelete className="text-lg text-red-500" />
          </button>
        )
      }
    ],
    []
  );

  return (
    <Layout>
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <SideNav />
        </div>
        <div className="col-start-3 col-span-10">
          <div className="grid grid-flow-col mt-2 mr-4 grid-rows-3 gap-4">
            {/* <div className="col-start-6 col-span-2">
              <h3 className="text-2xl text-center">Trips </h3>
            </div>
            <div className="col-start-11 col-span-2">
              <Link href="/user/[id]/trip/new" as={`/user/${userId}/trip/new`}>
                <a className="mr-4 col-start-12 ">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div> */}
            <div className="col-start-1 col-span-1">
              <Card
                title="Upcoming Trips Needing Attention"
                description="Upcoming trips needing vehicles and/or drivers assigned"
                to="/admin/trips/upcoming/attention"
              />
            </div>
            <div className="col-start-3 col-span-2">
              <Card
                title="Past Trips Needing Attention"
                description="Completed trips needing miles logged."
                to="/admin/trips/completed/attention"
              />
            </div>
            <div className="col-start-1 col-span-1">
              <Card
                title="Upcoming Trips Ready"
                description="Upcming trips that have drivers and vehicles assigned."
                to="/admin/trips/upcoming/ready"
              />
            </div>
            <div className="col-start-3 col-span-2">
              <Card
                title="Past Trips Fully Completed"
                description="Past trips fully completed."
                to="/admin/trips/completed/fully"
              />
            </div>
            <div className="col-start-1 col-span-1">
              <Card
                title="All Upcoming Trips"
                description="View all upcoming trips."
                to="/admin/trips/upcoming/all"
              />
            </div>
            <div className="col-start-3 col-span-2">
              <Card
                title="All Past Trips"
                description="All past trips."
                to="/admin/trips/completed/all"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Trips);
