/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        parseye: {
          "primary": "#4f46e5",
          "secondary": "#6366f1",
          "accent": "#10b981",
          "neutral": "#1e293b",
          "base-100": "#020617",
          "base-200": "#0f172a",
          "base-300": "#1e293b",
          "info": "#38bdf8",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}

