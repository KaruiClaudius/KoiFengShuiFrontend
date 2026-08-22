/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        "paper-2": "var(--color-paper-2)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        muted: "var(--color-muted)",
        crimson: {
          DEFAULT: "var(--color-crimson)",
          deep: "var(--color-crimson-deep)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          soft: "var(--color-gold-soft)",
        },
        jade: "var(--color-jade)",
        pond: "var(--color-pond)",
        kim: "var(--element-kim)",
        moc: "var(--element-moc)",
        thuy: "var(--element-thuy)",
        hoa: "var(--element-hoa)",
        tho: "var(--element-tho)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        plaque: "var(--shadow-plaque)",
        lift: "var(--shadow-lift)",
        gold: "var(--ring-gold)",
      },
      transitionTimingFunction: {
        water: "var(--ease-water)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "seal-in": {
          "0%": { opacity: "0", transform: "rotate(-10deg) scale(1.15)" },
          "100%": { opacity: "1", transform: "rotate(-4deg) scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "fade-rise": "fade-rise var(--dur-slow) var(--ease-water) both",
        "seal-in": "seal-in var(--dur-base) var(--ease-water) both",
      },
    },
  },
  plugins: [],
};
