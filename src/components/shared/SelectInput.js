import React from "react";
import { useField } from "formik";

const CheckboxInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="md:flex md:items-center mb-6">
      <div className="md:w-1/4">
        <label
          className="block text-gray-600 font-bold md:text-right mb-1 md:mb-0 pr-4"
          htmlFor={props.id || props.name}
        >
          {label}
        </label>
      </div>
      <div className="md:w-1/2">
        <select
          className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          {...field}
          {...props}
        />
        {meta.touched && meta.error ? (
          <div className="text-red-500 text-sm italic text-center">
            {meta.error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CheckboxInput;
