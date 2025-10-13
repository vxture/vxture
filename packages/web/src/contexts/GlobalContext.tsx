// src/contexts/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// -------------------------- 1. 定义类型（确保 TypeScript 类型安全） --------------------------
// 主题类型（限制仅支持 light/dark）
export type Theme = 'light' | 'dark';
// 多语言类型（后续可扩展其他语言，如 ja-JP）
export type Locale = 'zh-CN' | 'en-US';

// 全局状态结构（包含状态和操作方法）
interface GlobalContextType {
  // 主题相关
  theme: Theme;
  toggleTheme: () => void; // 切换主题（light ↔ dark）
  setTheme: (theme: Theme) => void; // 直接设置主题（如从后端获取后强制设置）

  // 多语言相关
  locale: Locale;
  setLocale: (locale: Locale) => void; // 设置语言
}

// -------------------------- 2. 创建 Context 容器 --------------------------
// 初始值设为 undefined（后续由 Provider 注入真实值）
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// -------------------------- 3. 全局 Provider 组件（核心逻辑） --------------------------
// Provider 负责管理全局状态，并将状态注入到所有子组件
interface GlobalProviderProps {
  children: ReactNode; // 子组件（所有通过 Router 渲染的页面）
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  // -------------------------- 初始化状态（从 localStorage 读取，实现持久化） --------------------------
  // 初始化主题：优先用本地存储的主题，没有则默认 light
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      return (savedTheme as Theme) || 'light';
    }
    return 'light';
  });

  // 初始化语言：优先用本地存储的语言，没有则默认 zh-CN
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('app_locale');
      return (savedLocale as Locale) || 'zh-CN';
    }
    return 'zh-CN';
  });

  // -------------------------- 主题操作方法 --------------------------
  // 切换主题（light ↔ dark）
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // -------------------------- 状态变化时的副作用（同步全局） --------------------------
  // 1. 主题变化：同步到 HTML 根元素（供 CSS 主题样式使用）+ localStorage + window 全局变量
  useEffect(() => {
    // 给 HTML 根元素加 data-theme 属性（如 <html data-theme="light">）
    document.documentElement.setAttribute('data-theme', theme);
    // 持久化到 localStorage（刷新页面不丢失）
    localStorage.setItem('app_theme', theme);
    // 同步到 window 全局变量（供非 React 代码访问，如 jQuery 插件）
    window.__VXTURE_THEME__ = theme;
  }, [theme]);

  // 2. 语言变化：持久化到 localStorage（后续可扩展同步到 i18n 库，如 react-i18next）
  useEffect(() => {
    localStorage.setItem('app_locale', locale);
    // 若使用 react-i18next，可在此处同步语言：
    // import { useTranslation } from 'react-i18next';
    // const { i18n } = useTranslation();
    // i18n.changeLanguage(locale);
  }, [locale]);

  // -------------------------- 注入状态到 Context --------------------------
  const contextValue: GlobalContextType = {
    theme,
    toggleTheme,
    setTheme,
    locale,
    setLocale,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children} {/* 所有路由页面会在这里渲染，自动获取全局状态 */}
    </GlobalContext.Provider>
  );
};

// -------------------------- 4. 自定义 Hook（简化组件引用） --------------------------
// 封装 useContext 逻辑，避免每个组件重复判断 undefined
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal 必须在 GlobalProvider 内部使用');
  }
  return context;
};

// -------------------------- 5. 扩展 Window 类型（解决 TypeScript 类型报错） --------------------------
// 告诉 TypeScript：window 上有 __VXTURE_THEME__ 属性，类型为 Theme
declare global {
  interface Window {
    __VXTURE_THEME__?: Theme;
  }
}
