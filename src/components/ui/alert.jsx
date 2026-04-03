import React from "react";

export function Alert({ className = "", ...props }) {
  return <div className={`rounded-2xl p-4 ${className}`} {...props} />;
}

export function AlertTitle({ className = "", ...props }) {
  return <div className={`mb-1 font-semibold ${className}`} {...props} />;
}

export function AlertDescription({ className = "", ...props }) {
  return <div className={`text-sm ${className}`} {...props} />;
}
