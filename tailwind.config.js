/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all HTML and JS files for class usage so unused styles are purged.
  content: [
    "./frontend/**/*.html",
    "./frontend/static/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Brand tokens matching CSS variables in index.html
        'brand-bg':      '#020617',
        'brand-card':    '#0f172a',
        'brand-border':  '#334155',
        'brand-fuchsia': '#d946ef',
        'brand-indigo':  '#6366f1',
      },
    },
  },
  plugins: [],
};
