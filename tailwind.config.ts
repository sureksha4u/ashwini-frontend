import type { Config } from "tailwindcss";

// Tokens are CSS variables in globals.css; we only expose semantic names here.
// Use bg-page / surface-1 / accent / etc. in components — never raw hex.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        "surface-1": "var(--bg-surface-1)",
        "surface-2": "var(--bg-surface-2)",
        "surface-3": "var(--bg-surface-3)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        "accent-border": "var(--accent-border)",
        success: "var(--success)",
        "success-soft": "var(--success-soft)",
        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        info: "var(--info)",
        "info-soft": "var(--info-soft)",

        // legacy aliases — kept so older components still compile while we
        // migrate them screen-by-screen. Remove once nothing references them.
        primary: "#2563EB",
        "background-light": "var(--bg-page)",
        "background-dark": "#0B1120",
        "surface-dark": "#131A2C",
        "border-dark": "#1F2A44",
        "navy-dark": "#0B1120",
        "dark-bg": "#0B1120",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)",
        "soft-hover": "0 4px 12px rgba(15,23,42,.08)",
        modal: "0 24px 48px rgba(15,23,42,.18)",
      },
    },
  },
  plugins: [],
};

export default config;
