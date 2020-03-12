import { useContext } from "react";
import { userContext } from "../pages/_app";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { withApollo } from "../lib/apollo";
import { FaBusAlt } from "react-icons/fa";
import { auth } from "firebase";

function Header(pageProps, props) {
  const context = useContext(userContext);
  // console.log(context.authState);
  const [isExpanded, toggleExpansion] = useState(false);
  const NoUserMenu = () => {
    return (
      <>
        <li className="mt-3 md:mt-0 md:ml-6">
          <Link href="/">
            <a className="block text-white">Home</a>
          </Link>
        </li>
        <li className="mt-3 md:mt-0 md:ml-6 text-white">
          <button onClick={context.signIn}>Login</button>
        </li>
      </>
    );
  };
  const UserMenu = () => {
    if (context.authState.user) {
      if (context.authState.manager) {
        return [
          { title: "Home", route: "/" },
          {
            title: "My Trips",
            route: "/user/[id]/trips",
            as: `/user/${context.authState.user.uid}/trips`
          },
          { title: "Dashboard", route: "/admin/dashboard" }
        ].map(navigationItem => (
          <li className="mt-3 md:mt-0 md:ml-6" key={navigationItem.title}>
            <Link href={navigationItem.route} as={navigationItem.as}>
              <a className="block text-white">{navigationItem.title}</a>
            </Link>
          </li>
        ));
      }
      return [
        { title: "Home", route: "/" },
        {
          title: "My Trips",
          route: "/user/[id]/trips",
          as: `/user/${context.authState.user.uid}/trips`
        }
      ].map(navigationItem => (
        <li className="mt-3 md:mt-0 md:ml-6" key={navigationItem.title}>
          <Link href={navigationItem.route} as={navigationItem.as}>
            <a className="block text-white">{navigationItem.title}</a>
          </Link>
        </li>
      ));
    }
  };

  return (
    <header className="bg-blue-900">
      <div className="flex flex-wrap md:flex-no-wrap items-center justify-between max-w-6xl mx-auto p-2 md:p-2">
        <div className="flex items-center">
          <FaBusAlt className="text-2xl text-white mr-2" />
          <Link href="/">
            <a className="font-bold text-white text-xl">Tripify</a>
          </Link>
        </div>

        <button
          className="block md:hidden border border-white flex items-center px-3 py-2 rounded text-white"
          onClick={() => toggleExpansion(!isExpanded)}
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>

        <ul
          className={`${
            isExpanded ? `block` : `hidden`
          } md:flex flex-col md:flex-row md:items-center md:justify-center text-sm w-full md:w-auto`}
        >
          {context.authState.user ? <UserMenu /> : <NoUserMenu />}
          {context.authState.user ? (
            <li className="mt-3 md:mt-0 md:ml-6 text-white">
              <button onClick={context.signOut}>Logout</button>
            </li>
          ) : (
            <>
              <li className="mt-3 md:mt-0 md:ml-6 text-white">
                <button onClick={context.logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default withApollo(Header);
