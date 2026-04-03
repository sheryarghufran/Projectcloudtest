import React from "react";

export function Tabs({ className = "", children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function TabsList({ className = "", children, ...props }) {
  return <div className={`inline-flex gap-2 ${className}`} {...props}>{children}</div>;
}

export function TabsTrigger({ className = "", children, ...props }) {
  return <button className={`rounded-lg px-3 py-2 text-sm ${className}`} {...props}>{children}</button>;
}

export function TabsContent({ className = "", children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}
