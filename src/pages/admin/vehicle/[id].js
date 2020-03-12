import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import Modal from "react-modal";
import Table from "../../../components/shared/table";
import moment from "moment";
import SideNav from "../../../components/sideAdminNav";

const GET_VEHICLE = gql`
  query Vehicle($id: uuid!) {
    vehicles(where: { id: { _eq: $id } }) {
      id
      name
      vehicleType {
        id
        name
      }
      make
      model
      maxOccupancy
      vehicleTrips {
        trip {
          id
          tripName
          destination {
            id
            name
            address
          }
          sponsor {
            name
          }
          departDateTime
          returnDateTime
          supervisor {
            user {
              name
            }
          }
          organization {
            name
          }
        }
        # vehicleTripDistances {
        #   id
        #   preTripMiles
        #   postTripMiles
        #   trip {
        #     id
        #     name
        #   }
        # }
      }
    }
  }
`;

const Vehicle = () => {
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);

  const {
    data: vehicleData,
    loading: vehicleLoading,
    error: vehicleError
  } = useQuery(GET_VEHICLE, { variables: { id: router.query.id } });

  const distanceColumns = useMemo(() => [
    { Header: "Name", accessor: "trip.tripName" },
    {
      Header: "Pre-Trip Miles",
      accessor: "preTripMiles"
    },
    {
      Header: "Post-Trip Miles",
      accessor: "postTripMiles"
    },
    {
      id: "totalMiles",
      Header: "Total Miles",
      accessor: row => row.postTripMiles - row.preTripMiles
    }
  ]);

  const tripsColumns = useMemo(() => [
    { Header: "Name", accessor: "trip.tripName" },
    {
      id: "destination",
      Header: "Destination",
      accessor: "trip.destination.address"
    },
    { Header: "Sponsor", accessor: "trip.sponsor.name" },
    {
      Header: "Depart Date",
      accessor: d =>
        moment(d.trip.departDateTime)
          .local()
          .format("MM/DD/YYYY h:mm a")
    },
    {
      Header: "Return Date",
      accessor: d =>
        moment(d.trip.returnDateTime)
          .local()
          .format("MM/DD/YYYY h:mm a")
    },
    { Header: "Supervisor", accessor: "trip.supervisor.user.name" },
    { Header: "Organization", accessor: "trip.organization.name" }
  ]);
  const toggleModal = key => {
    if (currentModal) {
      handleModalClose();
      return;
    }
    setCurrentModal(key);
  };

  function handleModalClose() {
    setModalIsOpen(!modalIsOpen);
    setCurrentModal(null);
  }

  return (
    <Layout>
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <SideNav />
        </div>
        <div className="sm:col-start-4 sm:col-span-6 col-start-2 col-span-10 mt-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Vehicle {vehicleData && vehicleData.vehicles[0].name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
                Details, trips, and distances.
              </p>
            </div>
            {vehicleData && (
              <div>
                <dl>
                  <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Vehicle Name:{" "}
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      {vehicleData.vehicles[0].name}
                    </dt>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Make:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      {vehicleData.vehicles[0].make}
                    </dt>
                  </div>
                  <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Model:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      {vehicleData.vehicles[0].model}
                    </dt>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Type:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      {vehicleData.vehicles[0].vehicleType.name}
                    </dt>
                  </div>
                  <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Max Occupancy:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      {vehicleData.vehicles[0].maxOccupancy}
                    </dt>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Trips:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      <a
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => toggleModal("trips")}
                      >
                        View
                      </a>
                      <Modal
                        id="trips"
                        isOpen={currentModal === "trips"}
                        onRequestClose={() => toggleModal()}
                      >
                        <div className="grid grid-cols-12">
                          <div className="col-start-5 col-span-3">
                            <h3 className="text-2xl text-center my-3 text-gray-600">
                              Trips for vehicle:{" "}
                              <span className="text-black">
                                {vehicleData.vehicles[0].name}
                              </span>
                            </h3>
                          </div>
                          <div className="col-start-12">
                            <button
                              className="py-2 px-3 hover:text-gray-600"
                              type="button"
                              onClick={() => toggleModal()}
                            >
                              X
                            </button>
                          </div>
                          <div className="col-start-1 col-span-12">
                            <Table
                              columns={tripsColumns}
                              data={vehicleData.vehicles[0].vehicleTrips}
                            />
                          </div>
                        </div>
                      </Modal>
                    </dt>
                  </div>
                  <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dd className="text-sm leading-5 font-medium text-gray-500">
                      Distances:
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                      <a
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => toggleModal("distances")}
                      >
                        View
                      </a>
                      <Modal
                        id="distances"
                        isOpen={currentModal === "distances"}
                        onRequestClose={() => toggleModal()}
                      >
                        <h3 className="text-2xl text-center my-3">{`Distances for vehicle: ${vehicleData.vehicles.name}`}</h3>
                        <Table
                          columns={distanceColumns}
                          data={vehicleData.vehicles.tripDistance}
                        />
                      </Modal>
                    </dt>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(Vehicle);
