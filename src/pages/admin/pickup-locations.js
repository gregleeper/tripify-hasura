import React, { useMemo } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import SideNav from "../../components/sideAdminNav";
import { AiFillPlusCircle, AiFillEdit, AiFillDelete } from "react-icons/ai";
import Link from "next/link";

const GET_PICKUPLOCATIONS = gql`
  query PickupLocations {
    pickupLocations {
      id
      name
    }
  }
`;

const DELETE_PICKUPLOCATION = gql`
  mutation DeletePickupLocation($id: uuid!) {
    delete_pickupLocations(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const PickupLocations = () => {
  const {
    data: pickupLocsData,
    error: pickupLocsEror,
    loading: pickupLocsLoading,
    refetch
  } = useQuery(GET_PICKUPLOCATIONS);

  const [DeletePickupLocation] = useMutation(DELETE_PICKUPLOCATION);
  const handleDelete = id => {
    DeletePickupLocation({
      variables: { id },
      update: cache => {
        const existingLocations = cache.readQuery({
          query: GET_PICKUPLOCATIONS
        });
        const filteredLocations = existingLocations.pickupLocations.filter(
          p => p.id !== id
        );
        cache.writeQuery({
          query: GET_PICKUPLOCATIONS,
          data: { pickupLocations: filteredLocations }
        });
      }
    });
    refetch();
  };

  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      {
        id: "id",
        Header: "Edit",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/pickup-location/edit/[id]"
            as={`/admin/pickup-location/edit/${original.id}`}
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

        Cell: ({ cell: { value }, row: { original, index } }) => (
          <button onClick={() => handleDelete(original.id, index)} alt="delete">
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
        <div className="col-span-10">
          <div className="grid grid-cols-12 mt-2">
            <div className="col-start-6 col-span-2">
              <h3 className="text-xl">Pickup Locations</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/pickup-location/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-start-3 col-span-10 mx-2">
            {pickupLocsData && (
              <Table columns={columns} data={pickupLocsData.pickupLocations} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(PickupLocations);
