/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EFEAE0",
        surface: "#FBF9F4",
        ink: {
          DEFAULT: "#26302A",
          soft: "#6B7268",
          faint: "#9B9F92",
        },
        brass: {
          DEFAULT: "#A97C3F",
          light: "#C9A46E",
          dark: "#8A6432",
        },
        teal: {
          DEFAULT: "#2B5C5E",
          light: "#3F7A7C",
          dark: "#1D4143",
        },
        rust: {
          DEFAULT: "#A2463A",
          light: "#C1655A",
        },
        sage: {
          DEFAULT: "#5C7A54",
          light: "#7C9A72",
        },
        line: "#DAD3C4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(38, 48, 42, 0.06), 0 4px 10px rgba(38, 48, 42, 0.06)",
        cardHover: "0 2px 4px rgba(38, 48, 42, 0.08), 0 10px 24px rgba(38, 48, 42, 0.10)",
      },
      borderRadius: {
        card: "3px",
      },
    },
  },
  plugins: [],
}

