import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        navy: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        },
        neon: {
          green: "#4ade80",
          purple: "#c084fc",
          blue: "#3b82f6",
          pink: "#ec4899",
        },
      },
      backgroundColor: {
        gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)",
        glass: "rgba(255, 255, 255, 0.05)",
        "glass-light": "rgba(255, 255, 255, 0.1)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        glass: "12px",
        premium: "16px",
      },
      textColor: {
        glass: "rgba(255, 255, 255, 0.9)",
        "glass-secondary": "rgba(255, 255, 255, 0.7)",
      },
    },
  },
  plugins: [],
};
export default config;

