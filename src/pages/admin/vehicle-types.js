import React, { useMemo, useState, useEffect } from "react";
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

const GET_VTYPES = gql`
  query VehicleTypes {
    vehicleTypes {
      id
      name
      __typename
    }
  }
`;

const DELETE_VTYPE = gql`
  mutation DeleteVType($id: uuid) {
    delete_vehicleTypes(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
        name
        __typename
      }
      __typename
    }
  }
`;

const VehicleTypes = () => {
  const [myVehicleTypes, setMyVehicleTypes] = useState([]);

  const {
    data: vTypesData,
    error: vTypesEror,
    loading: vTypesLoading,
    refetch
  } = useQuery(GET_VTYPES);

  useEffect(() => {
    if (vTypesData) {
      setMyVehicleTypes(vTypesData.vehicleTypes);
    }
  }, [vTypesData]);

  const [DeleteVType] = useMutation(DELETE_VTYPE);

  const handleDelete = (id, index) => {
    DeleteVType({
      variables: { id },
      update: cache => {
        const { vehicleTypes } = cache.readQuery({ query: GET_VTYPES });
        const newVTypes = vehicleTypes.filter(type => type.id !== id);
        cache.writeQuery({
          query: GET_VTYPES,
          data: { vehicleTypes: newVTypes }
        });
      }
    });
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
            href="/admin/vehicle-type/edit/[id]"
            as={`/admin/vehicle-type/edit/${original.id}`}
          >
            <a>
              <AiFillEdit className="text-lg text-teal-700" />
            </a>
          </Link>
        )
      },
      {
        id: "vehicles",
        Header: "Vehicles",
        accessor: "id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <Link
            href="/admin/vehicle-type/[id]"
            as={`/admin/vehicle-type/${original.id}`}
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
              <h3 className="text-2xl">Vehicle Types</h3>
            </div>
            <div className="col-start-12">
              <Link href="/admin/vehicle-type/new">
                <a className="mr-4">
                  <button>
                    <AiFillPlusCircle className="text-4xl text-blue-400" />
                  </button>
                </a>
              </Link>
            </div>
          </div>
          <div className="col-span-10 mx-2">
            {vTypesData && <Table columns={columns} data={myVehicleTypes} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(VehicleTypes);
