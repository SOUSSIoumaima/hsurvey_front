/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // if you use any external components outside src, add here
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1266f1', // your template blue for buttons or links
        secondary: '#ff6600', // example accent orange
        // add custom grays if you want
        grayLight: '#f5f5f5',
        grayDark: '#333333',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
      },
      fontFamily: {
        // Example, customize if you want
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
