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

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

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
            {/* Language Switcher */}
            <select
              className='px-2 py-1 rounded border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none'
              defaultValue='zh-CN'
              style={{ minWidth: 80 }}
              title='语言切换'
            >
              <option value='zh-CN'>zh-CN</option>
              <option value='en-US'>en-US</option>
            </select>
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
