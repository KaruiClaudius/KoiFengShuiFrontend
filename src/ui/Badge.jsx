import React from "react";
import { ElementDot } from "../assets/motifs/Motifs";

const elementColors = {
  kim: "bg-kim/15 text-[#6b6449] border-kim/40",
  moc: "bg-moc/15 text-moc border-moc/40",
  thuy: "bg-thuy/15 text-thuy border-thuy/40",
  hoa: "bg-hoa/15 text-hoa border-hoa/40",
  tho: "bg-tho/15 text-tho border-tho/40",
};

const Badge = ({ element, className = "", children }) => {
  if (element) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${elementColors[element] || "bg-paper-2 text-ink-soft border-gold/30"} ${className}`}
      >
        <ElementDot element={element} size={10} />
        {children}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-crimson text-[#FDF6EC] shadow-plaque -rotate-3 ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
