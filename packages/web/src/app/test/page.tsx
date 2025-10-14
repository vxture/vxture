/**
 * page.tsx
 *
 * 功能：
 * - 主题与多语言切换测试页面，演示全局状态管理与通知功能
 * - 支持主题切换、语言切换、通知提示等交互
 *
 * 用途：
 * - 作为测试页面，验证主题、国际化、通知等全局功能
 * - 结构与其它页面组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 useThemeStore、useI18nStore、useNotificationStore
 * - 被 app/test/layout.tsx 自动包裹
 *
 * 设计规范：
 * - 只负责页面内容与交互，不包含业务逻辑
 * - 命名、结构、注释与其它页面组件保持一致
 *
 * @file app/test/page.tsx
 * @desc 主题与多语言切换测试页面，演示全局状态与通知
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand, heroicons
 * @tags test, theme, i18n, notification, page
 * @example
 *   // 由 Next.js 自动路由，无需手动引入
 * @remarks
 *   仅负责页面内容与交互，业务逻辑请移至组件/服务层。
 * @todo
 *   支持更多全局状态与交互测试
 */
'use client';


import Link from 'next/link';
import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useNotificationStore } from '@/stores/notificationStore';
import React, { useState, useEffect } from 'react';
import {
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// 丰富内容：多语言内容映射（page2 迁移）
const testContent = {
  'zh-CN': {
    pageTitle: '主题与多语言测试',
    pageDescription: '此页面用于测试全局主题切换和多语言功能',
    themeSectionTitle: '主题测试',
    currentTheme: '当前主题',
    toggleThemeBtn: '切换主题',
    languageSectionTitle: '多语言测试',
    currentLanguage: '当前语言',
    textExample: '这是一段测试文本，用于展示多语言切换效果。',
    buttonExample: '测试按钮',
    cardTitle: '测试卡片',
    cardContent: '这个卡片组件会根据主题自动调整样式',
    formSectionTitle: '表单元素测试',
    inputPlaceholder: '请输入测试内容',
    checkboxLabel: '同意测试条款',
    radioOption1: '选项一',
    radioOption2: '选项二',
    backToHome: '返回首页',
    features: [
      '主题切换会更新所有元素的颜色',
      '多语言支持中英文切换',
      '状态会保存在本地存储中',
      '刷新页面后保持用户偏好设置',
    ],
  },
  'en-US': {
    pageTitle: 'Theme & Language Test',
    pageDescription:
      'This page is for testing global theme switching and multi-language functionality',
    themeSectionTitle: 'Theme Test',
    currentTheme: 'Current Theme',
    toggleThemeBtn: 'Toggle Theme',
    languageSectionTitle: 'Language Test',
    currentLanguage: 'Current Language',
    textExample: 'This is a test text to demonstrate language switching.',
    buttonExample: 'Test Button',
    cardTitle: 'Test Card',
    cardContent: 'This card component automatically adjusts styles based on the theme',
    formSectionTitle: 'Form Elements Test',
    inputPlaceholder: 'Please enter test content',
    checkboxLabel: 'Agree to test terms',
    radioOption1: 'Option 1',
    radioOption2: 'Option 2',
    backToHome: 'Back to Home',
    features: [
      'Theme switching updates colors for all elements',
      'Multi-language supports Chinese and English',
      'State is saved in local storage',
      'User preferences persist after page refresh',
    ],
  },
};


export default function ThemeTestPage() {
  // 全局状态
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale, t } = useI18nStore();
  const { addNotification } = useNotificationStore();

  // 丰富内容区状态
  const [inputValue, setInputValue] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState('option1');
  const [mounted, setMounted] = useState(false);
  // 主题/语言显示
  const ThemeIcon = theme === 'light' ? MoonIcon : SunIcon;
  const themeDisplayName = theme === 'light' ? '浅色模式' : '深色模式';
  const themeEnglishName = theme === 'light' ? 'Light Mode' : 'Dark Mode';
  // 当前内容
  const content = testContent[locale as keyof typeof testContent] || testContent['zh-CN'];

  useEffect(() => { setMounted(true); }, []);

  // 主题切换按钮点击事件（带通知反馈）
  const handleToggleTheme = () => {
    toggleTheme();
    addNotification(theme === 'light' ? t('common.themeDark') : t('common.themeLight'), 'success');
  };

  // 语言切换按钮点击事件（带通知反馈）
  const handleSetLocale = (targetLocale: string) => {
    if (locale !== targetLocale) {
      setLocale(targetLocale);
      addNotification(
        targetLocale === 'zh-CN' ? '已切换为简体中文' : 'Switched to English',
        'success'
      );
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {/* 导航栏 */}
      <header className='border-b border-color-border py-4'>
        <div className='container flex justify-between items-center'>
          <Link
            href="/"
            className="flex items-center text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>{content.backToHome}</span>
          </Link>
          <div className='flex items-center gap-4'>
            {/* 主题指示器 */}
            <div className='flex items-center gap-2'>
              <ThemeIcon className='w-5 h-5' />
              {mounted && (
                <span className='hidden sm:inline'>
                  {locale === 'zh-CN' ? themeDisplayName : themeEnglishName}
                </span>
              )}
            </div>
            {/* 语言指示器 */}
            <div className='flex items-center gap-2'>
              <GlobeAltIcon className='w-5 h-5' />
              {mounted && <span className='hidden sm:inline'>{locale}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className='flex-1 container py-8'>
        {/* 页面标题 */}
        <div className='mb-12 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4 text-text-primary'>
            {content.pageTitle}
          </h1>
          <p className='text-text-secondary max-w-2xl mx-auto'>{content.pageDescription}</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
          {/* 主题测试区域 */}
          <section className='card'>
            <h2 className='text-2xl font-semibold mb-6 flex items-center text-text-primary'>
              <ThemeIcon className='w-6 h-6 mr-2' />
              {content.themeSectionTitle}
            </h2>
            <div className='space-y-6'>
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-secondary mb-2'>{content.currentTheme}:</p>
                <p className='text-xl font-medium text-text-primary'>
                  {locale === 'zh-CN' ? themeDisplayName : themeEnglishName}
                </p>
              </div>
              <button
                onClick={handleToggleTheme}
                className='btn flex items-center justify-center gap-2 w-full'
              >
                <ThemeIcon className='w-5 h-5' />
                {content.toggleThemeBtn}
              </button>
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <h3 className='font-medium mb-2 text-text-primary'>主题特性:</h3>
                <ul className='space-y-2 text-text-secondary'>
                  {content.features.map((feature: string, index: number) => (
                    <li key={index} className='flex items-start'>
                      <CheckIcon className='w-5 h-5 mr-2 text-primary shrink-0 mt-0.5' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 多语言测试区域 */}
          <section className='card'>
            <h2 className='text-2xl font-semibold mb-6 flex items-center text-text-primary'>
              <GlobeAltIcon className='w-6 h-6 mr-2' />
              {content.languageSectionTitle}
            </h2>
            <div className='space-y-6'>
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-secondary mb-2'>{content.currentLanguage}:</p>
                <p className='text-xl font-medium text-text-primary'>
                  {locale === 'zh-CN' ? '简体中文' : 'English'}
                </p>
              </div>
              <div className='flex gap-4'>
                <button
                  onClick={() => handleSetLocale('zh-CN')}
                  className={`btn flex-1 ${locale === 'zh-CN' ? 'opacity-100' : 'opacity-70'}`}
                >
                  简体中文
                </button>
                <button
                  onClick={() => handleSetLocale('en-US')}
                  className={`btn flex-1 ${locale === 'en-US' ? 'opacity-100' : 'opacity-70'}`}
                >
                  English
                </button>
              </div>
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-primary'>{content.textExample}</p>
              </div>
            </div>
          </section>
        </div>

        {/* 元素样式测试区域 */}
        <section className='card mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-text-primary'>
            {content.formSectionTitle}
          </h2>
          <div className='space-y-6'>
            <div>
              <label className='block text-text-secondary mb-2'>{content.inputPlaceholder}</label>
              <input
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={content.inputPlaceholder}
                className='w-full p-2 border border-color-border rounded-md bg-color-page-bg text-text-primary'
              />
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='terms'
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className='mr-2 accent-primary'
              />
              <label htmlFor='terms' className='text-text-secondary'>
                {content.checkboxLabel}
              </label>
            </div>
            <div>
              <div className='flex items-center mb-2'>
                <input
                  type='radio'
                  id='option1'
                  name='options'
                  value='option1'
                  checked={selectedOption === 'option1'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className='mr-2 accent-primary'
                />
                <label htmlFor='option1' className='text-text-secondary mr-6'>
                  {content.radioOption1}
                </label>
                <input
                  type='radio'
                  id='option2'
                  name='options'
                  value='option2'
                  checked={selectedOption === 'option2'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className='mr-2 accent-primary'
                />
                <label htmlFor='option2' className='text-text-secondary'>
                  {content.radioOption2}
                </label>
              </div>
            </div>
            <button className='btn'>{content.buttonExample}</button>
          </div>
        </section>

        {/* 卡片组件测试 */}
        <section className='card'>
          <div className='flex flex-col items-center text-center p-8'>
            <h3 className='text-xl font-semibold mb-4 text-text-primary'>{content.cardTitle}</h3>
            <p className='text-text-secondary max-w-md mb-6'>{content.cardContent}</p>
            <div className='flex gap-2'>
              <div className='w-3 h-3 rounded-full bg-color-text-primary'></div>
              <div className='w-3 h-3 rounded-full bg-color-text-secondary'></div>
              <div className='w-3 h-3 rounded-full bg-color-border'></div>
              <div className='w-3 h-3 rounded-full bg-color-primary'></div>
            </div>
          </div>
        </section>

        {/* 通知测试按钮（保留原功能） */}
        <div className='mt-8 flex justify-center'>
          {mounted && (
            <button
              onClick={() => addNotification('这是一条成功通知', 'success')}
              className='px-4 py-2 bg-green-500 text-white rounded inline-flex items-center'
              aria-label={t('common.submit')}
            >
              <CheckIcon className='w-5 h-5 mr-2' aria-hidden='true' />
              {t('common.submit')}
            </button>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className='border-t border-color-border py-6 mt-12'>
        <div className='container text-center text-text-secondary text-sm'>
          <p>主题与多语言测试页面 © {new Date().getFullYear()}</p>
          <p className='mt-1'>
            当前主题: {theme} | 当前语言: {locale}
          </p>
        </div>
      </footer>
    </div>
  );
}
