module.exports = {
  plugins: {
    // Tailwind v4 moved the PostCSS plugin into a separate package.
    // Use the compatibility wrapper so PostCSS can load Tailwind correctly.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
