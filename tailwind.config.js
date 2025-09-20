/** @type {import('tailwindcss').Config} */
module.exports = {
  // 启用 JIT 模式
  mode: 'jit',

  // 启用暗模式(可选)
  darkMode: 'class',

  // 指定要处理的文件
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  // 整合设计系统
  theme: {
    extend: {
      // 从CSS变量引用颜色(这将与SCSS变量桥接)
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        // 添加更多颜色...
      },

      // 自定义间距
      spacing: {
        // 自定义间距值
      },

      // 自定义字体大小
      fontSize: {
        // 自定义字体大小
      },

      // 自定义圆角
      borderRadius: {
        // 自定义圆角
      },

      // 添加自定义过渡时间
      transitionDuration: {
        2000: '2000ms',
      },

      // 添加更多自定义主题设置...
    },
  },

  // 优化 variants 配置
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled', 'hover'],
      backgroundColor: ['active', 'group-hover'],
      textColor: ['active', 'group-hover'],
      transform: ['hover', 'focus'],
    },
  },

  // 可选插件
  plugins: [],
};
