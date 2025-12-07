// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duke-blue': '#012169',
        'duke-royal': '#00539B',
        'duke-sky': '#6DAEDB',
        'duke-light': '#A3CEF1',
        'duke-slate': '#274472',
      },
      fontFamily: {
        arc: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
        cursive: ['Pinyon Script']

      },
      
    },
  },
  plugins: [],
};
