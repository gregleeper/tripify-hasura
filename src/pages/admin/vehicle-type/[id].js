import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import Modal from "react-modal";
import Table from "../../../components/shared/table";
import { AiFillEye, AiFillEdit } from "react-icons/ai";
import Link from "next/link";

const GET_VEHICLETYPE = gql`
  query VehicleType($id: uuid) {
    vehicleTypes(where: { id: { _eq: $id } }) {
      id
      name
      vehicles {
        id
        name
        make
        model
        maxOccupancy
      }
    }
  }
`;

const VehicleType = () => {
  const router = useRouter();
  // const [modalIsOpen, setModalIsOpen] = useState(false);
  // const [currentModal, setCurrentModal] = useState(null);

  const {
    data: vehicleTypeData,
    loading: vehicleTypeLoading,
    error: vehicleTypeError
  } = useQuery(GET_VEHICLETYPE, { variables: { id: router.query.id } });

  const columns = useMemo(() => [
    { id: "name", Header: "Vehicle Name", accessor: "name" },
    { id: "make", Header: "Make", accessor: "make" },
    { id: "model", Header: "Model", accessor: "vModel" },
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
    }
  ]);

  // const tripsColumns = useMemo(() => [
  //   { Header: "Name", accessor: "name" },
  //   {
  //     id: "destination",
  //     Header: "Destination",
  //     accessor: "destination.address"
  //   },
  //   { Header: "Sponsor", accessor: "sponsor.name" },
  //   {
  //     Header: "Depart Date",
  //     accessor: d =>
  //       moment(d.departDateTime)
  //         .local()
  //         .format("MM/DD/YYYY h:mm a")
  //   },
  //   {
  //     Header: "Return Date",
  //     accessor: d =>
  //       moment(d.returnDateTime)
  //         .local()
  //         .format("MM/DD/YYYY h:mm a")
  //   },
  //   { Header: "Supervisor", accessor: "supervisor.user.name" },
  //   { Header: "Organization", accessor: "organization.name" }
  // ]);
  // const toggleModal = key => {
  //   if (currentModal) {
  //     handleModalClose();
  //     return;
  //   }
  //   setCurrentModal(key);
  // };

  // function handleModalClose() {
  //   setModalIsOpen(!modalIsOpen);
  //   setCurrentModal(null);
  // }

  return (
    <Layout>
      <div className="flex flex-col w-full">
        {vehicleTypeData && (
          <>
            <h3 className="text-2xl text-bold text-center mb-2">
              {`Vehicles of type ${vehicleTypeData.vehicleTypes[0].name}`}
            </h3>

            <Table
              columns={columns}
              data={vehicleTypeData.vehicleTypes[0].vehicles}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default withApollo(VehicleType);
