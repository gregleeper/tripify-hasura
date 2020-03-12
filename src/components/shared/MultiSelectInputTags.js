import React, { useState } from "react";
import { useField } from "formik";
import Select from "react-select/lib/Creatable";

const MultiSelectInputTags = ({ label, options, value, ...props }) => {
  const [field, meta] = useField(props);

  const myOptions = options.map(option => ({
    label: option.name,
    value: option.id
  }));
  const handleChange = value => {
    props.onChange("tags", value);
  };

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
        <Select
          {...field}
          {...props}
          value={value}
          options={myOptions}
          onChange={handleChange}
          isSearchable
          isMulti
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

export default MultiSelectInputTags;
