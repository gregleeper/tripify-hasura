import { userContext } from "../../../_app";
import React, { useMemo, useEffect, useState, useContext } from "react";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import gql from "graphql-tag";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../../../components/shared/table";
import Link from "next/link";
import { useRouter } from "next/router";
import moment from "moment";

import {
  AiFillEdit,
  AiFillEye,
  AiFillPlusCircle,
  AiFillDelete
} from "react-icons/ai";
import SideNav from "../../../../components/sideAdminNav";

const GET_TRIPS = gql`
  query Trips($departDate: timestamptz!) {
    trips(where: { departDateTime: { _lte: $departDate } }) {
      id
      tripName
      departDateTime
      returnDateTime
      destination {
        name
        address
      }
      numberPrimaryVehiclesReq
      numberSupportVehiclesReq
      numberTravelers
      primaryVehicleType {
        name
      }
      supportVehicleType {
        name
      }
      organization {
        id
        name
      }

      pickupLocation {
        id
        name
      }
      tripVehiclesByTripId_aggregate {
        aggregate {
          count
        }
      }
      tripDriversByTripId_aggregate {
        aggregate {
          count
        }
      }
      tripVehiclesByTripId {
        vehicle {
          id
          name
        }
      }
      tripDriversByTripId {
        driver {
          user {
            name
            email
          }
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

const AllFutureTrips = () => {
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

  if (tripsEror) {
    console.log(tripsEror);
  }
  const handleDelete = id => {
    DeleteTrip({ variables: { id } });
    refetch();
  };

  const columns = useMemo(
    () => [
      { id: "name", Header: "Name", accessor: "tripName" },
      {
        id: "destination",
        Header: "Destination",
        accessor: "destination.name"
      },
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
        Header: "Primary Vehicle Type Needed",
        accessor: "primaryVehicleType.name"
      },
      {
        Header: "Support Vehicle Type Needed",
        accessor: "supportVehicleType.name"
      },
      {
        Header: "# Vehicles Assigned",
        accessor: "tripVehiclesByTripId_aggregate.aggregate.count"
      },
      {
        Header: "# Vehicles Assigned",
        accessor: "tripDriversByTripId_aggregate.aggregate.count"
      },
      {
        id: "manage",
        Header: "Manage",
        accessor: "id",
        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/trips/manage-trip/[id]/miles"
            as={`/admin/trips/manage-trip/${original.id}/miles`}
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
          <div className="grid grid-cols-12 mt-3">
            <div className="col-start-6 col-span-2">
              <h3 className="text-2xl text-center">All Past Trips</h3>
            </div>
          </div>
          <div className="grid grid-cols-12 mt-2">
            <div className="col-start-1 col-span-11 ">
              {trips.length > 0 ? (
                <Table columns={columns} data={trips} />
              ) : (
                <div className="text-center">No trips.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(AllFutureTrips);
