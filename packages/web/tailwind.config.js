/** @type {import('tailwindcss').Config} */

// 安全加载可选插件，未安装则忽略
function safeRequire(name) {
  try {
    return require(name);
  } catch (_) {
    return null;
  }
}

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 新主题颜色系统映射 (Theme Color System Mapping)
        theme: {
          // 基础颜色系统
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          tertiary: 'var(--color-tertiary)',
          quaternary: 'var(--color-quaternary)',

          // 表面颜色系统
          surface: 'var(--color-surface)',
          background: 'var(--color-background)',

          // 对比文本系统
          'on-primary': 'var(--color-on-primary)',
          'on-secondary': 'var(--color-on-secondary)',
          'on-surface': 'var(--color-on-surface)',
          'on-background': 'var(--color-on-background)',

          // 边框轮廓系统
          border: 'var(--color-border)',
          outline: 'var(--color-outline)',

          // 语义化颜色
          text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
          },

          // 兼容性映射 (Legacy Compatibility)
          page: 'var(--color-page-bg)',
          card: 'var(--color-card-bg)',
          'primary-hover': 'var(--color-primary-hover)',
        },

        // 直接颜色映射以支持 bg-theme-* 类名 (Direct Color Mapping)
        'theme-primary': 'var(--color-primary)',
        'theme-secondary': 'var(--color-secondary)',
        'theme-tertiary': 'var(--color-tertiary)',
        'theme-quaternary': 'var(--color-quaternary)',
        'theme-surface': 'var(--color-surface)',
        'theme-background': 'var(--color-background)',
        'theme-on-primary': 'var(--color-on-primary)',
        'theme-on-secondary': 'var(--color-on-secondary)',
        'theme-on-surface': 'var(--color-on-surface)',
        'theme-on-background': 'var(--color-on-background)',
        'theme-border': 'var(--color-border)',
        'theme-outline': 'var(--color-outline)',
        'theme-text-primary': 'var(--color-text-primary)',
        'theme-text-secondary': 'var(--color-text-secondary)',

        // 兼容性映射
        'theme-page': 'var(--color-page-bg)',
        'theme-card': 'var(--color-card-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      maxWidth: {
        container: '80rem',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      // 设计系统：间距（支持通过 CSS 变量覆盖）
      spacing: {
        px: 'var(--space-px, 1px)',
        0: 'var(--space-0, 0rem)',
        0.5: 'var(--space-0_5, 0.125rem)',
        1: 'var(--space-1, 0.25rem)',
        1.5: 'var(--space-1_5, 0.375rem)',
        2: 'var(--space-2, 0.5rem)',
        2.5: 'var(--space-2_5, 0.625rem)',
        3: 'var(--space-3, 0.75rem)',
        3.5: 'var(--space-3_5, 0.875rem)',
        4: 'var(--space-4, 1rem)',
        5: 'var(--space-5, 1.25rem)',
        6: 'var(--space-6, 1.5rem)',
        8: 'var(--space-8, 2rem)',
        10: 'var(--space-10, 2.5rem)',
        12: 'var(--space-12, 3rem)',
        16: 'var(--space-16, 4rem)',
        20: 'var(--space-20, 5rem)',
        24: 'var(--space-24, 6rem)',
        18: 'var(--space-18, 4.5rem)',
        88: 'var(--space-88, 22rem)',
        128: 'var(--space-128, 32rem)',
      },
      // 设计系统：圆角
      borderRadius: {
        none: 'var(--radius-none, 0)',
        sm: 'var(--radius-sm, 0.125rem)',
        DEFAULT: 'var(--radius, 0.25rem)',
        md: 'var(--radius-md, 0.375rem)',
        lg: 'var(--radius-lg, 0.5rem)',
        xl: 'var(--radius-xl, 0.75rem)',
        '2xl': 'var(--radius-2xl, 1rem)',
        '3xl': 'var(--radius-3xl, 1.5rem)',
        full: 'var(--radius-full, 9999px)',
        '4xl': '2rem',
      },
      // 设计系统：阴影
      boxShadow: {
        sm: 'var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        DEFAULT: 'var(--shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1))',
        md: 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))',
        lg: 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))',
        xl: 'var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1))',
        '2xl': 'var(--shadow-2xl, 0 25px 50px -12px rgb(0 0 0 / 0.25))',
        theme:
          'var(--shadow-theme, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06))',
        'theme-md':
          'var(--shadow-theme-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
        'theme-lg':
          'var(--shadow-theme-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
        'theme-xl':
          'var(--shadow-theme-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-gentle': 'pulse-gentle 2s infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(1rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-1rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // 官方/第三方插件（按需安装）。未安装的通过 safeRequire 忽略。
    safeRequire('@tailwindcss/forms'),
    safeRequire('@tailwindcss/aspect-ratio'),
    safeRequire('@tailwindcss/container-queries'),
    safeRequire('tailwindcss-animate'),
  ].filter(Boolean),
};
