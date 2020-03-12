import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../../components/shared/TextInput";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRouter } from "next/router";
import MultiSelectInputVehicleTypes from "../../../../components/shared/MultiSelectInputVehicleTypes";
import Link from "next/link";

const GET_VEHICLETYPES = gql`
  query GetVehicleTypes {
    vehicleTypes {
      id
      name
    }
  }
`;

const GET_VEHICLES = gql`
  query GetVehicles {
    vehicles {
      id
      name
      make
      year
      model
      maxOccupancy
      vehicleType {
        id
        name
      }
    }
  }
`;

const GET_VEHICLE = gql`
  query GetVehicle($id: uuid!) {
    vehicles(where: { id: { _eq: $id } }) {
      id
      name
      year
      make
      model
      maxOccupancy
      vehicleType {
        id
        name
      }
    }
  }
`;

const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle(
    $name: String!
    $vehicleType: uuid!
    $make: String!
    $model: String!
    $maxOccupancy: Int!
    $id: ID!
    $year: Int!
  ) {
    update_vehicles(
      _set: {
        name: $name
        vehicle_type_id: $vehicleType
        year: $year
        make: $make
        model: $model
        maxOccupancy: $maxOccupancy
      }
      where: { id: { _eq: $id } }
    ) {
      id
      name
      year
      vehicleType {
        id
        name
      }
      make
      model
      maxOccupancy
    }
  }
`;
const EditVehicleForm = () => {
  const Router = useRouter();
  const [vTypes, setVTypes] = useState([]);
  const {
    data: vehicleData,
    loading: vehicleLoading,
    error: vehicleError
  } = useQuery(GET_VEHICLE, { variables: { id: Router.query.id } });

  const [UpdateVehicle, { data, loading, error }] = useMutation(
    UPDATE_VEHICLE,
    {
      update(cache, { data: UpdateVehicle }) {
        const { vehicles } = cache.readQuery({ query: GET_VEHICLES });
        cache.writeQuery({
          query: GET_VEHICLES,
          data: { vehicles: vehicles.concat([UpdateVehicle]) }
        });
      }
    }
  );

  const {
    data: vehicleTypesData,
    loading: vehicleTypesLoading,
    error: vehicleTypesError
  } = useQuery(GET_VEHICLETYPES);

  useEffect(() => {
    if (vehicleTypesData) {
      setVTypes(vehicleTypesData.vehicleTypes);
    }
  }, [vehicleTypesData]);

  const initialVType = [];
  if (vehicleData) {
    console.log(vehicleData);
    const value = vehicleData.vehicles[0].vehicleType.id;
    const label = vehicleData.vehicles[0].vehicleType.name;
    initialVType.push({ label, value });
  }

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New Vehicle
          </h4>
        </div>
        {vehicleData && (
          <div className="">
            <Formik
              initialValues={{
                name: vehicleData.vehicles[0].name || "",
                model: vehicleData.vehicles[0].model || "",
                make: vehicleData.vehicles[0].make || "",
                maxOccupancy: vehicleData.vehicles[0].maxOccupancy || 0,
                vehicleType: initialVType || "",
                year: vehicleData.vehicles[0].year || null
              }}
              //validationSchema={RecipeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                await UpdateVehicle({
                  variables: {
                    name: values.name,
                    model: values.model,
                    make: values.make,
                    maxOccupancy: values.maxOccupancy,
                    vehicleType: values.vehicleTypes.value,
                    year: values.year,
                    id: Router.query.id
                  }
                });

                setSubmitting(false);

                Router.push("/admin/dashboard");
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
                      <TextInput
                        label="Vehicle Name"
                        name="name"
                        type="text"
                        placeholder="Vehicle Name"
                      />
                      <TextInput
                        label="Year"
                        name="year"
                        type="number"
                        placeholder="Year"
                      />
                      <TextInput
                        label="Make"
                        name="make"
                        type="text"
                        placeholder="Make"
                      />
                      <TextInput
                        label="Model"
                        name="model"
                        type="text"
                        placeholder="Model"
                      />
                      <TextInput
                        label="Max Occupancy"
                        name="maxOccupancy"
                        type="number"
                        placeholder="Max Occupancy"
                      />
                      <MultiSelectInputVehicleTypes
                        label="Vehicle Type"
                        name="vehicleType"
                        onChange={setFieldValue}
                        placeholder="Vehicle Type"
                        options={vTypes}
                        value={values.vehicleTypes}
                      />

                      <div className="grid grid-cols-2 mt-8">
                        <div className="">
                          <button
                            className="float-right mx-3 shadow border border-gray-700 bg-gray-200 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-gray-800 font-bold py-2 px-4 rounded"
                            type="button"
                          >
                            <Link href="/admin/vehicles">Cancel</Link>
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
        )}
      </div>
    </Layout>
  );
};

export default withApollo(EditVehicleForm);
