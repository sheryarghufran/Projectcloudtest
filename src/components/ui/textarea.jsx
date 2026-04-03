import React from "react";

export const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full rounded-xl px-3 py-2 text-sm text-white outline-none ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";
