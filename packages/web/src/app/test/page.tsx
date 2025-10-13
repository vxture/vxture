'use client';

import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Link from 'next/link';
import { SunIcon, MoonIcon, GlobeIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ThemeTestPage() {
  // 从Theme Store获取状态和方法
  const { theme, toggleTheme } = useThemeStore();
  // 从I18n Store获取状态和方法
  const { locale, setLocale, t } = useI18nStore();
  // 从Notification Store获取方法
  const { addNotification } = useNotificationStore();

  // 主题切换按钮点击事件（带通知反馈）
  const handleToggleTheme = () => {
    toggleTheme();
    addNotification(theme === 'light' ? t('common.themeDark') : t('common.themeLight'), 'success');
  };

  return (
    <div
      className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className='max-w-4xl mx-auto'>
        {/* 导航栏 */}
        <header className='mb-10 flex justify-between items-center'>
          <Link href='/' className='text-blue-500 hover:underline'>
            {t('common.backToHome')}
          </Link>
          <div className='flex items-center gap-4'>
            <span>{locale}</span>
            <span>{theme}</span>
          </div>
        </header>

        {/* 主题切换区 */}
        <section className='mb-10 p-6 border rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>{t('themeTest.pageTitle')}</h2>
          <button
            onClick={handleToggleTheme}
            className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded'
          >
            {theme === 'light' ? <MoonIcon className='w-5 h-5' /> : <SunIcon className='w-5 h-5' />}
            {t('themeTest.toggleThemeBtn')}
          </button>
        </section>

        {/* 语言切换区 */}
        <section className='mb-10 p-6 border rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>
            <GlobeIcon className='w-6 h-6 inline mr-2' />
            多语言测试
          </h2>
          <div className='flex gap-4'>
            <button
              onClick={() => setLocale('zh-CN')}
              className={`px-4 py-2 rounded ${locale === 'zh-CN' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              简体中文
            </button>
            <button
              onClick={() => setLocale('en-US')}
              className={`px-4 py-2 rounded ${locale === 'en-US' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
          </div>
        </section>

        {/* 通知测试按钮 */}
        <button
          onClick={() => addNotification('这是一条成功通知', 'success')}
          className='px-4 py-2 bg-green-500 text-white rounded'
        >
          {t('common.submit')}
        </button>
      </div>
    </div>
  );
}
