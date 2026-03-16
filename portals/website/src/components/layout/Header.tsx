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
 */
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useThemeStore } from '@/stores/theme.store';
import Image from 'next/image';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import { HEADER_DATA } from '@/data/layout/header.data';

/**
 * Header 组件
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('layout.header');
  const { isDarkMode } = useThemeStore();

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
          ? `${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md shadow-lg`
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
            <h1
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled
                  ? isDarkMode ? 'text-white' : 'text-gray-900'
                  : 'text-white'
              }`}
            >
              {t(HEADER_DATA.logo.labelKey)}
            </h1>
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {HEADER_DATA.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`transition-colors duration-300 hover:text-cyan-400 ${
                  isScrolled
                    ? isDarkMode ? 'text-gray-200 font-medium' : 'text-gray-900 font-medium'
                    : 'text-white/90'
                }`}
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>

          {/* Theme Switcher + Language Switcher + CTA Buttons */}
          <div className='flex space-x-4 items-center'>
            {/* Theme Switcher */}
            <ThemeSwitcher
              size='medium'
              className={isScrolled ? (isDarkMode ? 'text-yellow-400' : 'text-gray-700') : 'text-yellow-400'}
            />

            {/* Language Switcher */}
            {HEADER_DATA.language.enabled && (
              <LocaleSwitcher
                size='medium'
                className={isScrolled ? (isDarkMode ? 'text-cyan-400' : 'text-gray-700') : 'text-cyan-400'}
              />
            )}

            {/* CTA Buttons - 固定宽度 */}
            {HEADER_DATA.actions.length > 0 && (
              <>
                {HEADER_DATA.actions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className={
                      action.variant === 'secondary'
                        ? `w-20 px-4 py-2 rounded-lg transition-all duration-300 text-center ${
                            isScrolled
                              ? isDarkMode
                                ? 'text-gray-200 font-semibold hover:text-white'
                                : 'text-gray-900 font-semibold hover:text-gray-900'
                              : 'text-white/90 hover:text-white'
                          }`
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
