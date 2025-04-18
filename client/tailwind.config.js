/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#0a192f', // Very dark blue (almost black)
        'theme-bg-secondary': '#112240', // Dark blue
        'theme-primary': '#64ffda',    // Light teal/aqua (accent)
        'theme-secondary': '#8892b0',  // Light grayish blue (text/secondary elements)
        'theme-text-primary': '#ccd6f6', // Lightest blue/gray (main text)
        'theme-text-secondary': '#8892b0', // Same as theme-secondary (subtle text)
      },
    },
  },
  plugins: [],
}

