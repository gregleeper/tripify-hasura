import Layout from "../../components/layout";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { withApollo } from "../../lib/apollo";
import { withAuthSync } from "../../utils/login";
import DashboardCard from "../../components/dashboardCard";
import SideNav from "../../components/sideAdminNav";

const GET_VEHICLES = gql`
  query Vehicles {
    vehicles {
      id
    }
  }
`;

const GET_VEHICLE_TYPES = gql`
  query GetVehicleTypes {
    vehicleTypes {
      id
      name
    }
  }
`;

const GET_USERS = gql`
  query Users {
    users {
      id
    }
  }
`;

const GET_DRIVERS = gql`
  query Drivers {
    users(where: { isDriver: { equals: true } }) {
      id
    }
  }
`;

const GET_SUPERVISORS = gql`
  query Supervisor {
    users(where: { isSupervisor: { equals: true } }) {
      id
    }
  }
`;

const GET_TRIPS = gql`
  query Trips {
    trips {
      id
    }
  }
`;

const AdminDashboard = () => {
  const {
    data: vehiclesData,
    loading: vehiclesLoading,
    error: vehiclesError
  } = useQuery(GET_VEHICLES);
  const {
    data: vTypesData,
    loading: vTypesLoading,
    error: vTypesError
  } = useQuery(GET_VEHICLE_TYPES);
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useQuery(GET_USERS);
  const {
    data: driversData,
    loading: driversLoading,
    error: driversError
  } = useQuery(GET_DRIVERS);
  const {
    data: supervisorsData,
    loading: supervisorsLoading,
    error: supervisorsError
  } = useQuery(GET_SUPERVISORS);
  const {
    data: tripsData,
    loading: tripsLoading,
    error: tripsError
  } = useQuery(GET_TRIPS);
  return (
    <Layout>
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <SideNav />
        </div>
        <div className="col-span-10 col-start-3">
          <div className="flex mx-auto">
            <div className="flex justify-center w-full px-2">
              {vehiclesData && (
                <Link href="/admin/vehicles">
                  <a className="flex justify-center w-full">
                    <DashboardCard
                      data={vehiclesData.vehicles}
                      title="Vehicles"
                    />
                  </a>
                </Link>
              )}
            </div>
            <div className="flex justify-center w-full px-2">
              {vTypesData && (
                <Link href="/admin/vehicle-types">
                  <a className="flex justify-center w-full">
                    <DashboardCard
                      data={vTypesData.vehicleTypes}
                      title="Vehicle Types"
                    />
                  </a>
                </Link>
              )}
            </div>
            <div className="flex justify-center w-full px-2">
              {usersData && (
                <Link href="/admin/users">
                  <a className="flex justify-center w-full">
                    <DashboardCard data={usersData.users} title="Users" />
                  </a>
                </Link>
              )}
            </div>
          </div>
          <div className="flex mx-auto mt-2">
            <div className="flex justify-center w-full px-2">
              {driversData && (
                <Link href="/admin/drivers">
                  <a className="flex justify-center w-full">
                    <DashboardCard data={driversData.users} title="Drivers" />
                  </a>
                </Link>
              )}
            </div>
            <div className="flex justify-center w-full px-2">
              {supervisorsData && (
                <Link href="/admin/supervisors">
                  <a className="flex justify-center w-full">
                    <DashboardCard
                      data={supervisorsData.users}
                      title="Supervisors"
                    />
                  </a>
                </Link>
              )}
            </div>
            <div className="flex justify-center w-full px-2">
              {tripsData && (
                <Link href="/trips">
                  <a className="flex justify-center w-full">
                    <DashboardCard data={tripsData.trips} title="Trips" />
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(withAuthSync(AdminDashboard));
