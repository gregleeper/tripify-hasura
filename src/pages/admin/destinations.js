import React, { useMemo } from "react";
import Layout from "../../components/layout";
import Link from "next/link";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import SideNav from "../../components/sideAdminNav";
import { AiFillPlusCircle, AiFillEdit, AiFillDelete } from "react-icons/ai";

const GET_DESTINATIONS = gql`
  query Destinations {
    destinations {
      id
      name
      address
    }
  }
`;

const DELETE_DESTINATION = gql`
  mutation DeleteDestination($id: ID!) {
    deleteOneDestination(id: $id) {
      id
    }
  }
`;

const Destinations = () => {
  const {
    data: destinationsData,
    error: destinationsEror,
    loading: destinationsLoading,
    refetch
  } = useQuery(GET_DESTINATIONS);

  const [DeleteDestination] = useMutation(DELETE_DESTINATION, {
    update(cache, { data: DeleteDestination }) {
      const { destinations } = cache.readQuery({ query: GET_DESTINATIONS });

      cache.writeQuery({
        query: GET_DESTINATIONS,
        data: { destinations: destinations.concat([DeleteDestination]) }
      });
    }
  });

  const handleDelete = id => {
    DeleteDestination({ variables: { id } });
    refetch();
  };

  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Address", accessor: "address" },
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
      // {
      //   Header: "",
      //   accessor: "id",

      //   Cell: ({ cell: { value }, row: { original } }) => (
      //     <Link href="/admin/vehicle/[id]" as={`/admin/vehicle/${original.id}`}>
      //       <a>View</a>
      //     </Link>
      //   )
      // }
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
            <h3 className="text-2xl tex-2xl col-start-6 text-center">
              Destinations
            </h3>
            <Link href="/admin/destination/new">
              <a className="mr-4 col-start-12">
                <button>
                  <AiFillPlusCircle className="text-4xl text-blue-400" />
                </button>
              </a>
            </Link>
          </div>
          {destinationsData && (
            <div className="col-start-3 col-span-10 mx-2">
              <Table columns={columns} data={destinationsData.destinations} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Destinations);
