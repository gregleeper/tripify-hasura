import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ActiveLI from "../components/shared/activeListItem";
import InactiveLI from "../components/shared/inactiveListItem";

const SideNav = () => {
  const router = useRouter();
  const activePath = router.pathname;

  return (
    <div className="rounded-lg">
      <ul className="relative inline-block text-left bg-blue-900 h-screen">
        {activePath.startsWith("/admin/trips", 0) ? (
          <ActiveLI to="/admin/trips" title="Trips" />
        ) : (
          <InactiveLI to="/admin/trips" title="Trips" />
        )}
        {activePath.startsWith("/admin/vehicles", 0) ? (
          <ActiveLI to="/admin/vehicles" title="Vehicles" />
        ) : (
          <InactiveLI to="/admin/vehicles" title="Vehicles" />
        )}
        {activePath.startsWith("/admin/vehicle-type", 0) ? (
          <ActiveLI to="/admin/vehicle-types" title="Vehicle Types" />
        ) : (
          <InactiveLI to="/admin/vehicle-types" title="Vehicle Types" />
        )}
        {activePath.startsWith("/admin/destination", 0) ? (
          <ActiveLI to="/admin/destinations" title="Destinations" />
        ) : (
          <InactiveLI to="/admin/destinations" title="Destinations" />
        )}
        {activePath.startsWith("/admin/organization", 0) ? (
          <ActiveLI to="/admin/organizations" title="Organizations" />
        ) : (
          <InactiveLI to="/admin/organizations" title="Organizations" />
        )}
        {activePath.startsWith("/admin/pickup-location", 0) ? (
          <ActiveLI to="/admin/pickup-locations" title="Pickup Locations" />
        ) : (
          <InactiveLI to="/admin/pickup-locations" title="Pickup Locations" />
        )}
        {activePath.startsWith("/admin/user", 0) ? (
          <ActiveLI to="/admin/users" title="Users" />
        ) : (
          <InactiveLI to="/admin/users" title="Users" />
        )}
        {activePath.startsWith("/admin/driver", 0) ? (
          <ActiveLI to="/admin/drivers" title="Drivers" />
        ) : (
          <InactiveLI to="/admin/drivers" title="Drivers" />
        )}
        {activePath.startsWith("/admin/supervisor", 0) ? (
          <ActiveLI to="/admin/supervisors" title="Supervisors" />
        ) : (
          <InactiveLI to="/admin/supervisors" title="Supervisors" />
        )}
        {activePath.startsWith("/admin/trip-type", 0) ? (
          <ActiveLI to="/admin/trip-types" title="Trip Types" />
        ) : (
          <InactiveLI to="/admin/trip-types" title="Trip Types" />
        )}
        {activePath.startsWith("/admin/dashboard", 0) ? (
          <ActiveLI to="/admin/dashboard" title="Dashboard" />
        ) : (
          <InactiveLI to="/admin/dashboard" title="Dashboard" />
        )}
      </ul>
    </div>
  );
};

export default SideNav;
