import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage, FieldArray } from "formik";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { withApollo } from "../../../../../lib/apollo";
import { useRouter } from "next/router";
import Layout from "../../../../../components/layout";
import MultiSelectInputVehiclesAssign from "../../../../../components/shared/MultiSelectInputVehiclesAssign";
import MultiSelectInputDriversAssign from "../../../../../components/shared/MultiSelectInputDriversAssign";
import { AiOutlineDelete, AiFillPlusCircle } from "react-icons/ai";
import Link from "next/link";

const GET_TRIP = gql`
  query Trip($id: uuid!) {
    trips(where: { id: { _eq: $id } }) {
      id
      tripName
      departDateTime
      returnDateTime
      destination {
        name
        address
      }
      numberPrimaryVehiclesReq
      numberSupportVehiclesReq
      primaryVehicleType {
        name
      }
      supportVehicleType {
        name
      }
      numberTravelers
      organization {
        id
        name
      }
      pickupLocation {
        id
        name
      }
      estimateNeeded
      author {
        name
        email
      }
      sponsor {
        name
        email
      }
      tripType {
        name
      }
      tripVehiclesByTripId {
        vehicle {
          id
          name
        }
      }
      tripDriversByTripId {
        driver {
          id
          user {
            id
            name
            email
          }
        }
      }
      tripVehiclesByTripId_aggregate {
        aggregate {
          count
        }
      }
      tripDriversByTripId_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

const GET_VEHICLES = gql`
  query Vehicles {
    vehicles {
      id
      name
      make
      model
      vehicleType {
        name
      }
    }
  }
`;

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

const INSERT_TRIP_VEHICLE = gql`
  mutation InsertTripVehicle($tripId: uuid!, $vId: uuid!) {
    insert_trip_vehicle(objects: { trip_id: $tripId, vehicle_id: $vId }) {
      affected_rows
    }
  }
`;

const INSERT_TRIP_DRIVER = gql`
  mutation InsertTripDriver($tripId: uuid!, $dId: uuid!) {
    insert_trip_driver(objects: { trip_id: $tripId, driver_id: $dId }) {
      affected_rows
    }
  }
`;

const DELETE_TRIP_VEHICLE = gql`
  mutation DeleteTripVehicle($tripId: uuid!, $vId: uuid!) {
    delete_trip_vehicle(
      where: { trip_id: { _eq: $tripId }, vehicle_id: { _eq: $vId } }
    ) {
      affected_rows
    }
  }
`;

const DELETE_TRIP_DRIVER = gql`
  mutation DeleteTripDriver($tripId: uuid!, $dId: uuid!) {
    delete_trip_driver(
      where: { trip_id: { _eq: $tripId }, driver_id: { _eq: $dId } }
    ) {
      affected_rows
    }
  }
`;

const Assign = () => {
  const router = useRouter();
  const tripId = router.query.id;
  const [vehicles, setVehicles] = useState();
  const [drivers, setDrivers] = useState();
  const [initialVehicles, setInitialVehicles] = useState([]);
  const [initialDrivers, setInitialDrivers] = useState([]);

  const { data: tripData, error, loading } = useQuery(GET_TRIP, {
    variables: { id: tripId }
  });
  const { data: vehicleData } = useQuery(GET_VEHICLES);
  const { data: driverData } = useQuery(GET_DRIVERS);

  const [InsertDriver] = useMutation(INSERT_TRIP_DRIVER);
  const [InsertVehicle] = useMutation(INSERT_TRIP_VEHICLE);
  const [DeleteTripVehicle] = useMutation(DELETE_TRIP_VEHICLE);
  const [DeleteTripDriver] = useMutation(DELETE_TRIP_DRIVER);

  useEffect(() => {
    if (driverData) {
      setDrivers(driverData.drivers);
    }
  }, [driverData]);

  useEffect(() => {
    if (vehicleData) {
      setVehicles(vehicleData.vehicles);
    }
  }, [vehicleData]);

  useEffect(() => {
    if (tripData) {
      const initVehiclesForSelection = [];
      if (tripData.trips[0].tripVehiclesByTripId.length > 0) {
        tripData.trips[0].tripVehiclesByTripId.map(vehicle => {
          const value = vehicle.vehicle.id;
          const label = vehicle.vehicle.name;
          initVehiclesForSelection.push({ label, value });
        });
      }
      setInitialVehicles(initVehiclesForSelection);
      const myDrivers = tripData.trips[0].tripDriversByTripId;
      const initDriversForSelection = [];

      if (myDrivers.length > 0 && myDrivers[0].driver.user.name) {
        console.log(myDrivers[0].driver.user.name);
        myDrivers.map(driver => {
          const value = driver.driver.id;
          const label =
            driver.driver.user.name + " - " + driver.driver.user.email;
          initDriversForSelection.push({ label, value });
        });
        setInitialDrivers(initDriversForSelection);
      }
    }
  }, [tripData]);

  const manageDrivers = assignedDrivers => {
    console.log(assignedDrivers);
    if (assignedDrivers.length === 0 && initialDrivers.length > 0) {
      initialDrivers.map(d =>
        DeleteTripDriver({
          variables: {
            tripId,
            dId: d.value
          }
        })
      );
    } else if (assignedDrivers.length > 0 && initialDrivers.length > 0) {
      const driversToDelete = initialDrivers.filter(
        d => !assignedDrivers.includes(d)
      );

      if (driversToDelete) {
        driversToDelete.map(
          async d =>
            await DeleteTripDriver({
              variables: {
                tripId,
                dId: d.value
              }
            })
        );
      }
      const driversToAdd = assignedDrivers.filter(
        d => !initialDrivers.includes(d)
      );
      if (driversToAdd) {
        driversToAdd.map(d =>
          InsertDriver({ variables: { tripId, dId: d.value } })
        );
      }
    } else {
      assignedDrivers.map(d =>
        InsertDriver({ variables: { tripId, dId: d.value } })
      );
    }
  };

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Manage Trip
          </h4>
        </div>
        <div className="">
          <Formik
            enableReinitialize
            initialValues={{
              vehicles: initialVehicles || [],
              drivers: initialDrivers || []
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              if (values.vehicles.length === 0 && initialVehicles.length > 0) {
                initialVehicles.map(v =>
                  DeleteTripVehicle({
                    variables: {
                      tripId,
                      vId: v.value
                    }
                  })
                );
              } else if (
                values.vehicles.length > 0 &&
                initialVehicles.length > 0
              ) {
                const vehiclesToDelete = initialVehicles.filter(
                  v => !values.vehicles.includes(v)
                );

                if (vehiclesToDelete) {
                  vehiclesToDelete.map(
                    async v =>
                      await DeleteTripVehicle({
                        variables: {
                          tripId,
                          vId: v.value
                        }
                      })
                  );
                }
                const vehiclesToAdd = values.vehicles.filter(
                  v => !initialVehicles.includes(v)
                );
                if (vehiclesToAdd) {
                  vehiclesToAdd.map(v =>
                    InsertVehicle({ variables: { tripId, vId: v.value } })
                  );
                }
              } else {
                values.vehicles.map(v =>
                  InsertVehicle({ variables: { tripId, vId: v.value } })
                );
              }
              manageDrivers(values.drivers);

              setSubmitting(false);

              router.push("/admin/trips/");
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
                    <FieldArray
                      name="vehicles"
                      render={arrayHelpers => (
                        <div>
                          {values.vehicles &&
                            values.vehicles.length > 0 &&
                            values.vehicles.map((vehicle, index) => (
                              <div className="grid grid-cols-12" key={index}>
                                <div className="col-start-4 col-span-5">
                                  <MultiSelectInputVehiclesAssign
                                    label={`Vehicle ${index + 1}`}
                                    name={`vehicles.${index}`}
                                    onChange={setFieldValue}
                                    placeholder="Vehicle"
                                    options={vehicles}
                                    value={values.vehicles[index]}
                                    jsonLabel={`vehicles.${index}`}
                                  />
                                </div>
                                <div className="items-center mt-2 ml-2 ">
                                  <button
                                    className="px-2 py-1"
                                    type="button"
                                    onClick={() => arrayHelpers.remove()}
                                  >
                                    <AiOutlineDelete className="text-red-600 text-xl hover:text-red-800" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          <div className="grid grid-cols-9">
                            <div className="col-start-5 col-span3">
                              <button
                                type="button"
                                onClick={() => arrayHelpers.push()}
                                className=""
                              >
                                <div className="flex flex-1 justify-between">
                                  <AiFillPlusCircle className="text-3xl text-gray-800 hover:text-gray-500 mr-3" />
                                  <span>Add Vehicle</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                    <FieldArray
                      name="drivers"
                      render={arrayHelpers => (
                        <div>
                          {values.drivers &&
                            values.drivers.length > 0 &&
                            values.drivers.map((driver, index) => (
                              <div className="grid grid-cols-12" key={index}>
                                <div className="col-start-4 col-span-5">
                                  <MultiSelectInputDriversAssign
                                    label={`Driver ${index + 1}`}
                                    name={`drivers.${index}`}
                                    onChange={setFieldValue}
                                    placeholder="Driver"
                                    options={drivers}
                                    value={values.drivers[index]}
                                    jsonLabel={`drivers.${index}`}
                                  />
                                </div>
                                <div className="items-center mt-2 ml-2 ">
                                  <button
                                    className="px-2 py-1"
                                    type="button"
                                    onClick={() => arrayHelpers.remove()}
                                  >
                                    <AiOutlineDelete className="text-red-600 text-xl hover:text-red-800" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          <div className="grid grid-cols-9">
                            <div className="col-start-5 col-span-3">
                              <button
                                type="button"
                                onClick={() => arrayHelpers.push()}
                                className=""
                              >
                                <div className="flex flex-1 justify-between">
                                  <AiFillPlusCircle className="text-3xl text-gray-800 hover:text-gray-500 mr-3" />
                                  <span>Add Driver</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                    <div className="grid grid-cols-2 mt-8">
                      <div className="">
                        <button
                          className="float-right mx-3 shadow bg-gray-100 hover:bg-grau-300 focus:shadow-outline focus:outline-none text-gray-800 font-bold py-2 px-4 rounded"
                          type="button"
                        >
                          <Link href="/admin/trips">Cancel</Link>
                        </button>
                      </div>
                      <div className="col-start-2">
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
    </Layout>
  );
};

export default Assign;
