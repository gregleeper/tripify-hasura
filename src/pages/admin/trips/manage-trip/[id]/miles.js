import React, { useState, useEffect, useMemo } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Layout from "../../../../../components/layout";
import TextInput from "../../../../../components/shared/TextInput";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import Table from "../../../../../components/shared/table";
import Modal from "react-modal";
import { AiFillEdit } from "react-icons/ai";

const GET_TRIP_MILES = gql`
  query GetTripMiles {
    trip_vehicle {
      trip_id
      vehicle_id
      preTripMiles
      postTripMiles
    }
  }
`;

const GET_TRIP_VEHICLE = gql`
  query GetTripVehicle($tripId: uuid!, $vehicleId: uuid) {
    trip_vehicle(
      where: { trip_id: { _eq: $tripId }, vehicle_id: { _eq: $vehicleId } }
    ) {
      vehicle {
        id
        name
      }
      trip {
        id
        tripName
      }
      preTripMiles
      postTripMiles
      trip_id
      vehicle_id
    }
  }
`;

const SET_MILES = gql`
  mutation SetMiles(
    $tripId: uuid!
    $vehicleId: uuid!
    $preTripMiles: Int!
    $postTripMiles: Int!
  ) {
    update_trip_vehicle(
      where: { trip_id: { _eq: $tripId }, vehicle_id: { _eq: $vehicleId } }
      _set: { preTripMiles: $preTripMiles, postTripMiles: $postTripMiles }
    ) {
      affected_rows
      returning {
        trip_id
        vehicle_id
        preTripMiles
        postTripMiles
      }
    }
  }
`;

const Miles = () => {
  const router = useRouter();
  const [vehicleIds, setVehicleIds] = useState([]);
  const [TripName, setTripName] = useState("");
  const [TripVehicle, setTripVehicle] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const tripId = router.query.id;
  const { data: tripVehicleData, refetch } = useQuery(GET_TRIP_VEHICLE, {
    variables: { tripId }
  });
  const [SetMiles] = useMutation(SET_MILES);

  const toggleModal = key => {
    console.log("key: ", key);
    if (currentModal) {
      handleModalClose();
      return;
    }
    setCurrentModal(key);
  };

  function handleModalClose() {
    setIsOpen(!modalIsOpen);
    setCurrentModal(null);
  }

  const customModalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "30%",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)"
    }
  };

  useEffect(() => {
    if (tripVehicleData) {
      const VIds = tripVehicleData.trip_vehicle.map(v => v.vehicle.id);
      setVehicleIds(VIds);
      const name = tripVehicleData.trip_vehicle[0].trip.tripName;
      setTripName(name);
      setTripVehicle(tripVehicleData.trip_vehicle);
    }
  }, [tripVehicleData]);

  const columns = useMemo(
    () => [
      { id: "tripName", Header: "Trip Name", accessor: "trip.tripName" },
      { id: "vehicleName", Header: "Vehicle Name", accessor: "vehicle.name" },
      {
        id: "preTripMiles",
        Header: "Pre Trip Miles",
        accessor: "preTripMiles"
      },
      {
        id: "postTripMiles",
        Header: "Post Trip Miles",
        accessor: "postTripMiles"
      },
      {
        id: "totalMiles",
        Header: "Total Miles",
        accessor: "postTripMiles",
        Cell: (row, cell) => {
          console.log(row.data[row.row.id].postTripMiles);
          const cellPostTripMiles = row.data[row.row.id].postTripMiles;
          const cellPreTripMiles = row.data[row.row.id].preTripMiles;
          return <span>{cellPostTripMiles - cellPreTripMiles}</span>;
        }
      },
      {
        id: "edit",
        Header: "Edit",
        accessor: "vehicle.id",

        Cell: ({ cell: { value }, row: { original } }) => (
          <a
            className="text-blue-500 hover:text-blue-700 cursor-pointer focus:shadow-outline focus:outline-none"
            onClick={() => toggleModal(original.vehicle.id)}
          >
            <AiFillEdit />
          </a>
        )
      }
    ],
    []
  );

  return (
    <Layout>
      <div className="grid grid-cols-12 mt-3">
        <div className="col-start-5  col-span-3">
          <h3 className="text-xl text-gray-700 text-center">
            Log Miles for Trip: <span className="text-black">{TripName}</span>
          </h3>
        </div>
        <div className="col-span-8 col-start-3">
          <Table columns={columns} data={TripVehicle} />
        </div>

        <div className="col-start-3 col-span-7 mt-3">
          {tripVehicleData &&
            tripVehicleData.trip_vehicle.map((t, index) => (
              <Modal
                id={t.vehicle.id}
                isOpen={currentModal === t.vehicle.id}
                onRequestClose={toggleModal}
                style={customModalStyles}
              >
                <div className="grid grid-cols-12">
                  <div className="col-start-12">
                    <button onClick={() => toggleModal()}>X</button>
                  </div>
                  <div className="col-span-12">
                    <Formik
                      initialValues={{
                        preTripMiles: t.preTripMiles || null,
                        postTripMiles: t.postTripMiles || null
                      }}
                      //validationSchema={RecipeSchema}
                      onSubmit={async (values, { setSubmitting }) => {
                        const vehicleId = t.vehicle.id;
                        SetMiles({
                          variables: {
                            tripId,
                            vehicleId,
                            preTripMiles: values.preTripMiles,
                            postTripMiles: values.postTripMiles
                          },
                          update: cache => {
                            const existingMiles = cache.readQuery({
                              query: GET_TRIP_VEHICLE,
                              variables: { tripId }
                            });
                            const updatedMiles = existingMiles.trip_vehicle.map(
                              t => {
                                if (t.vehicle.id === vehicleId) {
                                  return {
                                    ...t,
                                    preTripMiles: values.preTripMiles,
                                    postTripMiles: values.postTripMiles
                                  };
                                } else return t;
                              }
                            );
                            console.log(updatedMiles);
                            cache.writeQuery({
                              query: GET_TRIP_VEHICLE,
                              variables: { tripId },
                              data: {
                                trip_vehicle: updatedMiles
                              }
                            });
                          }
                        });
                        refetch();
                        setSubmitting(false);
                        handleModalClose();
                        //router.push("/admin/trips");
                      }}
                    >
                      {({ values, isSubmitting, setFieldValue, errors }) => (
                        <Form>
                          {isSubmitting && (
                            <div className="fixed flex inset-0 items-center justify-center">
                              {/* <LoaderSpinner /> */}
                            </div>
                          )}
                          {!isSubmitting && (
                            <>
                              <div key={t.vehicle.id}>
                                <h3 className="text-center text-lgf">
                                  {`Vehicle:   ${t.vehicle.name}`}
                                </h3>{" "}
                                <TextInput
                                  label="Pre Trip Miles"
                                  name={`preTripMiles`}
                                  type="number"
                                  placeholder={`Miles before trip began for vehicle`}
                                />
                                <TextInput
                                  label="Post Trip Miles"
                                  name={`postTripMiles`}
                                  type="number"
                                  placeholder={`Miles after trip completed for vehicle`}
                                />{" "}
                              </div>
                              <div className="grid grid-cols-12">
                                <div className="col-start-5">
                                  <button className="shadow border border-black bg-gray-100 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-black py-2 px-4 rounded">
                                    Cancel
                                  </button>
                                </div>
                                <div className="col-start-7">
                                  <button
                                    className="shadow bg-indigo-500 hover:bg-indigo-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                                    type="submit"
                                    // disabled={isSubmitting}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </Modal>
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default Miles;
