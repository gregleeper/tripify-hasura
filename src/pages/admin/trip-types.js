import React, { useMemo } from "react";
import Layout from "../../components/layout";
import Link from "next/link";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import SideNav from "../../components/sideAdminNav";
import { AiFillPlusCircle, AiFillEdit, AiFillDelete } from "react-icons/ai";

const GET_TRIPTYPES = gql`
  query TripTypes {
    tripTypes {
      id
      name
    }
  }
`;

const DELETE_TRIPTYPE = gql`
  mutation DeleteTripType($id: uuid!) {
    delete_tripTypes(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const TripTypes = () => {
  const {
    data: tripTypesData,
    error: tripTypesEror,
    loading: tripTypesLoading,
    refetch
  } = useQuery(GET_TRIPTYPES);

  const [DeleteTripType] = useMutation(DELETE_TRIPTYPE);
  const handleDelete = id => {
    DeleteTripType({
      variables: { id },
      update: cache => {
        const existingTypes = cache.readQuery({ query: GET_TRIPTYPES });
        const filteredTypes = existingTypes.tripTypes.filter(t => t.id !== id);
        cache.writeQuery({
          query: GET_TRIPTYPES,
          data: { tripTypes: filteredTypes }
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
            href="/admin/trip-type/edit/[id]"
            as={`/admin/trip-type/edit/${original.id}`}
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
            <h3 className="text-2xl tex-2xl col-start-6 col-span-2 text-center">
              Trip Types
            </h3>
            <Link href="/admin/trip-type/new">
              <a className="mr-4 col-start-12">
                <button>
                  <AiFillPlusCircle className="text-4xl text-blue-400" />
                </button>
              </a>
            </Link>
          </div>
          {tripTypesData && (
            <div className="col-start-3 col-span-10 mx-2">
              <Table columns={columns} data={tripTypesData.tripTypes} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(TripTypes);
