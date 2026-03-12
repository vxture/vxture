/**
 * 全局状态管理上下文
 * @package @vxture/website
 * @layer Presentation
 * @category Contexts
 */
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  locale: string;
  setLocale: (locale: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<string>('zh-CN');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const contextValue: GlobalContextType = {
    theme,
    toggleTheme,
    locale,
    setLocale,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}
