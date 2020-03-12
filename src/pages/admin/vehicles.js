import React, { useMemo, useEffect, useState } from "react";
import Layout from "../../components/layout";
import { withApollo } from "../../lib/apollo";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Table from "../../components/shared/table";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AiFillEdit,
  AiFillEye,
  AiFillPlusCircle,
  AiFillDelete
} from "react-icons/ai";
import SideNav from "../../components/sideAdminNav";

const GET_VEHICLES = gql`
  query Vehicles {
    vehicles {
      id
      name
      year
      make
      model
      maxOccupancy
      __typename
      vehicleType {
        id
        name
      }
    }
  }
`;

const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: uuid!) {
    delete_vehicles(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
        name
        make
        model
        maxOccupancy
        year
        __typename
      }
    }
  }
`;

const Vehicles = () => {
  const Router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const {
    data: vehiclesData,
    error: vehiclesEror,
    loading: vehiclesLoading,
    refetch
  } = useQuery(GET_VEHICLES);

  const [DeleteVehicle] = useMutation(DELETE_VEHICLE);

  useEffect(() => {
    if (vehiclesData) {
      setVehicles(vehiclesData.vehicles);
    }
  }, [vehiclesData]);

  const handleDelete = id => {
    DeleteVehicle({
      variables: { id },
      update: cache => {
        const existingVehicles = cache.readQuery({ query: GET_VEHICLES });
        const filteredVehicles = existingVehicles.vehicles.filter(
          v => v.id !== id
        );
        cache.writeQuery({
          query: GET_VEHICLES,
          data: { vehicles: filteredVehicles }
        });
      }
    });
    refetch();
  };

  const columns = useMemo(
    () => [
      { id: "name", Header: "Name", accessor: "name" },
      { id: "make", Header: "Make", accessor: "make" },
      { id: "model", Header: "Model", accessor: "model" },
      { id: "type", Header: "Vehicle Type", accessor: "vehicleType.name" },
      {
        id: "view",
        Header: "View",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link href="/admin/vehicle/[id]" as={`/admin/vehicle/${original.id}`}>
            <a>
              <AiFillEye className="text-lg text-teal-700" />
            </a>
          </Link>
        )
      },
      {
        id: "edit",
        Header: "Edit",
        accessor: "id",
        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/vehicle/edit/[id]"
            as={`/admin/vehicle/edit/${original.id}`}
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

        <div className="col-start-3 col-span-10 mt-2">
          <div className="grid grid-cols-12">
            <div className="col-start-6 col-span-2">
              <h6 className="text-center text-2xl">Vehicles</h6>
            </div>
            <div className="col-start-11 col-span-2">
              <Link href="/admin/vehicle/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-start-1 col-span-12 mx-2">
              {vehiclesData && <Table columns={columns} data={vehicles} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Vehicles);
