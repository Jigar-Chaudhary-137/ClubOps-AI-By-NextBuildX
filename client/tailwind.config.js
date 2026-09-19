/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0B1020",
          secondary: "#111827",
          card: "#151D2E",
        },
        border: {
          subtle: "#263247",
        },
        accent: {
          primary: "#6366F1",
          ai: "#8B5CF6",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        }
      }
    },
  },
  plugins: [],
}
