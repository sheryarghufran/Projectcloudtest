import React from "react";

export function Badge({ className = "", style, ...props }) {
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium ${className}`} style={style} {...props} />;
}
