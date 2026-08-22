import PropTypes from "prop-types";
import { useId } from "react";

export function SealStamp({
  char = "鯉",
  size = 44,
  rotate = -4,
  bg = "#A92C2C",
  fg = "#FDF6EC",
  className = "",
  ...rest
}) {
  const inset = size * 0.09;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Seal ${char}`}
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      {...rest}
    >
      <title>{`Seal ${char}`}</title>
      <rect x={0} y={0} width={size} height={size} rx={size * 0.2} fill={bg} />
      <rect
        x={inset}
        y={inset}
        width={size - inset * 2}
        height={size - inset * 2}
        rx={size * 0.14}
        fill="none"
        stroke={fg}
        strokeWidth={1.5}
        strokeDasharray="4 2.4"
        opacity={0.55}
      />
      <text
        x="50%"
        y="50%"
        fontFamily="'Playfair Display','Noto Serif Display',serif"
        fontWeight={700}
        fill={fg}
        fontSize={size * 0.46}
        dominantBaseline="central"
        textAnchor="middle"
      >
        {char}
      </text>
    </svg>
  );
}

SealStamp.propTypes = {
  char: PropTypes.string,
  size: PropTypes.number,
  rotate: PropTypes.number,
  bg: PropTypes.string,
  fg: PropTypes.string,
  className: PropTypes.string,
};

export function WaveBand({
  height = 56,
  opacity = 0.14,
  color = "#C9A227",
  className = "",
  ...rest
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width="100%"
      height={height}
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <defs>
        <pattern id={id} width={56} height={28} patternUnits="userSpaceOnUse">
          {[0, 28].map((cx) => (
            <g
              key={cx}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              opacity={opacity}
            >
              <circle cx={cx} cy={28} r={18} />
              <circle cx={cx} cy={28} r={13} />
              <circle cx={cx} cy={28} r={8} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

WaveBand.propTypes = {
  height: PropTypes.number,
  opacity: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

export function CloudDivider({ width = "100%", className = "", ...rest }) {
  return (
    <svg
      width={width}
      viewBox="0 0 240 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d="M2 12h72" />
      <path d="M166 12h72" />
      <path d="M74 12 C84 12 90 9 94 6 C99 3 105 5 105 9.5 C105 13 101 15 98 13.5 C95.5 12.3 95.8 9.3 98 8.5" />
      <path d="M166 12 C156 12 150 9 146 6 C141 3 135 5 135 9.5 C135 13 139 15 142 13.5 C144.5 12.3 144.2 9.3 142 8.5" />
      <path d="M100 15 Q120 21 140 15" />
      <path d="M120 2 L123 5 L120 8 L117 5 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

CloudDivider.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

export function KoiSilhouette({ size = 48, flip = false, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={(size * 40) / 64}
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <g transform={flip ? "translate(64 0) scale(-1 1)" : undefined}>
        <path d="M6 20 C8 15 14 11.5 21 10.6 C29 9.6 38 11.2 45 14.6 C48.6 16.3 51 18.2 52.5 20" />
        <path d="M52.5 20 C50.5 23 46.5 26.4 41 28.2 C33.5 30.6 22 30 14.5 26.6 C10.6 24.8 7.6 22.6 6 20" />
        <path d="M52.5 19.8 C57 17 60 12.8 61 8.5 C61.8 14.2 58.8 18.4 53.4 20.4 Z" />
        <path d="M53 20.6 C56.8 23.2 59.3 27.2 60.2 31.5 C61 26 58.6 22.4 54.2 21 Z" />
        <path d="M24.8 10.6 C27.8 6.8 33.6 6.2 38.2 9.6 C33.6 9.2 28.8 9.6 24.8 10.6 Z" />
        <path d="M16.5 28.2 C13.6 30.8 11.6 34 10.8 37.6 C14.4 35.4 17.4 32.2 19.4 28.8" />
        <circle cx={10.8} cy={17.4} r={1.5} fill="currentColor" stroke="none" />
        <path d="M25.5 16 c1.6 1.9 4.2 2 5.9 .2" />
        <path d="M30.2 20.2 c1.6 1.9 4.2 2 5.9 .2" />
        <path d="M34.8 16.4 c1.6 1.9 4.2 2 5.9 .2" />
        <path d="M6.9 21.4 C7.8 23.6 9.4 25.6 11.4 26.4" />
        <path d="M8.6 22 C9.4 23.5 10.8 24.7 12.6 25.4" />
      </g>
    </svg>
  );
}

KoiSilhouette.propTypes = {
  size: PropTypes.number,
  flip: PropTypes.bool,
  className: PropTypes.string,
};

export function DragonGate({ size = 96, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d="M10 17 Q48 8 86 17" />
      <path d="M16 23 Q48 15.5 80 23" />
      <path d="M20 33 H76" />
      <path d="M25.5 23.5 L22.5 85" />
      <path d="M31.5 23.5 L29.5 85" />
      <path d="M70.5 23.5 L73.5 85" />
      <path d="M64.5 23.5 L66.5 85" />
      <path d="M45.5 33 V39" />
      <path d="M50.5 33 V39" />
      <rect x={42.5} y={39} width={11} height={14} rx={2} />
      <path d="M45.5 46 H50.5" />
      <path d="M16 91 Q23 85 30 91" />
      <path d="M37 91.5 Q48 84.5 59 91.5" />
      <path d="M66 91 Q73 85 80 91" />
    </svg>
  );
}

DragonGate.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

const ELEMENT_COLORS = {
  kim: "#B8B08D",
  metal: "#B8B08D",
  moc: "#4E7C4A",
  wood: "#4E7C4A",
  thuy: "#1F3A5F",
  water: "#1F3A5F",
  hoa: "#B23A2E",
  fire: "#B23A2E",
  tho: "#A98142",
  earth: "#A98142",
};

export function ElementDot({ element = "thuy", size = 12, className = "", ...rest }) {
  const hex = ELEMENT_COLORS[String(element).toLowerCase()] || "#8A7F70";
  const c = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <circle cx={c} cy={c} r={c - 1} fill={hex} />
      <circle cx={c} cy={c} r={c - 1} fill="none" stroke="rgba(33,27,22,.15)" strokeWidth={1} />
    </svg>
  );
}

ElementDot.propTypes = {
  element: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};

export function LotusMark({ size = 32, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d="M16 6.5 C13.6 9.8 13.2 14.6 16 19.2 C18.8 14.6 18.4 9.8 16 6.5 Z" />
      <path d="M9.8 11.8 C10.7 15.4 12.9 18.2 16 19.2 C14.8 15.4 12.6 12.9 9.8 11.8 Z" />
      <path d="M22.2 11.8 C21.3 15.4 19.1 18.2 16 19.2 C17.2 15.4 19.4 12.9 22.2 11.8 Z" />
      <path d="M5.2 16.2 C6.4 20.6 10.2 23 15 21.9 C12.2 19.3 8.7 17.2 5.2 16.2 Z" />
      <path d="M26.8 16.2 C25.6 20.6 21.8 23 17 21.9 C19.8 19.3 23.3 17.2 26.8 16.2 Z" />
      <path d="M6 25.2 Q16 29.4 26 25.2" />
      <path d="M10.5 27.6 Q16 29.8 21.5 27.6" />
    </svg>
  );
}

LotusMark.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

export default { SealStamp, WaveBand, CloudDivider, KoiSilhouette, DragonGate, ElementDot, LotusMark };
