import React from "react";

export function Separator({ className = "", ...props }) {
  return <div className={`h-px w-full bg-white/10 ${className}`} {...props} />;
}
