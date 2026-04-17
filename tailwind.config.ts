import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          container: "var(--primary-container)",
          fixed: "var(--primary-fixed)",
          "fixed-dim": "var(--primary-fixed-dim)",
        },
        "on-primary": "var(--on-primary)",
        secondary: {
          DEFAULT: "var(--secondary)",
          container: "var(--secondary-container)",
          fixed: "var(--secondary-fixed)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          fixed: "var(--tertiary-fixed)",
        },
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          "container-lowest": "var(--surface-container-lowest)",
          "container-low": "var(--surface-container-low)",
          container: "var(--surface-container)",
          bright: "var(--surface-bright)",
        },
        "on-surface": {
          DEFAULT: "var(--on-surface)",
          variant: "var(--on-surface-variant)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
      },
      boxShadow: {
        whisper: "var(--shadow-whisper)",
        soft: "var(--shadow-soft)",
      }
    },
  },
  plugins: [],
};

export default config;
