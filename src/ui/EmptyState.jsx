import React from "react";
import DragonGate from "../assets/motifs/Motifs";

const EmptyState = ({
  title = "Chưa có gì ở đây",
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`grain-bg flex flex-col items-center justify-center gap-4 py-16 px-6 text-center bg-surface border border-dashed border-gold/40 rounded-lg ${className}`}
    >
      <DragonGate size={88} className="text-gold" />
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
