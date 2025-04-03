import React from "react";

const Button = ({ type = "button", children, className, ...props }) => {
  return (
    <button
      type={type}
      className={`btn btn-primary py-3 px-4 rounded-md w-full xl:w-32 xl:mr-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
