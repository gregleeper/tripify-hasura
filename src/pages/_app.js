import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { loginFunc, logout } from "../utils/login";
import { withApollo } from "../lib/apollo";
import App from "next/app";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "../style.css";
import Modal from "react-modal";

export const userContext = React.createContext();

const provider = new firebase.auth.GoogleAuthProvider();

// Find these options in your Firebase console
!firebase.apps.length
  ? firebase.initializeApp({
      apiKey: "AIzaSyD5Y0ll7G8fPA-m2yQ1qSowyFETb2Vhrk8",
      authDomain: "tripify-hasura.firebaseapp.com",
      databaseURL: "https://tripify-hasura.firebaseio.com/",
      projectId: "tripify-hasura",
      storageBucket: "tripify-hasura.appspot.com",
      messagingSenderId: "268180960088"
    })
  : firebase.app();

const GET_USER = gql`
  query Users($id: String!) {
    users(where: { id: { _eq: $id } }) {
      id
      name
      email
      manager {
        id
      }
    }
  }
`;

const INSERT_USER = gql`
  mutation InsertUser($name: String!, $id: String!, $email: String!) {
    insert_users(objects: { name: $name, id: $id, email: $email }) {
      affected_rows
    }
  }
`;

const Auth = ({ Component, pageProps }) => {
  const [authState, setAuthState] = useState({ status: "loading" });
  const [LoadUser, { data: userData }] = useLazyQuery(GET_USER);
  const [InsertUser] = useMutation(INSERT_USER);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken();

        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim =
          idTokenResult.claims["https://hasura.io/jwt/claims"];
        loginFunc(token);
        if (hasuraClaim) {
          setAuthState({ status: "in", user, token, manager: false });
          LoadUser({
            variables: {
              id: user.uid
            }
          });
        } else {
          // Check if refresh is required.
          const metadataRef = firebase
            .database()
            .ref("metadata/" + user.uid + "/refreshTime");

          metadataRef.on("value", async data => {
            if (!data.exists) return;
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            setAuthState({ status: "in", user, token });
          });
        }
      } else {
        setAuthState({ status: "out" });
      }
    });
  }, [LoadUser]);

  useEffect(() => {
    console.log(userData);
    if (userData && userData.users[0].manager !== null) {
      setAuthState({ ...authState, manager: true });
    }
    if (userData && userData.users.manager === null) {
      setAuthState({ ...authState, manager: false });
    }
  }, [userData]);

  useEffect(() => {
    if (userData && userData.users.length === 0) {
      InsertUser({
        variables: {
          id: authState.user.uid,
          name: authState.user.displayName,
          email: authState.user.email
        }
      });
    }
  }, [userData, authState, InsertUser]);

  Modal.setAppElement("body"); // this is for screen readers aria compliance

  const signIn = async () => {
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    try {
      setAuthState({ status: "loading" });
      await firebase.auth().signOut();
      setAuthState({ status: "out" });
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  const defaultContext = {
    authState,
    setAuthState,
    signIn,
    signOut
  };

  let content;
  if (authState.status === "loading") {
    content = null;
  } else {
    content = (
      <>
        <userContext.Provider value={defaultContext}>
          <Component {...pageProps} />
        </userContext.Provider>
      </>
    );
  }

  return <div className="auth">{content}</div>;
};

export default withApollo(Auth);
