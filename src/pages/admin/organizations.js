import React, { useMemo } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import Link from "next/link";
import {
  AiFillPlusCircle,
  AiFillEdit,
  AiFillEye,
  AiFillDelete
} from "react-icons/ai";
import SideNav from "../../components/sideAdminNav";

const GET_ORGANIZATIONS = gql`
  query Organizations {
    organizations {
      id
      name
      trips {
        id
        tripName

        departDateTime
        returnDateTime
      }
    }
  }
`;

const DELETE_ORG = gql`
  mutation DeleteOrganization($id: uuid!) {
    delete_organizations(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;

const Organizations = () => {
  const {
    data: orgsData,
    error: orgsEror,
    loading: orgsLoading,
    refetch
  } = useQuery(GET_ORGANIZATIONS);

  const [DeleteOrganization] = useMutation(DELETE_ORG);
  //   {
  //   update(cache, { data: DeleteOrganization }) {
  //     const { organizations } = cache.readQuery({ query: GET_ORGANIZATIONS });

  //     cache.writeQuery({
  //       query: GET_ORGANIZATIONS,
  //       data: { organizations: organizations.concat([DeleteOrganization]) }
  //     });
  //   }
  // }
  // );

  const handleDelete = id => {
    DeleteOrganization({
      variables: { id },
      update: cache => {
        const existingOrgs = cache.readQuery({ query: GET_ORGANIZATIONS });
        const filteredOrgs = existingOrgs.organizations.filter(
          o => o.id !== id
        );
        cache.writeQuery({
          query: GET_ORGANIZATIONS,
          data: { organizations: filteredOrgs }
        });
      }
    });
    refetch();
  };

  const columns = useMemo(
    () => [
      { id: "name", Header: "Name", accessor: "name" },
      {
        id: "id",
        Header: "Edit",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/organization/edit/[id]"
            as={`/admin/organization/edit/${original.id}`}
          >
            <a>
              <AiFillEdit className="text-lg text-teal-700" />
            </a>
          </Link>
        )
      },
      {
        id: "trips",
        Header: "Trips",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/organization/[id]/trips"
            as={`/admin/organization/${original.id}/trips`}
          >
            <a>
              <AiFillEye className="text-lg text-teal-700" />
            </a>
          </Link>
        )
      },
      {
        id: "delete",
        Header: "Delete",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original, index } }) => (
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
        <div className="col-span-10">
          <div className="grid grid-cols-12 mt-2">
            <div className="col-start-6">
              <h3 className="text-2xl">Organizations</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/organization/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-start-3 col-span-10 mx-2 mb-8">
            {orgsData && (
              <Table columns={columns} data={orgsData.organizations} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Organizations);
