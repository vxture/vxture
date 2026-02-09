/**
 * Header.tsx
 *
 * 功能：
 * - 网站全局顶部导航栏，包含 Logo、导航菜单、主题切换、语言切换等
 *
 * 用途：
 * - 作为所有页面的主导航栏，提升品牌一致性与用户体验
 *
 * 依赖/调用关系：
 * - 依赖 React、react-icons、全局 window 变量
 * - 被 app/layout.tsx 直接引用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它 Layout 组件保持一致
 *
 * @file Header.tsx
 * @desc 网站全局顶部导航栏，支持主题/语言切换
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, react-icons
 * @see Footer.tsx
 * @tags header, layout, navigation, component
 * @example
 *   <Header />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 * @todo
 *   支持更多自定义导航项与动画效果
 */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useRef } from 'react';
import { FiSun, FiMoon, FiGlobe } from 'react-icons/fi';

// ============ 全局类型扩展 ============
declare global {
  interface Window {
    __VXTURE_THEME__?: 'light' | 'dark';
  }
}

/**
 * Header 组件
 * @returns {JSX.Element} 网站全局顶部导航栏
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // 主题切换，写入全局变量（window.__VXTURE_THEME__）
  useEffect(() => {
    window.__VXTURE_THEME__ = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 监听滚动，动态切换导航栏样式
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
  const handleLanguageChange = (lang: 'zh-CN' | 'en-US') => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
    // 可在此添加更新 i18n 的逻辑
  };

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
            {/* Logo image */}
            <img
              src='/images/hearder/vxture-logo-white.png'
              alt='logo'
              className='w-6 h-6 object-contain'
            />
            <h1
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              vxture.ai
            </h1>
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {['产品服务', '解决方案', '行业案例', '关于我们'].map((item) => (
              <a
                key={item}
                href='#'
                className={`transition-colors duration-300 hover:text-cyan-400 ${
                  isScrolled ? 'text-gray-600' : 'text-white/90'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons + Theme/Language Switcher */}
          <div className='flex space-x-4 items-center'>
            {/* Theme Switcher (icon only, light/dark) */}
            <button
              className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors'
              title='切换主题'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <span className='sr-only'>切换主题</span>
              {theme === 'light' ? <FiSun className='w-5 h-5' /> : <FiMoon className='w-5 h-5' />}
            </button>

            {/* Language Switcher (icon + dropdown menu) */}
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
                    { code: 'zh-CN', label: '中文-简体' },
                    { code: 'zh-TW', label: '中文-繁體' },
                    { code: 'en-US', label: 'English' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'zh-CN' | 'en-US')}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-cyan-50 text-cyan-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${lang.code === 'zh-CN' ? 'rounded-t-lg border-b' : 'rounded-b-lg'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* CTA Buttons */}
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'
              }`}
            >
              登录
            </button>
            <button className='px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl'>
              Ruins Agent
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
