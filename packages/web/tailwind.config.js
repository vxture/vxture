/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 明确定义 maxWidth 的 7xl，以确保 `max-w-7xl` 可用（避免 @apply unknown 报错）
      maxWidth: {
        '7xl': '80rem',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      keyframes: {
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(2rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-from-bottom-8': 'slide-in-from-bottom 0.7s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  plugins: [require('tailwindcss-animate')],
  // Safelist 用于确保运行时或通过 JS 字符串拼接引用的工具类被生成
  // 使用正则模式可覆盖背景、内边距以及常见的 max-width 工具类
  safelist: [
    { pattern: /^bg-(blue|cyan|purple|primary)(-(100|500|600|700))?$/ },
    { pattern: /^max-w-/ },
    { pattern: /^px-/ },
    { pattern: /^sm:px-/ },
    { pattern: /^lg:px-/ },
    'mx-auto',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    'max-w-7xl',
    'xl:max-w-screen-2xl',
  ],
};
