module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-custom-properties': {
      preserve: false, // 处理CSS变量
    },
    'tailwindcss': {},
    'autoprefixer': {},
  },
}