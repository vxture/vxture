/** @type {import('tailwindcss').Config} */
module.exports = {
  // 启用暗模式(可选)
  darkMode: 'class',
  
  // 指定要处理的文件
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // 整合设计系统
  theme: {
    extend: {
      // 从CSS变量引用颜色(这将与SCSS变量桥接)
      colors: {
        'primary': 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        // 添加更多颜色...
      },
      
      // 其他设计令牌
      spacing: {
        // 自定义间距
      },
      fontSize: {
        // 自定义字体大小
      },
      borderRadius: {
        // 自定义圆角
      },
      // 添加其他自定义主题设置...
    },
  },
  
  // 可选插件
  plugins: [],
}