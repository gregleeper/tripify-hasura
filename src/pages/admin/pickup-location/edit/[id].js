import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../../components/shared/TextInput";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRouter } from "next/router";

const GET_PICKUPLOCATIONS = gql`
  query PickupLocations {
    pickupLocations {
      id
      name
    }
  }
`;

const GET_PICKUPLOCATION = gql`
  query PickupLocation($id: ID!) {
    pickupLocation(id: $id) {
      id
      name
    }
  }
`;

const UPDATE_PICKUPLOCATION = gql`
  mutation UpdatePickupLocation($id: ID!, $name: String!) {
    updateOnePickupLocation(name: $name, id: $id) {
      id
      name
    }
  }
`;

const EditPickupLocationForm = () => {
  const Router = useRouter();

  const {
    data: locData,
    error: locError,
    loading: locLoading
  } = useQuery(GET_PICKUPLOCATION, { variables: { id: Router.query.id } });

  const [UpdatePickupLocation] = useMutation(UPDATE_PICKUPLOCATION, {
    update(cache, { data: UpdatePickupLocation }) {
      const { pickupLocations } = cache.readQuery({
        query: GET_PICKUPLOCATIONS
      });
      cache.writeQuery({
        query: GET_PICKUPLOCATIONS,
        data: {
          pickupLocations: pickupLocations.concat([UpdatePickupLocation])
        }
      });
    }
  });

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Edit Pickup Location
          </h4>
        </div>
        {locData && (
          <div className="">
            <Formik
              initialValues={{
                name: locData.pickupLocation.name || ""
              }}
              //validationSchema={RecipeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                await UpdatePickupLocation({
                  variables: {
                    name: values.name,
                    id: Router.query.id
                  }
                });

                setSubmitting(false);

                Router.push("/admin/pickup-locations");
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
                        label="Pickup Location Name"
                        name="name"
                        type="text"
                        placeholder="Name"
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
        )}
      </div>
    </Layout>
  );
};

export default withApollo(EditPickupLocationForm);
