import React, { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRouter } from "next/router";
import Layout from "../../../../../components/layout";
import SideNav from "../../../../../components/sideAdminNav";
import { withApollo } from "../../../../../lib/apollo";
import moment from "moment-timezone";
import Link from "next/link";

const GET_TRIP = gql`
  query Trip($id: uuid!) {
    trips(where: { id: { _eq: $id } }) {
      id
      tripName
      departDateTime
      returnDateTime
      destination {
        name
        address
      }
      numberPrimaryVehiclesReq
      numberSupportVehiclesReq
      primaryVehicleType {
        name
      }
      supportVehicleType {
        name
      }
      numberTravelers
      organization {
        id
        name
      }
      pickupLocation {
        id
        name
      }
      estimateNeeded
      author {
        name
        email
      }
      sponsor {
        name
        email
      }
      tripType {
        name
      }
      tripVehiclesByTripId {
        vehicle {
          id
          name
          make
          model
          vehicleType {
            name
          }
        }
      }
      tripDriversByTripId {
        driver {
          user {
            name
            email
          }
        }
      }
      tripVehiclesByTripId_aggregate {
        aggregate {
          count
        }
      }
      tripDriversByTripId_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

const ManageTrip = () => {
  const router = useRouter();
  const tripId = router.query.id;
  const [GetTrip, { loading, error, data }] = useLazyQuery(GET_TRIP);
  const [trip, setTrip] = useState({});
  const [discrepancies, setDiscrepancies] = useState();

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    GetTrip({
      variables: { id: tripId }
    });
  }, []);

  useEffect(() => {
    if (data) {
      setTrip(data.trips[0]);
    }
  }, [data]);

  useEffect(() => {
    if (trip.tripName) {
      let vehicleCount = trip.tripVehiclesByTripId.length;
      let driverCount = trip.tripDriversByTripId.length;
      let vehiclesRequested =
        trip.numberPrimaryVehiclesReq + trip.numberSupportVehiclesReq;
      if (vehicleCount !== vehiclesRequested) {
        if (driverCount !== vehicleCount) {
          return setDiscrepancies({
            vehicles: "Vehicles assigned not equeal to vehicles requested",
            drivers: "Drivers assigned not equal to vehicles assigned"
          });
        }
        return setDiscrepancies({
          ...discrepancies,
          vehicles: "Vehicles assigned not equeal to vehicles requested"
        });
      }
      if (driverCount !== vehicleCount) {
        return setDiscrepancies({
          drivers: "Drivers assigned not equal to vehicles assinged."
        });
      }
    }
  }, [trip]);

  console.log(discrepancies);

  const departing = moment(trip.departDateTime).format("MM/DD/YYYY h:mm a");
  const returning = moment(trip.returnDateTime).format("MM/DD/YYYY h:mm a");
  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6 ">
        <div className="col-span-2">
          <SideNav />
        </div>
        {trip && trip.tripName && (
          <>
            <div className="sm:col-start-3 sm:col-span-6 col-start-2 col-span-10 mt-4 pb-4">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <div className="flex flex-1 justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Trip Information
                    </h3>
                    <Link
                      href="/admin/trips/manage-trip/[id]/assign"
                      as={`/admin/trips/manage-trip/${tripId}/assign`}
                    >
                      <a className="text-blue-500 hover:text-blue-700">
                        Manage
                      </a>
                    </Link>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
                    Details about the trip
                  </p>
                </div>

                <div>
                  <dl>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Trip Name:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.tripName}
                      </dt>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Destination:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.destination.name}, {trip.destination.address}
                      </dt>
                    </div>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Date/Time Range:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {departing} - {returning}
                      </dt>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Type:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.tripType.name}
                      </dt>
                    </div>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Organization:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.organization.name}
                      </dt>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Primary Vehicle Type and Number Requested:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.numberPrimaryVehiclesReq} -{" "}
                        {trip.primaryVehicleType.name}
                      </dt>
                    </div>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Support Vehicle Type and Number Requested:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.supportVehicleType
                          ? `${trip.numberSupportVehiclesReq} -  ${trip.supportVehicleType.name}`
                          : "N/A"}
                      </dt>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Created By:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        Name: {trip.author.name}, Email: {trip.author.email}
                      </dt>
                    </div>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Sponsor:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        Name: {trip.sponsor.name}, Email: {trip.sponsor.email}
                      </dt>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Vehicle(s) Assigned:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.tripVehiclesByTripId.map(v => (
                          <dt>
                            {"Name: " +
                              v.vehicle.name +
                              +" " +
                              ", Type: " +
                              v.vehicle.vehicleType.name}
                          </dt>
                        ))}
                      </dt>
                    </div>
                    <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dd className="text-sm leading-5 font-medium text-gray-500">
                        Driver(s) Assigned:
                      </dd>
                      <dt className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                        {trip.tripDriversByTripId.length > 0
                          ? trip.tripDriversByTripId.map(d => (
                              <p key="d.driver.user.email">
                                {d.driver.user.name}, {d.driver.user.email}
                              </p>
                            ))
                          : "None Assigned"}
                      </dt>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-start-9 col-span-3 mt-4">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Discrepancies
                  </h3>
                  {discrepancies && discrepancies.vehicles ? (
                    <div className="bg-gray-200 rounded-lg">
                      <p className="p-2 mt-3 max-w-2xl text-md leading-5 text-red-700">
                        <Link
                          href="/admin/trips/manage-trip/[id]/assign"
                          as={`/admin/trips/manage-trip/${tripId}/assign`}
                        >
                          <a>{discrepancies.vehicles}</a>
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {discrepancies && discrepancies.drivers ? (
                    <div className="bg-gray-200 rounded-lg">
                      <p className="p-2 mt-1 max-w-2xl text-md leading-5 text-red-700">
                        <Link
                          href="/admin/trips/manage-trip/[id]/assign"
                          as={`/admin/trips/manage-trip/${tripId}/assign`}
                        >
                          <a>{discrepancies.drivers}</a>
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default withApollo(ManageTrip);
