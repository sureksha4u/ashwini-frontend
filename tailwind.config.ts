import type { Config } from "tailwindcss";

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
        primary: "#1f89e5",
        "background-light": "#f6f7f8",
        "background-dark": "#0b1219",
        "surface-dark": "#16202a",
        "border-dark": "#2a3642",
        "navy-dark": "#0D1B2A",
        "dark-bg": "#111a21",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
