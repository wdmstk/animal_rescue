import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emergency: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#ef4444",
          700: "#b91c1c"
        }
      }
    }
  },
  plugins: []
};

export default config;
