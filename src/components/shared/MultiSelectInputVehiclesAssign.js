import { useState } from "react";
import { useField } from "formik";
import Select from "react-select";

const MultiSelectInputVehiclesAssign = ({
  label,
  options,
  value,
  jsonLabel,
  ...props
}) => {
  const [field, meta] = useField(props);
  console.log(options);
  const myOptions = options.map(option => ({
    label: option.name + ` - ` + option.make + " - " + option.model,
    value: option.id
  }));

  const handleChange = value => {
    props.onChange(jsonLabel, value);
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
      <div className="md:w-full">
        <Select
          {...field}
          {...props}
          value={value || field.value}
          options={myOptions}
          onChange={handleChange}
          isSearchable
          className="focus:border-purple-500"
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

export default MultiSelectInputVehiclesAssign;
