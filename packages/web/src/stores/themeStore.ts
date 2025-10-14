/**
 * themeStore.ts - 全局主题状态管理（light/dark 等）
 *
 * 核心功能：
 *   1. 管理当前主题（theme），支持 light/dark 及扩展主题
 *   2. setTheme 支持幂等安全切换，toggleTheme 支持一键切换
 *   3. 状态持久化到 localStorage，刷新后自动恢复
 *   4. 全局配置集中，便于多组件复用和统一维护
 *
 * 设计理念：
 *   - 类型安全，便于扩展主题类型
 *   - 兼容 TailwindCSS、Next.js 等主流前端框架
 *   - 推荐在应用根布局初始化，保证全局一致性
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 最后更新：2024-10-14
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==============================================================================
// 类型定义区域 - 全局统一主题类型，供 ClientSyncAgg 等组件导入复用
// ==============================================================================

/**
 * 主题枚举类型
 * 限制合法主题值，避免传入无效值导致 DOM 状态异常
 * 扩展说明：如需支持「跟随系统」（如 "system"）或自定义主题（如 "sepia"），
 * 可在此处添加类型（例：'light' | 'dark' | 'system'），并同步修改 toggleTheme 逻辑
 */
export type Theme = 'light' | 'dark' | string;

/**
 * 主题状态管理接口
 * 定义「状态字段」与「操作方法」的类型约束，确保类型安全
 */
interface ThemeState {
  /** 当前激活的主题（默认：light） */
  theme: Theme;
  /**
   * 直接设置主题
   * @param theme - 目标主题（需为 Theme 类型的合法值）
   * @特性 幂等性：若传入主题与当前主题一致，或值无效，则不执行状态更新
   */
  setTheme: (theme: Theme) => void;
  /**
   * 切换主题（仅在 light/dark 之间切换）
   * @注意 若扩展主题类型（如添加 system），需修改此方法的判断逻辑
   */
  toggleTheme: () => void;
}

// ==============================================================================
// 全局配置常量 - 统一管理主题相关配置，供 ClientSyncAgg 组件导入使用
// 核心作用：避免配置在多文件中重复定义，修改时仅需改一处
// ==============================================================================

// 移除本地 THEME_CONFIG，改为导入
import { THEME_CONFIG } from '@/constants/themeConfig';

// ==============================================================================
// 主题状态管理核心 - 基于 Zustand 实现，支持持久化、类型安全
// ==============================================================================

/**
 * 全局主题状态 Hook（供所有组件使用）
 *
 * 核心特性：
 * 1. 持久化：通过 persist 中间件将主题状态存储到 localStorage，刷新页面后自动恢复
 * 2. 幂等操作：setTheme 方法避免无效状态更新，减少组件重渲染
 * 3. 配置统一：依赖 THEME_CONFIG，与 ClientSyncAgg 组件共享配置，避免冲突
 * 4. 可扩展：预留主题类型扩展入口（如支持 system 主题）
 *
 * 使用示例：
 * const { theme, setTheme, toggleTheme } = useThemeStore();
 * setTheme('dark'); // 切换到深色模式
 * toggleTheme(); // 在 light/dark 间切换
 */
export const useThemeStore = create<ThemeState>()(
  // persist 中间件：处理主题状态持久化
  persist(
    // 状态初始化与方法定义
    (set, get) => ({
      // 初始主题：使用全局配置的默认值，确保与 ClientSyncAgg 初始化逻辑一致
      theme: THEME_CONFIG.defaultTheme,

      // 直接设置主题（幂等实现）
      setTheme: (theme) => {
        if (typeof theme !== 'string') return;
        const next = theme.trim();
        if (!next) return;
        const currentTheme = get().theme;
        if (currentTheme !== next) {
          set({ theme: next });
        }
      },

      // 切换主题（仅支持 light ↔ dark，扩展主题需修改此逻辑）
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },
    }),

    // persist 配置项（与全局配置对齐）
    {
      /** 存储键名：必须与 THEME_CONFIG.storageKey 一致，避免 ClientSyncAgg 读取不到 */
      name: THEME_CONFIG.storageKey,
      /**
       * 部分持久化：仅存储 theme 字段
       * 原因：操作方法（setTheme/toggleTheme）无需持久化，仅状态需要
       */
      partialize: (state) => ({ theme: state.theme }),
      /**
       * 可选：自定义存储引擎（默认 localStorage）
       * 若需改用 sessionStorage，可添加：
       * storage: sessionStorage
       */
    }
  )
);
