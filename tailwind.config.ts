import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06040c",
        void: "#0c0816",
        plum: "#160f26",
        violet: { deep: "#3a1d70", DEFAULT: "#5b2bb5" },
        electric: "#8f45ff",
        silver: "#c8cbd6",
        lavender: "#b7a6e6",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-arabic)", "serif"],
        sans: ["var(--font-body)", "var(--font-arabic)", "system-ui", "sans-serif"],
      },
      boxShadow: { glow: "0 0 60px -12px rgba(143,69,255,.55)" },
    },
  },
  plugins: [],
};
export default config;
