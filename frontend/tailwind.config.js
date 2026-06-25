/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff5f2",
          100: "#ffe8e0",
          200: "#ffd2c2",
          300: "#ffb199",
          400: "#ff8461",
          500: "#ff6b35",
          600: "#e65520",
          700: "#bf4013",
          800: "#9e330e",
          900: "#822c0e",
          950: "#471304",
        },
        accent: {
          400: "#ffb94d",
          500: "#ff9f1c",
          600: "#e68510",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
        easy:   "#00b8a3",
        medium: "#ffc01e",
        hard:   "#ff375f",
        surface: {
          DEFAULT: "#181925",
          50:  "#fff5f2",
          100: "#ffe8e0",
          700: "#212330",
          800: "#1e202b",
          900: "#181925",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%)",
        "gradient-dark":  "linear-gradient(135deg, #181925 0%, #212330 100%)",
        "gradient-card":  "linear-gradient(135deg, rgba(255,107,53,0.04) 0%, rgba(255,159,28,0.04) 100%)",
      },
      boxShadow: {
        card:  "0 4px 24px rgba(43, 45, 66, 0.06)",
        glow:  "0 0 40px rgba(255, 107, 53, 0.15)",
        "glow-sm": "0 0 20px rgba(255, 107, 53, 0.1)",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer:      "shimmer 1.8s infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
