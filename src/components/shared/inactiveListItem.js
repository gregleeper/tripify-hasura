import React from "react";
import Link from "next/link";

const InactiveLI = props => {
  return (
    <li className="text-white text-lg pl-5 pr-3 py-3">
      <Link href={props.to}>
        <a className="hover:text-gray-400">{props.title}</a>
      </Link>
    </li>
  );
};

export default InactiveLI;
