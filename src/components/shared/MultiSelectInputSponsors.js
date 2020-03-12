import { useState, useEffect } from "react";
import { useField } from "formik";
import Select from "react-select";

const MultiSelectInputSponsors = ({
  label,
  options,
  value,
  jsonLabel,
  ...props
}) => {
  const [field, meta] = useField(props);

  const myOptions = options.map(option => ({
    label: option.name,
    value: option.id
  }));
  // set the value of the field to the inital value being passed in
  value = meta.initialValue[0];
  // use lifecycle method to set the prop.onchange so it's changed in the parent component
  useEffect(() => {
    if (value) {
      props.onChange(props.name, value);
    }
  }, [value]);
  const handleChange = value => {
    props.onChange("sponsor", value);
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

export default MultiSelectInputSponsors;
