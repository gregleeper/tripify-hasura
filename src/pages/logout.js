import { logout } from "../utils/login";
import { withApollo } from "../lib/apollo";
import Layout from "../components/layout";
// import { ApolloClient } from "apollo-client";

const Logout = pageProps => (
  <Layout pageProps={pageProps}>
    <div>Logging out...{logout()}</div>
  </Layout>
);

export default withApollo(Logout);
