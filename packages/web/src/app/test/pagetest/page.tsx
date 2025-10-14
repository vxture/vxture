'use client';
import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';

export default function ThemeLanguageTestPage() {
  // 仅依赖全局状态，不提供任何切换操作
  const { theme } = useThemeStore();
  const { locale } = useI18nStore();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className='text-3xl font-bold mb-6'>Page2 - 简化演示</h1>
      <div className='mb-4'>当前主题：{theme === 'dark' ? '深色' : '浅色'} | 当前语言：{locale}</div>
      <div className='text-lg'>
        {locale === 'zh-CN'
          ? '你好，欢迎体验主题和语言联动！'
          : 'Hello, enjoy theme & language sync!'}
      </div>
    </div>
  );
}
