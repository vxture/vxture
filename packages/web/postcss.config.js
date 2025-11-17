/** @type {import('postcss').ProcessOptions} */
module.exports = {
  plugins: {
    // Tailwind CSS v4 PostCSS 插件
    '@tailwindcss/postcss': {},

    // PostCSS Import - 处理 @import 语句
    'postcss-import': {},

    // PostCSS Custom Properties - 处理 CSS 变量
    'postcss-custom-properties': {
      // 保留原始 CSS 变量（用于运行时主题切换）
      preserve: true,
    },

    // Autoprefixer - 自动添加浏览器前缀
    autoprefixer: {},
  },
};
