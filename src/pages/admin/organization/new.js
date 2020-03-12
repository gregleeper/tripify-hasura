import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../components/shared/TextInput";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";

const GET_ORGANIZATIONS = gql`
  query Organizations {
    organizations {
      id
      name
    }
  }
`;

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!) {
    insert_organizations(objects: { name: $name }) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;
const NewOrganizationForm = () => {
  const [CreateOrganization, { data, loading, error }] = useMutation(
    CREATE_ORGANIZATION,
    {
      update(cache, { data: CreateOrganization }) {
        const { organizations } = cache.readQuery({ query: GET_ORGANIZATIONS });
        cache.writeQuery({
          query: GET_ORGANIZATIONS,
          data: { organizations: organizations.concat([CreateOrganization]) }
        });
      }
    }
  );

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New Organization
          </h4>
        </div>
        <div className="">
          <Formik
            initialValues={{
              name: ""
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await CreateOrganization({
                variables: {
                  name: values.name
                }
              });

              setSubmitting(false);

              Router.push("/admin/organizations");
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
                      label="Organization Name"
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
      </div>
    </Layout>
  );
};

export default withApollo(NewOrganizationForm);
