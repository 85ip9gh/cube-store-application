/* 
--text: #061c09;
--background: #f1fcf2;
--primary: #3bd748;
--secondary: #84dde6;
--accent: #65ace0; 
*/


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#061c09',
        background: '#f1fcf2',
        primary: '#3bd748',
        secondary: '#84dde6',
        accent: '#65ace0',
      },
    },
  },
  plugins: [],
}

