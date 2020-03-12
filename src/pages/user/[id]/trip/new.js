import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import TextInput from "../../../../components/shared/TextInput";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Router, { useRouter } from "next/router";
import MultiSelectInputVehicleTypes from "../../../../components/shared/MultiSelectInputVehicleTypes";
import FormikDatePicker from "../../../../components/shared/DateTimePicker";
import CheckBox from "../../../../components/shared/CheckBox";
import NumberInput from "../../../../components/shared/NumberInput";
import MultiSelectInputOrgs from "../../../../components/shared/MultiSelectInputOrgs";
import MultiSelectInputTripTypes from "../../../../components/shared/MultiSelectInputTripTypes";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import MultiSelectInputSupervisors from "../../../../components/shared/MultiSelectInputSupervisors";
import MultiSelectInputPickupLocations from "../../../../components/shared/MultiSelectInputPickupLocations";
import MultiSelectInputSponsors from "../../../../components/shared/MultiSelectInputSponsors";
import { userContext } from "../../../_app";
import moment from "moment";
import tz from "moment-timezone";

const GET_VEHICLETYPES = gql`
  query GetVehicleTypes {
    vehicleTypes {
      id
      name
    }
  }
`;

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
    }
  }
`;
const GET_PICKUPLOCATIONS = gql`
  query GetPickupLocations {
    pickupLocations {
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

const GET_USERS = gql`
  query Users {
    users {
      id
      name
    }
  }
`;

// const GET_DESTINATIONS = gql`
//   query Destinations {
//     destinations {
//       id
//       name
//       address
//       latitude
//       longitude
//     }
//   }
// `;

const GET_SUPERVISORS = gql`
  query Supervisors {
    supervisors {
      id
      user {
        name
      }
    }
  }
`;

const CREATE_TRIP = gql`
  mutation CreateTrip(
    $tripName: String!
    $departDateTime: timestamptz!
    $returnDateTime: timestamptz!
    $estimateNeeded: Boolean!
    $isApproved: Boolean!
    $numberPrimaryVehiclesReq: Int!
    $numberSupportVehiclesReq: Int!
    $numberTravelers: Int!
    $author: String!
    $sponsor_id: String!
    $destinationId: String!
    $destinationName: String!
    $destinationAddress: String!
    $organization_id: uuid!
    $pickup_location_id: uuid!
    $primary_vehicle_type_id: uuid!
    $support_vehicle_type_id: uuid
    $trip_type_id: uuid!
    $supervisor_id: uuid!
  ) {
    insert_trips(
      objects: [
        {
          tripName: $tripName
          departDateTime: $departDateTime
          returnDateTime: $returnDateTime
          estimateNeeded: $estimateNeeded
          isApproved: $isApproved
          numberPrimaryVehiclesReq: $numberPrimaryVehiclesReq
          numberSupportVehiclesReq: $numberSupportVehiclesReq
          numberTravelers: $numberTravelers
          author_id: $author
          sponsor_id: $sponsor_id
          supervisor_id: $supervisor_id
          destination: {
            data: {
              id: $destinationId
              name: $destinationName
              address: $destinationAddress
            }
          }
          organization_id: $organization_id
          pickup_location_id: $pickup_location_id
          primary_vehicle_type_id: $primary_vehicle_type_id
          support_vehicle_type_id: $support_vehicle_type_id
          trip_type_id: $trip_type_id
        }
      ]
    ) {
      affected_rows
      returning {
        id
        tripName
        departDateTime
        returnDateTime
        estimateNeeded
        isApproved
        numberPrimaryVehiclesReq
        numberSupportVehiclesReq
        numberTravelers
        author {
          id
        }
        sponsor {
          id
          name
        }
        supervisor {
          id
        }
        destination {
          id
          name
        }
        organization {
          id
          name
        }
        pickupLocation {
          id
          name
        }
      }
    }
  }
`;
const libraries = ["places"];

const NewTripForm = () => {
  const router = useRouter();
  const context = useContext(userContext);
  const userId = router.query.id;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD8TwkTRtHXp5NHQ44BNqNNkWFzNQzO5Ok",
    libraries: libraries
  });
  const [autocomplete, setAutocomplete] = useState(null);

  const [vTypes, setVTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [destination, setDestination] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [tripTypes, setTripTypes] = useState([]);
  const [author, setAuthor] = useState({});
  const [sponsors, setSponsors] = useState([]);

  const [CreateTrip] = useMutation(CREATE_TRIP, {
    update(cache, { data: CreateTrip }) {
      const { trips } = cache.readQuery({ query: GET_TRIPS });
      cache.writeQuery({
        query: GET_TRIPS,
        data: { trips: trips.concat([CreateTrip]) }
      });
    }
  });

  const {
    data: vehicleTypesData,
    loading: vehicleTypesLoading,
    error: vehicleTypesError
  } = useQuery(GET_VEHICLETYPES);

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useQuery(GET_USERS);

  const {
    data: supervisorsData,
    loading: supervisorsLoading,
    error: supervisorsError
  } = useQuery(GET_SUPERVISORS);

  const {
    data: organizationsData,
    loading: organizationsLoading,
    error: organizationsError
  } = useQuery(GET_ORGANIZATIONS);

  const {
    data: pickupLocationsData,
    loading: pickupLocationsLoading,
    error: pickupLocationsError
  } = useQuery(GET_PICKUPLOCATIONS);

  const {
    data: tripTypesData,
    loading: tripTypesLoading,
    error: tripTypesError
  } = useQuery(GET_TRIPTYPES);

  useEffect(() => {
    if (supervisorsData) {
      setSupervisors(supervisorsData.supervisors);
    }
  }, [supervisorsData]);

  useEffect(() => {
    if (tripTypesData) {
      setTripTypes(tripTypesData.tripTypes);
    }
  }, [tripTypesData]);

  useEffect(() => {
    if (pickupLocationsData) {
      setPickupLocations(pickupLocationsData.pickupLocations);
    }
  }, [pickupLocationsData]);

  useEffect(() => {
    if (organizationsData) {
      setOrganizations(organizationsData.organizations);
    }
  }, [organizationsData]);

  useEffect(() => {
    if (vehicleTypesData) {
      setVTypes(vehicleTypesData.vehicleTypes);
    }
  }, [vehicleTypesData]);

  useEffect(() => {
    if (usersData) {
      setSponsors(usersData.users);
    }
  }, [usersData]);

  useEffect(() => {
    if (context) {
      setAuthor({ id: userId, name: context.authState.user.displayName });
    }
  }, [context]);

  const onLoad = autocomplete => {
    setAutocomplete(autocomplete);
  };

  const initialSponsor = [];
  if (author && author.id) {
    const value = author.id;
    const label = author.name;
    initialSponsor.push({ label, value });
  }

  return (
    <Layout>
      <div className="inline w-10/12 mx-auto">
        <div className="inline mx-auto w-1/2 pb-8">
          <h4 className="headline text-center mx-auto w-6/8 mb-8">
            Add a New Trip
          </h4>
        </div>

        <div className="">
          <Formik
            initialValues={{
              tripName: "",
              departDateTime: new Date(),
              returnDateTime: new Date(),
              supervisor: "",
              estimateNeeded: false,
              isApproved: false,
              numberPrimaryVehiclesReq: 0,
              numberSupportVehiclesReq: 0,
              numberTravelers: 0,
              sponsor: initialSponsor ? initialSponsor : "",
              destination: "",
              organization: "",
              pickupLocation: "",
              primaryVehicleType: "",
              supportVehicleType: "",
              tripType: ""
            }}
            //validationSchema={RecipeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              // const departDT = moment(values.departDateTime);
              // const returnDT = moment(values.returnDateTime);
              // const departFormatted = departDT.tz("America/Chicago").format();
              // const returnFormatted = returnDT.tz("America/Chicago").format();
              await CreateTrip({
                variables: {
                  tripName: values.name,
                  departDateTime: values.departDateTime,
                  returnDateTime: values.returnDateTime,
                  supervisor_id: values.supervisor.value,
                  estimateNeeded: values.estimateNeeded,
                  isApproved: values.isApproved,
                  numberPrimaryVehiclesReq: values.numberPrimaryVehiclesReq,
                  numberSupportVehiclesReq: values.numberSupportVehiclesReq,
                  numberTravelers: values.numberTravelers,
                  sponsor_id: values.sponsor.value,
                  destinationId: values.destination.id,
                  destinationName: values.destination.name,
                  destinationAddress: values.destination.address,
                  organization_id: values.organization.value,
                  pickup_location_id: values.pickupLocation.value,
                  primary_vehicle_type_id: values.primaryVehicleType.value,
                  support_vehicle_type_id: values.supportVehicleType.value,
                  trip_type_id: values.tripType.value,
                  author: userId
                }
              });

              setSubmitting(false);
              Router.push(`/user/${userId}/trips`);
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
                      label="Trip Name"
                      name="name"
                      type="text"
                      placeholder="Trip Name"
                    />
                    {isLoaded && (
                      <Autocomplete
                        onLoad={onLoad}
                        onPlaceChanged={() =>
                          (values.destination = {
                            name: autocomplete.getPlace().name,
                            address: autocomplete.getPlace().formatted_address,
                            id: autocomplete.getPlace().id
                          })
                        }
                      >
                        <TextInput
                          label="Destination"
                          name="destination"
                          type="text"
                          placeholder="destination"
                          value={values.destination.formatted_address}
                        />
                      </Autocomplete>
                    )}

                    <FormikDatePicker
                      label="Departure Date/Time"
                      name="departDateTime"
                      onChange={setFieldValue}
                      value={values.departDateTime}
                      jsonLabel="departDateTime"
                    />
                    <FormikDatePicker
                      label="Return Date/Time"
                      name="returnDateTime"
                      onChange={setFieldValue}
                      value={values.returnDateTime}
                      jsonLabel="returnDateTime"
                    />
                    <MultiSelectInputSponsors
                      label="Trip Sponsor"
                      name="sponsor"
                      placeholder="Trip Sponsor"
                      onChange={setFieldValue}
                      value={values.sponsors}
                      options={sponsors}
                    />
                    <MultiSelectInputOrgs
                      label="Organization"
                      name="organization"
                      placeholder="Organization"
                      onChange={setFieldValue}
                      value={values.organization}
                      options={organizations}
                    />
                    <MultiSelectInputTripTypes
                      label="Trip Type"
                      name="tripType"
                      placeholder="Select the type of trip"
                      onChange={setFieldValue}
                      value={values.tripType}
                      options={tripTypes}
                    />
                    <MultiSelectInputSupervisors
                      label="Supervisor"
                      name="supervisor"
                      placeholder="Select Supervisor"
                      onChange={setFieldValue}
                      value={values.supervisor}
                      options={supervisors}
                    />
                    <MultiSelectInputPickupLocations
                      label="Pickup Location"
                      name="pickupLocation"
                      placeholder="Select Pickup Location"
                      onChange={setFieldValue}
                      value={values.pickupLocation}
                      options={pickupLocations}
                    />
                    <CheckBox
                      label="Estimate Needed"
                      name="estimateNeeded"
                      type="checkbox"
                    />
                    <CheckBox
                      label="Supervisor Approved"
                      name="isApproved"
                      type="checkbox"
                    />
                    <NumberInput
                      label="# of Primary Vehicles Needed"
                      name="numberPrimaryVehiclesReq"
                      type="number"
                    />
                    <NumberInput
                      label="# of Support Vehicles Needed"
                      name="numberSupportVehiclesReq"
                      type="number"
                    />
                    <NumberInput
                      label="# of Travelers"
                      name="numberTravelers"
                      type="number"
                    />
                    <MultiSelectInputVehicleTypes
                      label="Primary Vehicle Type"
                      name="primaryVehicleType"
                      onChange={setFieldValue}
                      placeholder="Primary Vehicle Type"
                      options={vTypes}
                      value={values.primaryVehicleType}
                      jsonLabel="primaryVehicleType"
                    />
                    <MultiSelectInputVehicleTypes
                      label="Support Vehicle Type"
                      name="suppportVehicleType"
                      onChange={setFieldValue}
                      placeholder="Support Vehicle Type"
                      options={vTypes}
                      value={values.supportVehicleType}
                      jsonLabel="supportVehicleType"
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

export default withApollo(NewTripForm);
