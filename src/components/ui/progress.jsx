import React from "react";

export function Progress({ value = 0 }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
