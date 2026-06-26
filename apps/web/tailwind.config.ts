import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          600: "#0369a1",
          700: "#075985",
          900: "#0c2d48"
        }
      }
    }
  },
  plugins: []
};

export default config;
