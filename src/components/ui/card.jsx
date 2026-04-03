import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={`rounded-2xl border ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <div className={`text-lg font-semibold ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }) {
  return <div className={`text-sm opacity-80 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}
