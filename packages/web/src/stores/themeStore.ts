// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Zustand自带的持久化中间件

// 主题类型定义
export type Theme = 'light' | 'dark';

// 状态与方法类型
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void; // 直接设置主题
  toggleTheme: () => void; // 切换主题（light ↔ dark）
}

// 创建Theme Store，使用persist中间件持久化到localStorage
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // 默认主题

      // 直接设置主题
      setTheme: (theme) => set({ theme }),

      // 切换主题（light ↔ dark）
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // localStorage的key（前缀）
      partialize: (state) => ({ theme: state.theme }), // 只持久化theme字段
    }
  )
);
