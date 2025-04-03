import React from "react";

const TextField = ({ label, type = "text", name, formik, ...props }) => {
  return (
    <div className="mt-4">
      <label className="block text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="form-control py-3 px-4 block w-full border rounded-md"
        placeholder={label}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
      )}
    </div>
  );
};

export default TextField;
