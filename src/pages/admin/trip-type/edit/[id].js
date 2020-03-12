import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../../components/shared/TextInput";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router, { useRouter } from "next/router";

const GET_TRIPTYPE = gql`
  query GetTripType($id: ID!) {
    tripType(id: $id) {
      id
      name
    }
  }
`;

const GET_TRIPTYPES = gql`
  query GetTripTypes {
    tripTypes {
      id
      name
    }
  }
`;

const UPDATE_TRIPTYPE = gql`
  mutation UpdateTripType($name: String!, $id: ID!) {
    updateOneTripType(name: $name, id: $id) {
      id
      name
    }
  }
`;
const EditTripTypeForm = () => {
  const Router = useRouter();
  const {
    data: tripTypeData,
    error: tripTypeError,
    loading: tripTypeLoading
  } = useQuery(GET_TRIPTYPE, {
    variables: { id: Router.query.id }
  });
  const [
    UpdateTripType,
    { updatedTripTypesData, updatedTripTypesLoading, updatedTripTypesError }
  ] = useMutation(UPDATE_TRIPTYPE, {
    update(cache, { data: UpdateTripType }) {
      const { tripTypes } = cache.readQuery({ query: GET_TRIPTYPES });
      cache.writeQuery({
        query: GET_TRIPTYPES,
        data: { tripTypes: tripTypes.concat([UpdateTripType]) }
      });
    }
  });

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Edit Trip Type
          </h4>
        </div>
        <div className="">
          {tripTypeData && (
            <Formik
              initialValues={{
                name: tripTypeData.tripType.name || ""
              }}
              //validationSchema={RecipeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                await UpdateTripType({
                  variables: {
                    name: values.name,
                    id: tripTypeData.tripType.id
                  }
                });

                setSubmitting(false);

                Router.push("/admin/trip-types");
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
                        label="Trip Type Name"
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(EditTripTypeForm);
