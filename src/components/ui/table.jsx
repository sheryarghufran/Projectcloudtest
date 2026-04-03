import React from "react";

export function Table({ className = "", ...props }) {
  return <table className={`w-full border-collapse text-left text-sm ${className}`} {...props} />;
}
export function TableHeader(props) { return <thead {...props} />; }
export function TableBody(props) { return <tbody {...props} />; }
export function TableRow({ className = "", ...props }) { return <tr className={className} {...props} />; }
export function TableHead({ className = "", ...props }) { return <th className={`px-4 py-3 font-medium ${className}`} {...props} />; }
export function TableCell({ className = "", ...props }) { return <td className={`px-4 py-3 align-top ${className}`} {...props} />; }
