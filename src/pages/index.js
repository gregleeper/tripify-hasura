import { useContext } from "react";
import Layout from "../components/layout";
import MyCalendar from "../components/caldendar";
import { withApollo } from "../lib/apollo";
import { userContext } from "./_app";

function Home() {
  const { authState } = useContext(userContext);

  return (
    <Layout>
      {authState.user && (
        <div className=" mb-4 ml-2 ">
          <h2 className="text-xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
            Welcome, {authState.user.displayName}!
          </h2>
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <MyCalendar />
      </div>
    </Layout>
  );
}

export default Home;
