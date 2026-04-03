import React from "react";

export function Switch({ checked = false, onCheckedChange, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${className}`}
      style={{ backgroundColor: checked ? "#00c389" : "#202938" }}
    >
      <span
        className="inline-block h-5 w-5 transform rounded-full bg-white transition"
        style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
      />
    </button>
  );
}
