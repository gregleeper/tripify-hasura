import React from "react";
import Link from "next/link";

const ActiveLI = props => {
  return (
    <li className=" text-lg bg-blue-700 text-white pl-5 pr-3 py-3">
      <Link href={props.to}>
        <a className="hover:text-gray-400">{props.title}</a>
      </Link>
    </li>
  );
};

export default ActiveLI;
