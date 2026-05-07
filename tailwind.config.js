/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,md,html,js}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        background: "#faf9f7",
        surface: "#f4f2ef",
        "text-primary": "#1c1917",
        "text-muted": "#78716c",
        accent: "#6b8f71",
        "accent-hover": "#4d6b53",
        border: "#e5e0d8",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
