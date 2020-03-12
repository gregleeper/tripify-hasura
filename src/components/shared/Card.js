import React from "react";
import Link from "next/link";

const Card = props => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {props.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
          {props.description}
        </p>
      </div>
      <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <Link href={props.to}>
          <a>View</a>
        </Link>
      </div>
    </div>
  );
};

export default Card;
