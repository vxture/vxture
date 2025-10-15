module.exports = {
  plugins: {
    // Map 'tailwindcss' key to the compatibility adapter function so Next/webpack
    // recognises the plugin and executes it correctly during build.
    tailwindcss: require('@tailwindcss/postcss')(),
    autoprefixer: {},
  },
};
