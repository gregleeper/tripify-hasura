import React, { useMemo } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
//import Link from "next/link";

const GET_ADMINS = gql`
  query Admins {
    admins {
      id
      user {
        id
        name
        email
      }
    }
  }
`;

const Admins = () => {
  const {
    data: adminsData,
    error: adminsEror,
    loading: adminsLoading
  } = useQuery(GET_ADMINS);

  const columns = useMemo(
    () => [
      { Header: "Name", accessor: "user.name" },
      { Header: "Email", accessor: "user.email" }
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
      <div>
        <h3 className="text-2xl">Admins</h3>
      </div>
      {adminsData && <Table columns={columns} data={adminsData.admins} />}
    </Layout>
  );
};

export default withApollo(Admins);
