module.exports = {
  // Use explicit require form so PostCSS executes the plugin function.
  plugins: [require('@tailwindcss/postcss')(), require('autoprefixer')()],
};
