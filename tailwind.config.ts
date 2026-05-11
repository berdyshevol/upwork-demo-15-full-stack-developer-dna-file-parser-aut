import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fbf6",
          100: "#dbf5e7",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
        ink: {
          900: "#0b1220",
          700: "#374151",
          500: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};
export default config;
