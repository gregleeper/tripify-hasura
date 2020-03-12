import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import { loginFunc } from "../utils/login";
import { withApollo } from "../lib/apollo";
import Layout from "../components/layout";
//import LoaderSpinner from "../components/shared/Loader";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        isSupervisor
        isAdmin
        isDriver
      }
    }
  }
`;

function Login() {
  const [loginUser, { data, error, loading }] = useMutation(LOGIN);
  if (data) {
    loginFunc(data.login.token);
  }
  if (error) {
    console.log(error);
  }
  return (
    <Layout>
      <div className="flex-none w-3/4 mx-auto p-8 min-h-screen pb-32">
        <div className=" text-center text-4xl mb-4">Login</div>
        <div className="flex-1 w-full mx-auto">
          {error && (
            <div className="text-sm w-full text-red-500 text-center mb-4">
              Email or password incorrect. Please try again.
            </div>
          )}
        </div>
        <div className="">
          <Formik
            initialValues={{ email: "", password: "" }}
            validate={values => {
              const errors = {};
              if (!values.email) {
                errors.email = "Required";
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
              ) {
                errors.email = "Invalid email address";
              }
              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              await loginUser({
                variables: { email: values.email, password: values.password }
              });
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                {isSubmitting && (
                  <div className="fixed flex inset-0 items-center justify-center">
                    <div></div>
                  </div>
                )}
                {!isSubmitting && (
                  <>
                    <div className="md:flex md:items-center mb-6">
                      <div className="md:w-1/4">
                        <label
                          className="block text-gray-600 font-bold md:text-right mb-1 md:mb-0 pr-4"
                          htmlFor="email"
                        >
                          Email
                        </label>
                      </div>
                      <div className="md:w-1/2">
                        <Field
                          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                          type="email"
                          name="email"
                          placeholder="Email"
                          autoComplete="email"
                        />
                        <ErrorMessage name="email" component="div" />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-6">
                      <div className="md:w-1/4">
                        <label
                          className="block text-gray-600 font-bold md:text-right mb-1 md:mb-0 pr-4"
                          htmlFor="password"
                        >
                          Password
                        </label>
                      </div>
                      <div className="md:w-1/2">
                        <Field
                          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                          type="password"
                          name="password"
                          placeholder="Password"
                          autoComplete="password"
                        />
                        <ErrorMessage name="password" component="div" />
                      </div>
                    </div>
                    <div className="md:flex md:items-center">
                      <div className="md:w-1/4"></div>
                      <div className="md:w-1/4">
                        {console.log(isSubmitting)}
                        <button
                          className="shadow bg-indigo-500 hover:bg-indigo-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Submit
                        </button>
                      </div>
                      <div className="md:w-1/4">
                        <div className="flex flex-col text-center">
                          <span>Need an account?</span>
                          <Link href="/sign-up" as="">
                            <a className="text-indigo-500 hover:text-indigo-300">
                              Sign Up
                            </a>
                          </Link>
                        </div>
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
}

export default withApollo(Login);
