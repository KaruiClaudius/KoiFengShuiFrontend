import React from "react";

export const Input = React.forwardRef(
  ({ label, error, hint, className = "", id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={`px-3.5 py-2.5 rounded-md bg-surface border transition-shadow duration-fast outline-none placeholder:text-muted focus:shadow-gold ${
            error ? "border-crimson" : "border-gold/40 focus:border-gold"
          } ${className}`}
          {...rest}
        />
        {error && <p className="text-xs text-crimson">{error}</p>}
        {!error && hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
