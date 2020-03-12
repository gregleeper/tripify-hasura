import React, { useState, useEffect, useMemo } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";
import { withApollo } from "../../../../lib/apollo";
import Table from "../../../../components/shared/table";
import moment from "moment";
import Link from "next/link";
import SideNav from "../../../../components/sideAdminNav";

const GET_ORGTRIPS = gql`
  query GetOrgTrips($id: uuid!) {
    organizations(where: { id: { _eq: $id } }) {
      id
      name
      trips {
        id
        tripName
        destination {
          name
          address
        }
        departDateTime
        returnDateTime
        tripVehiclesByTripId {
          vehicle {
            id
            name
          }
        }
        numberTravelers
        sponsor {
          name
        }
        primaryVehicleType {
          name
        }
        numberPrimaryVehiclesReq
      }
    }
  }
`;

const OrgTrips = () => {
  const Router = useRouter();

  const { id } = Router.query;
  const { data, loading, error } = useQuery(GET_ORGTRIPS, {
    variables: { id: id }
  });
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (data) {
      setTrips(data.organizations[0].trips);
    }
  }, [data]);

  const columns = useMemo(() => [
    {
      id: "name",
      Header: "Trip Name",
      accessor: "tripName"
    },
    {
      id: "address",
      Header: "Address",
      accessor: d => d.destination.name + ", " + d.destination.address
    },
    {
      id: "depart",
      Header: "Depart Date",
      accessor: d =>
        moment(d.departDateTime)
          .local()
          .format("MM/DD/YYYY h:mm a")
    },
    {
      id: "return",
      Header: "Return Date",
      accessor: d =>
        moment(d.returnDateTime)
          .local()
          .format("MM/DD/YYYY h:mm a")
    },
    {
      id: "vehicles",
      Header: "Vehicles Assigned",
      accessor: "tripVehiclesByTripId",
      Cell: cell => {
        const vehicleList = cell.cell.value.map(v => v.vehicle.name).join(", ");
        return <span>{vehicleList}</span>;
      }
    },
    {
      id: "numberOfTravelers",
      Header: "Number Traveling",
      accessor: "numberTravelers"
    },
    {
      id: "sponsor",
      Header: "Sponsor",
      accessor: "sponsor.name"
    },
    {
      id: "primaryType",
      Header: "Primary Vehicle Type Requested",
      accessor: "primaryVehicleType.name"
    },
    {
      id: "numberNeeded",
      Header: "Number of Primary Vehicles Needed",
      accessor: "numberPrimaryVehiclesReq"
    }
  ]);

  return (
    <Layout>
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <SideNav />
        </div>
        <div className="col-start-3 col-span-10">
          <div className="grid grid-cols-12 mt-3">
            <div className="col-start-6 col-span-2">
              <div className="text-center text-2xl mb-3">
                {data && data.organizations[0].name} Trips
              </div>
            </div>
            <div className="col-start-1 col-span-12">
              <div className="lg:grid grid-cols-1 md:grid-cols-12">
                <div className="col-span-12 col-start-1 ml-3 mr-3">
                  <Table data={trips} columns={columns} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withApollo(OrgTrips);
