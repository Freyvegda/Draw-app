/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  "./app/**/*.{js,ts,jsx,tsx}",
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        // ... add others as needed
      },
    },
  },
  plugins: [],
}
