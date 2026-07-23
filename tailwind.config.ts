import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)"
        },
        surface: {
          card: "var(--color-surface-card)",
          border: "var(--color-surface-border)",
          input: "var(--color-surface-input)",
          overlay: "var(--color-surface-overlay)"
        },
        semantic: {
          success: "var(--color-semantic-success)",
          warning: "var(--color-semantic-warning)",
          error: "var(--color-semantic-error)",
          info: "var(--color-semantic-info)"
        },
        emergency: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#ef4444",
          700: "#b91c1c"
        }
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)"
      },
      zIndex: {
        modal: "1000",
        toast: "1100",
        tooltip: "1200"
      }
    }
  },
  plugins: []
};

export default config;
