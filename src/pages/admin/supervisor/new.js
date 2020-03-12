import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import MultiSelectInputUsers from "../../../components/shared/MultiSelectInputUsers";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";

const GET_SUPERVISORS = gql`
  query Supervisors {
    supervisors {
      id
      user_id
      user {
        id
        name
        email
      }
    }
  }
`;

const GET_USERS = gql`
  query Users {
    users {
      id
      email
      name
    }
  }
`;

const CREATE_SUPERVISOR = gql`
  mutation CreateSupervisor($userId: String!) {
    insert_supervisors(objects: { user_id: $userId }) {
      affected_rows
    }
  }
`;

const NewSupervisor = () => {
  const [users, setUsers] = useState([]);

  const [CreateSupervisor] = useMutation(CREATE_SUPERVISOR, {
    update(cache, { data: CreateSupervisor }) {
      const { supervisors } = cache.readQuery({ query: GET_SUPERVISORS });
      cache.writeQuery({
        query: GET_SUPERVISORS,
        data: { supervisors: supervisors.concat([CreateSupervisor]) }
      });
    }
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useQuery(GET_USERS);
  const { data: supervisorsData } = useQuery(GET_SUPERVISORS);

  useEffect(() => {
    if (usersData && supervisorsData) {
      const usersNotSupervisors = usersData.users.filter(u =>
        supervisorsData.supervisors.some(s => s.user_id !== u.id)
      );
      console.log(usersNotSupervisors);
      setUsers(usersNotSupervisors);
    }
  }, [usersData, supervisorsData]);

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New Supervisor
          </h4>
        </div>
        <div className="">
          <Formik
            initialValues={{
              name: ""
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await CreateSupervisor({
                variables: {
                  userId: values.users.value
                }
              });

              setSubmitting(false);

              Router.push("/admin/supervisors");
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
                    <MultiSelectInputUsers
                      label="Users"
                      name="users"
                      onChange={setFieldValue}
                      placeholder="Select"
                      options={users}
                      value={values.users}
                      jsonLabel="users"
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

export default withApollo(NewSupervisor);
