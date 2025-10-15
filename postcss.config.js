// Root PostCSS config — keep consistent with packages/web to avoid loader shape mismatch.
module.exports = {
  plugins: [require('@tailwindcss/postcss')(), require('autoprefixer')()],
};
