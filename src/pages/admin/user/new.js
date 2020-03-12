import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import MultiSelectInputUsers from "../../../components/shared/MultiSelectInputUsers";
import Layout from "../../../components/layout";
import { withApollo } from "../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router from "next/router";
import TextInput from "../../../components/shared/TextInput";
import CheckBox from "../../../components/shared/CheckBox";

const GET_USERS = gql`
  query Users {
    users {
      id
      name
      isDriver
      isSupervisor
      isAdmin
      email
      password
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $email: String!
    $password: String!
    $isAdmin: Boolean!
    $isDriver: Boolean!
    $isSupervisor: Boolean!
  ) {
    createOneUser(
      name: $name
      email: $email
      password: $password
      isAdmin: $isAdmin
      isSupervisor: $isSupervisor
      isDriver: $isDriver
    ) {
      id
      name
      email
      password
      isDriver
      isSupervisor
      isAdmin
    }
  }
`;

const NewUser = () => {
  const [users, setUsers] = useState([]);

  const [CreateUser] = useMutation(CREATE_USER, {
    update(cache, { data: CreateUser }) {
      const { users } = cache.readQuery({ query: GET_USERS });
      cache.writeQuery({
        query: GET_USERS,
        data: { users: users.concat([CreateUser]) }
      });
    }
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useQuery(GET_USERS);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.users);
    }
  }, [usersData]);

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New User
          </h4>
        </div>
        <div className="">
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              isDriver: false,
              isSupervisor: false,
              isAdmin: false
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await CreateUser({
                variables: {
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  isSupervisor: values.isSupervisor,
                  isDriver: values.isDriver,
                  isAdmin: values.isAdmin
                }
              });

              setSubmitting(false);

              Router.push("/admin/users");
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
                      label="Name"
                      name="name"
                      type="text"
                      placeholder="Full Name of User"
                    />
                    <TextInput
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="Enter Email Address"
                    />
                    <TextInput
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Password"
                    />
                    <CheckBox
                      label="Supervisor"
                      name="isSupervisor"
                      type="checkbox"
                    />
                    <CheckBox label="Driver" name="isDriver" type="checkbox" />
                    <CheckBox
                      label="Tripify Admin"
                      name="isAdmin"
                      type="checkbox"
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

export default withApollo(NewUser);
