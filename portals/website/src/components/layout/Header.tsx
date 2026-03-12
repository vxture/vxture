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
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useHeader } from '@/hooks/useLayout';
import { useLocale } from '@/hooks/useLocale';
import { useThemeStore } from '@/stores/themeStore';
import { Icon } from '@vxture/design-system';
import { normalizeHeaderData } from '@/utils/layoutHelpers';

/**
 * Header 组件
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // 使用新架构的 Hooks 获取数据
  const { data: headerData, isLoading, error } = useHeader();
  const { locale, setLocale } = useLocale();
  const { theme, isDarkMode, toggleTheme } = useThemeStore();

  // 数据规范化：保证前端渲染安全完整
  const header = normalizeHeaderData(error || !headerData ? undefined : headerData);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 点击外部关闭语言菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageMenuOpen]);

  // 处理语言切换
  const handleLanguageChange = (langCode: string) => {
    setLocale(langCode);
    setIsLanguageMenuOpen(false);
  };

  // 加载状态
  if (isLoading) {
    return (
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/25 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='text-white'>加载中...</div>
          </div>
        </div>
      </header>
    );
  }

  // 如果内容被禁用，不渲染
  if (!header.enabled) {
    return null;
  }

  // 正常渲染（使用 JSON 数据）
  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? `${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md shadow-lg`
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex-shrink-0 flex items-center space-x-2'>
            {header.logo && (
              <>
                <img
                  src={header.logo.image}
                  alt={header.logo.alt}
                  className='w-6 h-6 object-contain'
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
            <button
              className='w-8 h-8 flex items-center justify-center transition-colors'
              title={header.theme.title}
              onClick={toggleTheme}
            >
              <span className='sr-only'>{header.theme.title}</span>
              {isDarkMode ? (
                <Icon name="sun" className={`w-5 h-5 ${isScrolled ? (isDarkMode ? 'text-yellow-400' : 'text-gray-700') : 'text-yellow-400'}`} />
              ) : (
                <Icon name="moon" className={`w-5 h-5 ${isScrolled ? (isDarkMode ? 'text-blue-300' : 'text-gray-700') : 'text-blue-300'}`} />
              )}
            </button>

            {/* Language Switcher */}
            {header.language && header.language.enabled && (
              <div ref={languageMenuRef} className='relative'>
                <button
                  className='w-8 h-8 flex items-center justify-center transition-colors'
                  title={header.language.title || '切换语言'}
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                >
                  <span className='sr-only'>{header.language.title || '切换语言'}</span>
                  <Icon
                    name="globe"
                    className={`w-5 h-5 ${isScrolled ? (isDarkMode ? 'text-cyan-400' : 'text-gray-700') : 'text-cyan-400'}`}
                  />
                </button>

                {/* Language Dropdown Menu */}
                {isLanguageMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-32 border rounded-lg shadow-lg z-10 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {header.language.options.map((lang, index) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          locale === lang.code
                            ? 'bg-cyan-50 text-cyan-600 font-medium'
                            : isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                        } ${index === 0 ? 'rounded-t-lg' : ''} ${
                          index === header.language.options.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                        : 'w-28 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center'
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
