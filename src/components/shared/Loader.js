import React from "react";
import { css } from "@emotion/core";
import GridLoader from "react-spinners/GridLoader";

const LoaderSpinner = () => {
  return <GridLoader size={30} margin={2} color={"#667eea"} />;
};

export default LoaderSpinner;
