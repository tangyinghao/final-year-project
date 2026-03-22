/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B1C62',
        destructive: '#D71440',
        muted: '#F6F6F6',
      }
    },
  },
  plugins: [],
}
