/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "ntu-primary": "#1B1C62",
        danger: "#D71440",
        "surface-base": "#FFFFFF",
        "surface-muted": "#F6F6F6",
        "surface-alt": "#F2F2F7",
        "surface-info": "#EBF4FE",
        "surface-featured": "#DFF0FF",
        "surface-success": "#E6F9EC",
        "surface-warning": "#FFF3E0",
        "text-primary": "#000000",
        "text-secondary": "#666666",
        "text-muted": "#8E8E93",
        "text-strong-secondary": "#4A4A4A",
        "border-default": "#E5E5EA",
        "border-info": "#D0E6FC",
        "icon-disabled": "#C7C7CC",
        "status-success": "#24A148",
        "status-warning": "#F57C00",
        "status-error": "#F87171",
        "accent-saved": "#FFD700",
      },
    },
  },
  plugins: [],
}
