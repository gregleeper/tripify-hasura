import React, { useState, useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../../components/shared/TextInput";
import CheckBox from "../../../../components/shared/CheckBox";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRouter } from "next/router";
import MultiSelectInputVehicleTypes from "../../../../components/shared/MultiSelectInputVehicleTypes";

const GET_USERS = gql`
  query GetUsers {
    users {
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

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      isDriver
      isSupervisor
      isAdmin
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $name: String!
    $email: String!
    $password: String!
    $isDriver: Boolean!
    $id: ID!
    $isSupervisor: Boolean!
    $isAdmin: Boolean!
  ) {
    updateOneUser(
      data: {
        name: $name
        email: $email
        password: $password
        isDriver: $isDriver
        isSupervisor: $isSupervisor
        isAdmin: $isAdmin
      }
      where: { id: $id }
    ) {
      id
      name
      email
      password
      isDriver
      isAdmin
      isSupervisor
    }
  }
`;
const EditUserForm = () => {
  const Router = useRouter();
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER, { variables: { id: Router.query.id } });

  const [UpdateUser] = useMutation(UPDATE_USER, {
    update(cache, { data: UpdateUser }) {
      const { users } = cache.readQuery({ query: GET_USERS });
      cache.writeQuery({
        query: GET_USERS,
        data: { users: users.concat([UpdateUser]) }
      });
    }
  });

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Update User
          </h4>
        </div>
        {userData && (
          <div className="">
            <Formik
              initialValues={{
                name: userData.user.name || "",
                email: userData.user.email || "",
                password: "",
                isDriver: userData.user.isDriver,
                isSupervisor: userData.user.isSupervisor,
                isAdmin: userData.user.isAdmin
              }}
              //validationSchema={RecipeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                console.log(values);
                // await UpdateUser({
                //   variables: {
                //     name: values.name,
                //     email: values.email,
                //     password: values.password,
                //     isSupervisor: values.isSupervisor,
                //     isDriver: values.isDriver,
                //     id: Router.query.id,
                //     isAdmin: values.isAdmin
                //   }
                // });
                // setSubmitting(false);
                // Router.push("/admin/users");
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
                      <CheckBox
                        label="Driver"
                        name="isDriver"
                        type="checkbox"
                      />
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
        )}
      </div>
    </Layout>
  );
};

export default withApollo(EditUserForm);
