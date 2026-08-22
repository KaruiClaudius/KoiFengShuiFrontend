import React from "react";

const variants = {
  primary:
    "bg-crimson text-[#FDF6EC] hover:bg-crimson-deep focus-visible:shadow-gold",
  secondary:
    "border border-ink bg-transparent text-ink hover:bg-paper-2 focus-visible:shadow-gold",
  ghost: "bg-transparent text-crimson hover:bg-paper-2 focus-visible:shadow-gold",
  gold: "bg-gold text-ink hover:brightness-105 focus-visible:shadow-gold",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-sm gap-1.5",
  md: "px-5 py-2.5 text-[15px] rounded-md gap-2",
  lg: "px-7 py-3.5 text-base rounded-md gap-2",
};

const Button = React.forwardRef(
  (
    { variant = "primary", size = "md", className = "", as = "button", ...rest },
    ref
  ) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center font-semibold select-none transition-all duration-fast ease-water disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button";
export default Button;
