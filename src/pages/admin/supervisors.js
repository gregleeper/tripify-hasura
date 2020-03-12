import React, { useMemo, useState, useEffect } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import { AiFillPlusCircle, AiFillDelete } from "react-icons/ai";
import SideNav from "../../components/sideAdminNav";
import Link from "next/link";
//import Link from "next/link";

const GET_SUPERVISORS = gql`
  query Supervisors {
    supervisors {
      id
      user {
        id
        name
        email
      }
    }
  }
`;

const DELETE_SUPERVISOR = gql`
  mutation DeleteOneSupervisor($id: uuid!) {
    delete_supervisors(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const Supervisors = () => {
  const [supervisors, setSupervisors] = useState([]);

  const {
    data: supervisorsData,
    error: supervisorsEror,
    loading: supervisorsLoading,
    refetch
  } = useQuery(GET_SUPERVISORS);

  const [DeleteSupervisor] = useMutation(DELETE_SUPERVISOR, {
    update(cache, { data: DeleteSupervisor }) {
      const { supervisors } = cache.readQuery({ query: GET_SUPERVISORS });

      cache.writeQuery({
        query: GET_SUPERVISORS,
        data: { supervisors: supervisors.concat([DeleteSupervisor]) }
      });
    }
  });

  useEffect(() => {
    if (supervisorsData) {
      setSupervisors(supervisorsData.supervisors);
    }
  }, [supervisorsData]);

  const handleDelete = async id => {
    await DeleteSupervisor({
      variables: { id },
      update: cache => {
        const existingSupervisors = cache.readQuery({ query: GET_SUPERVISORS });
        const filteredSupervisors = existingSupervisors.supervisors.filter(
          s => s.id !== id
        );
        cache.writeQuery({
          query: GET_SUPERVISORS,
          data: { supervisors: filteredSupervisors }
        });
      }
    });
    refetch();
  };

  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "user.name" },
      { Header: "Email", accessor: "user.email" },
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
          <SideNav />{" "}
        </div>
        <div className="col-span-10">
          <div className="grid grid-cols-12 mt-2">
            <div className="col-start-6">
              <h3 className="text-2xl">Supervisors</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/supervisor/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-span-10 col-start-3 mx-2">
            {supervisorsData && (
              <Table columns={columns} data={supervisorsData.supervisors} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Supervisors);
