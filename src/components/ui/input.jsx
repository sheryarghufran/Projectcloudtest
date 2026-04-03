import React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded-xl px-3 py-2 text-sm text-white outline-none ${className}`}
    {...props}
  />
));
Input.displayName = "Input";
