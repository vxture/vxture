/**
 * Header.tsx - 网站全局顶部导航栏
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局导航栏 UI
 * - 使用 src/data/header.data.ts 获取结构数据
 * - 使用 next-intl 进行翻译
 *
 * @layer Presentation
 * @category Components - Layout
 * @author AI-Generated
 * @date 2026-03-18
 */
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import FullscreenSwitcher from '@/components/ui/FullscreenSwitcher';
import DensitySwitcher from '@/components/ui/DensitySwitcher';
import PreferencesPanel from '@/components/ui/PreferencesPanel';
import { HEADER_DATA } from '@/data/layout/header.data';

/**
 * Header 组件
 *
 * 主题颜色说明：
 * - Light 模式：背景为浅蓝色，文字统一用 text-gray-800（主）/ text-gray-600（次），
 *   与其他 section 保持一致；滚动前后颜色不变
 * - Dark 模式：背景为深灰色，文字统一用 dark:text-slate-200（主）/ dark:text-slate-300（次），
 *   与其他 section 保持一致
 * - 不使用 useTheme() 做 className 拼接，避免 SSR hydration mismatch
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('layout.header');

  // ----------------------------------------------------------------------------
  // 监听滚动
  // ----------------------------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ----------------------------------------------------------------------------
  // 渲染
  // ----------------------------------------------------------------------------

  // 禁止渲染：如果内容被禁用，不渲染
  if (!HEADER_DATA.enabled) {
    return null;
  }

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-blue-50/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='shrink-0 flex items-center space-x-2'>
            <Image
              src={HEADER_DATA.logo.image}
              alt={t(HEADER_DATA.logo.altKey)}
              width={24}
              height={24}
              className='object-contain'
            />
            <h1 className='text-2xl font-bold text-gray-800 dark:text-slate-200'>
              {t(HEADER_DATA.logo.labelKey)}
            </h1>
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {HEADER_DATA.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
              className='transition-colors duration-300 text-gray-800 dark:text-slate-200 font-medium hover:text-cyan-500 dark:hover:text-cyan-400'
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>

          {/* 工具栏：主题 / 语言 / 全屏(pseudo) / 全屏(native) / 密度 / CTA / 偏好设置 */}
          <div className='flex space-x-4 items-center'>

            {/* 主题切换 */}
            <ThemeSwitcher
              size='medium'
              className='text-gray-600 dark:text-yellow-400'
            />

            {/* 语言切换 */}
            {HEADER_DATA.language.enabled && (
              <LocaleSwitcher
                size='medium'
                className='text-gray-600 dark:text-slate-300'
              />
            )}

            {/* 全屏切换 — pseudo 模式（工作区全屏，CSS 模拟） */}
            <FullscreenSwitcher
              mode='pseudo'
              size='medium'
              className='text-gray-600 dark:text-slate-300'
            />

            {/* 全屏切换 — native 模式（调用浏览器原生全屏 API） */}
            <FullscreenSwitcher
              targetId='page-root-native'
              mode='native'
              size='medium'
              className='text-gray-600 dark:text-slate-300'
            />

            {/* 密度切换：compact / default / comfortable 循环 */}
            <DensitySwitcher
              size='medium'
              className='text-gray-600 dark:text-slate-300'
            />

            {/* 偏好设置面板（整合所有设置） */}
            <PreferencesPanel
              isLoggedIn={false}
              size='medium'
              className='text-gray-600 dark:text-slate-300'
            />

            {/* CTA Buttons - 固定宽度 */}
            {HEADER_DATA.actions.length > 0 && (
              <>
                {HEADER_DATA.actions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className={
                      action.variant === 'secondary'
                        ? 'w-20 px-4 py-2 rounded-lg transition-all duration-300 text-center text-gray-700 dark:text-slate-200 font-semibold hover:text-gray-900 dark:hover:text-white'
                        : 'w-28 px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center'
                    }
                  >
                    {t(action.labelKey)}
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
