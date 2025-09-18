'use client';

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/lib/contexts/AppContext';

const Header = () => {
  const { state, dispatch } = useAppContext();
  
  // 切换主题
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    
    // 在DOM中应用主题
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Vxture
        </Link>
        
        {/* 导航菜单 */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary">
            首页
          </Link>
          <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-primary">
            关于
          </Link>
          <Link href="/services" className="text-gray-700 dark:text-gray-200 hover:text-primary">
            服务
          </Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-primary">
            联系我们
          </Link>
        </nav>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-4">
          {/* 主题切换按钮 */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={state.theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          >
            {state.theme === 'light' ? (
              <span className="text-gray-700">🌙</span>
            ) : (
              <span className="text-gray-200">☀️</span>
            )}
          </button>
          
          {/* 登录/注册按钮 */}
          {!state.user.isLoggedIn ? (
            <div className="space-x-2">
              <Link href="/login" className="btn btn--primary btn--sm">
                登录
              </Link>
              <Link href="/register" className="btn btn--secondary btn--sm">
                注册
              </Link>
            </div>
          ) : (
            <button 
              onClick={() => dispatch({ type: 'LOGOUT' })}
              className="btn btn--outline btn--sm"
            >
              退出
            </button>
          )}
          
          {/* 移动端菜单按钮 */}
          <button className="md:hidden p-2">
            <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;