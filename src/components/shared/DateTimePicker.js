import { useState } from "react";
import { useField } from "formik";
import DatePicker from "react-datepicker";
import moment from "moment";

const FormikDatePicker = ({ label, options, value, jsonLabel, ...props }) => {
  //const [date, setDate] = useState(new Date());
  const [field, meta] = useField(props);

  // const myOptions = options.map(option => ({
  //   label: option.name,
  //   value: option.id
  // }));
  const handleChange = value => {
    // const dateTime = moment(value).format("YYYY-MM-DDTHH:mm-6:00");
    // value = dateTime;
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
      <div className="md:w-1/2">
        <DatePicker
          {...field}
          {...props}
          selected={value}
          value={value || field.value}
          onChange={handleChange}
          showTimeSelect
          timeFormat="h:mm aa"
          timeIntervals={5}
          timeCaption="time"
          dateFormat="MM/dd/yyyy h:mm aa"
          className="w-64 px-3"
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

export default FormikDatePicker;
