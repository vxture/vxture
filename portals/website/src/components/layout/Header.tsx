/**
 * Header.tsx - 网站全局顶部导航栏
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局导航栏 UI
 * - 使用 useHeader Hook 获取数据
 * - 数据缺失或报错时自动使用 Fallback + normalizeHeaderData
 * - 支持主题切换、滚动效果
 *
 * @layer Presentation
 * @category Components - Layout
 */
'use client';

import { useEffect, useState } from 'react';
import { useHeader } from '@/hooks/useLayout';
import { useThemeStore } from '@/stores/theme.store';
import { normalizeHeaderData } from './layoutHelpers';
import Image from 'next/image';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';

/**
 * Header 组件
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // ----------------------------------------------------------------------------
  // 数据获取
  // ----------------------------------------------------------------------------

  // 1. 获取数据： 使用新架构的 Hooks
  const { data: headerData, isLoading, error } = useHeader();
  const { isDarkMode } = useThemeStore();

  // 调试数据
  console.log('[Header Component] Raw data:', headerData);
  console.log('[Header Component] Error:', error);

  // 2. 数据规范化：保证前端渲染安全完整
  const header = normalizeHeaderData(error || !headerData ? undefined : headerData);

  // 调试规范化后的数据
  console.log('[Header Component] Normalized data:', header);

  // 3. 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // ----------------------------------------------------------------------------
  // 渲染加载
  // ----------------------------------------------------------------------------

  // 4. 加载状态
  if (isLoading) {
    return (
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/25 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='text-white'>Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  // 5. 禁止渲染：如果内容被禁用，不渲染
  if (!header.enabled) {
    return null;
  }

  // 6. 正常渲染（使用 JSON 数据）
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
            {header.logo && (
              <>
                <Image
                  src={header.logo.image}
                  alt={header.logo.alt}
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
                  {header.logo.text}
                </h1>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {header.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`transition-colors duration-300 hover:text-cyan-400 ${
                  isScrolled
                    ? isDarkMode ? 'text-gray-200 font-medium' : 'text-gray-900 font-medium'
                    : 'text-white/90'
                }`}
              >
                {item.label}
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
            {header.language && header.language.enabled && (
              <LocaleSwitcher
                size='medium'
                className={isScrolled ? (isDarkMode ? 'text-cyan-400' : 'text-gray-700') : 'text-cyan-400'}
              />
            )}

            {/* CTA Buttons - 固定宽度 */}
            {header.actions && header.actions.length > 0 && (
              <>
                {header.actions.map((action) => (
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
                    {action.label}
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
