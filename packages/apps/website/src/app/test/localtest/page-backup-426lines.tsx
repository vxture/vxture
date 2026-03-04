/**
 * @file page.tsx
 * @desc 主题与多语言测试页面（Test Page），用于测试和展示全局主题切换、多语言功能的效果。
 * 负责：
 *    1. 提供主题切换测试界面（浅色/深色模式切换）;
 *    2. 提供多语言切换测试（中文/英文切换）;
 *    3. 展示各种 UI 组件在不同主题和语言下的表现。
 * @component 标记为 React 组件（Next.js 页面组件）
 *
 * @version 1.0.0
 * @since 1.0.0 （从该版本开始作为测试页面使用）
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 *
 * @dependencies
 *   - React 19.2：组件基础、useState、useEffect
 *   - Next.js 15.5.6：页面路由、Link 组件
 *   - Heroicons：UI 图标组件
 *   - Zustand 5.0.8：全局状态管理（主题、语言、通知）
 * @see @/stores/themeStore：主题状态管理
 * @see @/stores/i18nStore：多语言状态管理
 * @see @/stores/notificationStore：通知系统状态管理
 *
 * @tags test-page, theme-test, i18n-test, ui-components
 *
 * @example
 *   // 访问路径：/test
 *   // 功能：
 *   // - 切换主题并实时预览效果
 *   // - 切换语言并查看文本变化
 *   // - 测试各种表单元素的主题适配
 *
 * @remarks
 *   - 使用 'use client' 指令，运行在客户端
 *   - 包含丰富的交互元素用于测试主题和语言切换
 *   - 状态变化会触发全局通知反馈
 *   - 支持响应式设计，适配不同屏幕尺寸
 *
 * @todo
 *   - 添加更多 UI 组件的测试样例
 *   - 增加主题动画过渡效果测试
 *   - 补充无障碍访问性测试功能
 *   - 添加深色模式下的图片适配测试
 */

'use client';

// ==============================================================================
// 依赖导入 & 配置
// ==============================================================================

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

// ==============================================================================
// 静态数据配置
// ==============================================================================

// ------------------------------------------------------------------------------
// 多语言内容映射
// ------------------------------------------------------------------------------

/**
 * testContent - 测试页面多语言内容配置
 * 包含页面所有文本的中英文对照
 */
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

// ==============================================================================
// 主组件
// ==============================================================================

/**
 * ThemeTestPage - 主题与多语言测试页面组件
 * 提供完整的主题和语言切换测试界面
 * @returns JSX.Element 测试页面组件
 */
export default function ThemeTestPage() {
  // ----------------------------------------------------------------------------
  // 状态管理 & Hook
  // ----------------------------------------------------------------------------

  // 全局状态
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale, t } = useI18nStore();
  const { addNotification } = useNotificationStore();

  // 本地状态 - 表单元素测试
  const [inputValue, setInputValue] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState('option1');
  const [mounted, setMounted] = useState(false);

  // ----------------------------------------------------------------------------
  // 计算属性 & 派生状态
  // ----------------------------------------------------------------------------

  // 主题相关显示
  const ThemeIcon = theme === 'light' ? MoonIcon : SunIcon;
  const themeDisplayName = theme === 'light' ? '浅色模式' : '深色模式';
  const themeEnglishName = theme === 'light' ? 'Light Mode' : 'Dark Mode';

  // 当前语言内容
  const content = testContent[locale as keyof typeof testContent] || testContent['zh-CN'];

  // ----------------------------------------------------------------------------
  // 生命周期 & 副作用
  // ----------------------------------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // ----------------------------------------------------------------------------
  // 事件处理函数
  // ----------------------------------------------------------------------------

  /**
   * handleToggleTheme - 主题切换处理函数
   * 切换主题并显示通知反馈
   */
  const handleToggleTheme = () => {
    toggleTheme();
    addNotification(theme === 'light' ? t('common.themeDark') : t('common.themeLight'), 'success');
  };

  /**
   * handleSetLocale - 语言切换处理函数
   * 设置新语言并显示通知反馈
   * @param targetLocale 目标语言代码
   */
  const handleSetLocale = (targetLocale: string) => {
    if (locale !== targetLocale) {
      setLocale(targetLocale);
      addNotification(
        targetLocale === 'zh-CN' ? '已切换为简体中文' : 'Switched to English',
        'success'
      );
    }
  };

  // ----------------------------------------------------------------------------
  // 渲染函数
  // ----------------------------------------------------------------------------

  return (
    <div className='min-h-screen flex flex-col'>
      {/* =============================================================================
          页面头部 - 导航栏
          ============================================================================== */}
      <header className='border-b border-color-border py-4'>
        <div className='container flex justify-between items-center'>
          {/* 返回首页链接 */}
          <Link
            href='/'
            className='flex items-center text-primary hover:text-primary-hover transition-colors'
          >
            <ArrowLeftIcon className='w-5 h-5 mr-2' />
            <span>{content.backToHome}</span>
          </Link>

          {/* 状态指示器 */}
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

      {/* =============================================================================
          主要内容区域
          ============================================================================== */}
      <main className='flex-1 container py-8'>
        {/* ----------------------------------------------------------------------------
            页面标题区域
            ------------------------------------------------------------------------------ */}
        <div className='mb-12 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4 text-text-primary'>
            {content.pageTitle}
          </h1>
          <p className='text-text-secondary max-w-2xl mx-auto'>{content.pageDescription}</p>
        </div>

        {/* ----------------------------------------------------------------------------
            功能测试区域 - 主题 & 语言
            ------------------------------------------------------------------------------ */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
          {/* 主题测试模块 */}
          <section className='card'>
            <h2 className='text-2xl font-semibold mb-6 flex items-center text-text-primary'>
              <ThemeIcon className='w-6 h-6 mr-2' />
              {content.themeSectionTitle}
            </h2>
            <div className='space-y-6'>
              {/* 当前主题显示 */}
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-secondary mb-2'>{content.currentTheme}:</p>
                <p className='text-xl font-medium text-text-primary'>
                  {locale === 'zh-CN' ? themeDisplayName : themeEnglishName}
                </p>
              </div>

              {/* 主题切换按钮 */}
              <button
                onClick={handleToggleTheme}
                className='btn flex items-center justify-center gap-2 w-full'
              >
                <ThemeIcon className='w-5 h-5' />
                {content.toggleThemeBtn}
              </button>

              {/* 主题特性说明 */}
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

          {/* 多语言测试模块 */}
          <section className='card'>
            <h2 className='text-2xl font-semibold mb-6 flex items-center text-text-primary'>
              <GlobeAltIcon className='w-6 h-6 mr-2' />
              {content.languageSectionTitle}
            </h2>
            <div className='space-y-6'>
              {/* 当前语言显示 */}
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-secondary mb-2'>{content.currentLanguage}:</p>
                <p className='text-xl font-medium text-text-primary'>
                  {locale === 'zh-CN' ? '简体中文' : 'English'}
                </p>
              </div>

              {/* 语言切换按钮组 */}
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

              {/* 语言效果演示 */}
              <div className='p-4 bg-color-card-bg rounded-lg border border-color-border'>
                <p className='text-text-primary'>{content.textExample}</p>
              </div>
            </div>
          </section>
        </div>

        {/* ----------------------------------------------------------------------------
            表单元素测试区域
            ------------------------------------------------------------------------------ */}
        <section className='card mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-text-primary'>
            {content.formSectionTitle}
          </h2>
          <div className='space-y-6'>
            {/* 文本输入框测试 */}
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

            {/* 复选框测试 */}
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

            {/* 单选按钮测试 */}
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

            {/* 测试按钮 */}
            <button className='btn'>{content.buttonExample}</button>
          </div>
        </section>

        {/* ----------------------------------------------------------------------------
            UI 组件演示区域
            ------------------------------------------------------------------------------ */}

        {/* 卡片组件测试 */}
        <section className='card'>
          <div className='flex flex-col items-center text-center p-8'>
            <h3 className='text-xl font-semibold mb-4 text-text-primary'>{content.cardTitle}</h3>
            <p className='text-text-secondary max-w-md mb-6'>{content.cardContent}</p>

            {/* 颜色指示器 */}
            <div className='flex gap-2'>
              <div className='w-3 h-3 rounded-full bg-color-text-primary'></div>
              <div className='w-3 h-3 rounded-full bg-color-text-secondary'></div>
              <div className='w-3 h-3 rounded-full bg-color-border'></div>
              <div className='w-3 h-3 rounded-full bg-color-primary'></div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------------
            通知系统测试
            ------------------------------------------------------------------------------ */}
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

      {/* =============================================================================
          页面底部 - 状态信息
          ============================================================================== */}
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
