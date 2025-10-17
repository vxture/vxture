// Tailwind CSS v4 requires the new PostCSS plugin package
// See: https://tailwindcss.com/docs/installation/postcss
module.exports = {
  plugins: [
    require('postcss-import')(), // 关键：处理 CSS 中的 @import 语句（必须放在最前面）
    require('@tailwindcss/postcss')(),
    require('autoprefixer')(),
    // Note: Next.js already handles CSS minification in production.
    // If you want extra processing, add cssnano here (ensure it's installed):
    // ...(process.env.NODE_ENV === 'production' ? [require('cssnano')({ preset: 'default' })] : []),
  ],
};
