import React from "react";

export const Button = React.forwardRef(({ className = "", variant = "default", style, ...props }, ref) => {
  const variantStyle = variant === "outline"
    ? { backgroundColor: "transparent", border: "1px solid currentColor" }
    : { border: "1px solid transparent" };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    />
  );
});
Button.displayName = "Button";
