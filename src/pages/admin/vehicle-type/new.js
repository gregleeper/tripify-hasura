import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../components/shared/TextInput";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";

const GET_VEHICLETYPES = gql`
  query GetVehicleTypes {
    vehicleTypes {
      id
      name
      __typename
    }
  }
`;

const CREATE_VEHICLETYPE = gql`
  mutation CreateVehicleType($name: String!) {
    insert_vehicleTypes(objects: { name: $name }) {
      affected_rows
      returning {
        id
        name
        __typename
      }
    }
  }
`;
const NewVehicleTypeForm = () => {
  const [CreateVehicleType] = useMutation(CREATE_VEHICLETYPE, {
    update(cache, { data: CreateVehicleType }) {
      const { vehicleTypes } = cache.readQuery({ query: GET_VEHICLETYPES });
      console.log(vehicleTypes);
      cache.writeQuery({
        query: GET_VEHICLETYPES,
        data: { vehicleTypes: vehicleTypes.concat([CreateVehicleType]) }
      });
    }
  });

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New VehicleType
          </h4>
        </div>
        <div className="">
          <Formik
            initialValues={{
              name: ""
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await CreateVehicleType({
                variables: {
                  name: values.name
                }
              });

              setSubmitting(false);

              Router.push("/admin/vehicle-types");
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
                      label="Vehicle Type Name"
                      name="name"
                      type="text"
                      placeholder="Title"
                    />

                    <div className="md:flex md:items-center">
                      <div className="md:w-1/4"></div>
                      <div className="md:w-1/2">
                        <button
                          className="shadow bg-indigo-500 hover:bg-indigo-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                          type="submit"
                          disabled={isSubmitting}
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
