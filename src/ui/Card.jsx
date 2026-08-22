
const Card = ({ className = "", interactive = false, children, ...rest }) => {
  return (
    <div
      className={`grain-bg border border-gold/40 rounded-lg bg-surface shadow-plaque ${
        interactive
          ? "transition-all duration-base ease-water hover:-translate-y-1 hover:shadow-lift cursor-pointer"
          : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
