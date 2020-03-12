import { userContext } from "../../_app";
import React, { useMemo, useEffect, useState, useContext } from "react";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../../components/shared/table";
import Link from "next/link";
import { useRouter } from "next/router";
import moment from "moment";
import {
  AiFillEdit,
  AiFillEye,
  AiFillPlusCircle,
  AiFillDelete
} from "react-icons/ai";

const GET_TRIPS = gql`
  query Trips($userId: String!) {
    trips(where: { author_id: { _eq: $userId } }) {
      id
      tripName
      departDateTime
      returnDateTime
      # organization {
      #   id
      #   name
      # }

      # pickupLocation {
      #   id
      #   name
      # }
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

  const [trips, setTrips] = useState([]);
  const {
    data: tripsData,
    error: tripsEror,
    loading: tripsLoading,
    refetch
  } = useQuery(GET_TRIPS, { variables: { userId } });

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
        <h3 className="text-2xl col-start-6 text-center">Trips </h3>
        <Link href="/user/[id]/trip/new" as={`/user/${userId}/trip/new`}>
          <a className="mr-4 col-start-12 ">
            <button>
              <AiFillPlusCircle className="text-4xl text-blue-400" />
            </button>
          </a>
        </Link>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-2"></div>
        <div className="col-start-3 col-span-10 mx-2">
          {tripsData && <Table columns={columns} data={trips} />}
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Trips);
