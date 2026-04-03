import React, { createContext, useContext, useMemo, useState } from "react";

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);
  const ctx = useMemo(() => ({ value, onValueChange, open, setOpen }), [value, onValueChange, open]);
  return <SelectContext.Provider value={ctx}><div className="relative">{children}</div></SelectContext.Provider>;
}

export function SelectTrigger({ className = "", children, style }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const ctx = useContext(SelectContext);
  return <span>{ctx?.value || placeholder || "Select"}</span>;
}

export function SelectContent({ children }) {
  const ctx = useContext(SelectContext);
  if (!ctx?.open) return null;
  return <div className="absolute z-50 mt-2 w-full rounded-xl border bg-[#0f1319] p-1 shadow-xl">{children}</div>;
}

export function SelectItem({ value, children }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => {
        ctx?.onValueChange?.(value);
        ctx?.setOpen(false);
      }}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
    >
      {children}
    </button>
  );
}
