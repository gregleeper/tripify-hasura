import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../components/shared/TextInput";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";
import MultiSelectInputVehicleTypes from "../../../components/shared/MultiSelectInputVehicleTypes";

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

const CREATE_VEHICLE = gql`
  mutation CreateVehicle(
    $name: String!
    $vehicle_type_id: uuid!
    $make: String!
    $model: String!
    $maxOccupancy: Int!
    $year: Int!
  ) {
    insert_vehicles(
      objects: {
        name: $name
        vehicle_type_id: $vehicle_type_id
        make: $make
        model: $model
        maxOccupancy: $maxOccupancy
        year: $year
      }
    ) {
      affected_rows
      returning {
        id
        name
        vehicleType {
          id
          name
        }
        make
        model
        maxOccupancy
        year
      }
    }
  }
`;
const NewVehicleTypeForm = () => {
  const [vTypes, setVTypes] = useState([]);
  const [CreateVehicle, { data, loading, error }] = useMutation(
    CREATE_VEHICLE,
    {
      update(cache, { data: CreateVehicle }) {
        const { vehicles } = cache.readQuery({ query: GET_VEHICLES });
        cache.writeQuery({
          query: GET_VEHICLES,
          data: { vehicles: vehicles.concat([CreateVehicle]) }
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

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New Vehicle
          </h4>
        </div>
        <div className="">
          <Formik
            initialValues={{
              name: "",
              vModel: "",
              make: "",
              maxOccupancy: 0,
              year: 2020,
              vehicleType: ""
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await CreateVehicle({
                variables: {
                  name: values.name,
                  model: values.model,
                  make: values.make,
                  maxOccupancy: values.maxOccupancy,
                  vehicle_type_id: values.vehicleTypes.value,
                  year: values.year
                }
              });

              setSubmitting(false);

              Router.push("/admin/vehicles");
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
                      jsonLabel="vehicleTypes"
                    />

                    <div className="md:flex md:items-center">
                      <div className="md:w-1/4"></div>
                      <div className="md:w-1/2">
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

export default withApollo(NewVehicleTypeForm);
