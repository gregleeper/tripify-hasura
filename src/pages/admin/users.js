import React, { useMemo, useState, useEffect } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import { AiFillPlusCircle, AiFillDelete, AiFillEye } from "react-icons/ai";
import SideNav from "../../components/sideAdminNav";
import Link from "next/link";
//import Link from "next/link";

const GET_USERS = gql`
  query Users {
    users {
      id
      name
      email
    }
  }
`;

const DETELETE_USER = gql`
  mutation DeleteOneUser($id: ID!) {
    deleteOneUser(id: $id) {
      id
      name
      email
    }
  }
`;

const Users = () => {
  const [users, setUsers] = useState([]);

  const {
    data: usersData,
    error: usersEror,
    loading: usersLoading,
    refetch
  } = useQuery(GET_USERS);

  const [DeleteUser] = useMutation(DETELETE_USER, {
    update(cache, { data: DeleteUser }) {
      const { users } = cache.readQuery({ query: GET_USERS });

      cache.writeQuery({
        query: GET_USERS,
        data: { users: users.concat([DeleteUser]) }
      });
    }
  });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.users);
    }
  }, [usersData]);

  const handleDelete = async id => {
    await DeleteUser({ variables: { id } });
    refetch();
  };

  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      {
        id: "view",
        Header: "View",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/user/edit/[id]"
            as={`/admin/user/edit/${original.id}`}
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
              <h3 className="text-2xl">Users</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/user/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-span-10 col-start-3 mx-2">
            {usersData && <Table columns={columns} data={users} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Users);
