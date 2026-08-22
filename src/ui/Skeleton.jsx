import React from "react";

const Skeleton = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-gradient-to-r from-paper-2 via-surface to-paper-2 bg-[length:400px_100%] animate-shimmer ${className}`}
    />
  );
};

export const PageLoader = () => {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="min-h-screen grain-bg flex flex-col items-center justify-center gap-6 bg-paper"
    >
      <svg viewBox="0 0 64 64" width="56" height="56" className="text-crimson">
        <rect x="4" y="4" width="56" height="56" rx="12" fill="#A92C2C" />
        <rect
          x="9"
          y="9"
          width="46"
          height="46"
          rx="8"
          fill="none"
          stroke="#FDF6EC"
          strokeOpacity="0.55"
          strokeDasharray="4 2.4"
          strokeWidth="1.5"
        />
        <text
          x="32"
          y="33"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Playfair Display','Noto Serif Display',serif"
          fontWeight="700"
          fontSize="26"
          fill="#FDF6EC"
        >
          鯉
        </text>
      </svg>
      <p className="text-sm tracking-widest uppercase text-muted">Đang tải…</p>
    </div>
  );
};

export default Skeleton;
