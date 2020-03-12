import React, { useMemo, useState, useEffect } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useLazyQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import SideNav from "../../components/sideAdminNav";
import { AiFillPlusCircle, AiFillDelete } from "react-icons/ai";
import Link from "next/link";

const GET_DRIVERS = gql`
  query Drivers {
    drivers {
      id
      user {
        id
        name
        email
      }
    }
  }
`;

const DELETE_DRIVER = gql`
  mutation DeleteDriver($id: uuid!) {
    delete_drivers(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);

  const {
    data: driversData,
    error: driversEror,
    loading: driversLoading,
    refetch
  } = useQuery(GET_DRIVERS);

  const [DeleteDriver] = useMutation(DELETE_DRIVER);

  useEffect(() => {
    if (driversData) {
      setDrivers(driversData.drivers);
    }
  }, [driversData]);

  const driverHasTrips = id => {
    console.log(id);
    console.log(drivers);
  };

  const handleDelete = async id => {
    await DeleteDriver({
      variables: { id },
      update: cache => {
        const existingDrivers = cache.readQuery({ query: GET_DRIVERS });
        const filteredDrivers = existingDrivers.drivers.filter(
          d => d.id !== id
        );
        cache.writeQuery({
          query: GET_DRIVERS,
          data: { drivers: filteredDrivers }
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
              <h3 className="text-xl lg:text-2xl">Drivers</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/driver/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle
                      className="text-3xl lg:text-4xl text-blue-400"
                      alt="add new driver"
                    />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-span-10 col-start-3 mx-2">
            {driversData && (
              <Table columns={columns} data={driversData.drivers} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Drivers);
