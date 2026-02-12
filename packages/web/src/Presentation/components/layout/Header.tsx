/**
 * Header.tsx - 网站全局顶部导航栏（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局导航栏 UI
 * - 使用 Application Layer 的 useHeader Hook 获取数据
 * - 支持主题切换、语言切换、滚动效果
 *
 * @layer Presentation
 * @category Components - Layout
 */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useHeader } from '@/application/hooks/layout';
import { useLocale } from '@/application/hooks/shared';
import { FiSun, FiMoon, FiGlobe } from 'react-icons/fi';

// 全局类型扩展
declare global {
  interface Window {
    __VXTURE_THEME__?: 'light' | 'dark';
  }
}

/**
 * Header 组件
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // 使用新的 Application Layer Hooks 获取数据
  const { data: header, isLoading, error } = useHeader();
  const { locale, setLocale } = useLocale();

  // 主题切换
  useEffect(() => {
    window.__VXTURE_THEME__ = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
  const handleLanguageChange = (lang: string) => {
    setLocale(lang);
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

  // 错误状态或数据缺失
  if (error || !header) {
    return null;
  }

  // 如果内容被禁用，不渲染
  if (!header.enabled) {
    return null;
  }

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/25 backdrop-blur-md shadow-lg' : 'bg-transparent'
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
                    isScrolled ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {header.logo.text || header.logo.alt}
                </h1>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {header.navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`transition-colors duration-300 hover:text-cyan-400 ${
                  isScrolled ? 'text-gray-600' : 'text-white/90'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons + Theme/Language Switcher */}
          <div className='flex space-x-4 items-center'>
            {/* Theme Switcher */}
            <button
              className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors'
              title='切换主题'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <span className='sr-only'>切换主题</span>
              {theme === 'light' ? <FiSun className='w-5 h-5' /> : <FiMoon className='w-5 h-5' />}
            </button>

            {/* Language Switcher */}
            <div ref={languageMenuRef} className='relative'>
              <button
                className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors'
                title='切换语言'
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              >
                <span className='sr-only'>切换语言</span>
                <FiGlobe className='w-5 h-5' />
              </button>

              {/* Dropdown menu */}
              {isLanguageMenuOpen && (
                <div className='absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
                  {[
                    { code: 'zh-CN', label: '中文' },
                    { code: 'en-US', label: 'English' },
                  ].map((lang, index) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        locale === lang.code
                          ? 'bg-cyan-50 text-cyan-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-t-lg' : 'rounded-b-lg'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            {header.actions && header.actions.length > 0 && (
              <>
                {header.actions.map((action, index) => (
                  <a
                    key={action.text}
                    href={action.href}
                    className={
                      index === 0
                        ? `px-4 py-2 rounded-lg transition-all duration-300 ${
                            isScrolled
                              ? 'text-gray-600 hover:text-gray-900'
                              : 'text-white/90 hover:text-white'
                          }`
                        : 'px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                    }
                  >
                    {action.text}
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