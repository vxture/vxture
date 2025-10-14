/**
 * ClientSyncAgg.tsx - 客户端状态同步聚合组件
 *
 * 核心功能：
 *   作为客户端专用组件，统一处理全局状态与DOM的同步逻辑，
 *   包含主题切换、语言设置和认证令牌过期检查三大核心功能模块。
 *
 * 设计理念：
 *   1. 隔离客户端API调用，避免在服务端组件中直接访问浏览器API
 *   2. 聚合分散的同步逻辑，减少布局组件中的重复代码
 *   3. 实现健壮的错误处理，确保单一功能异常不影响整体运行
 *   4. 保持各功能模块独立性，便于单独维护和扩展
 *
 * 使用场景：
 *   应在应用根布局中作为客户端组件引入，确保在应用初始化时即开始工作
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 最后更新：2024-10-14
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useAuthStore } from '@/stores/authStore';
import { THEME_CONFIG } from '@/constants/themeConfig';
import { I18N_CONFIG } from '@/constants/i18nConfig';
import { AUTH_CONFIG } from '@/constants/authConfig';

// ==============================================================================
// 类型定义区域 - 集中管理所有类型，确保类型安全和一致性
// ==============================================================================

/**
 * 主题类型定义
 * 限制合法的主题值，防止传入无效值导致的异常
 * 扩展说明：如需添加新主题（如"system"跟随系统），可在此处扩展
 */
type ThemeType = 'light' | 'dark' | string;

/**
 * 语言存储结构接口
 * 描述localStorage中存储的国际化相关数据格式
 */
interface I18nStorage extends Record<string, unknown> {
  locale: string; // 存储的语言标识
}

/**
 * 认证存储结构接口
 * 描述localStorage中存储的认证相关数据格式
 */
// interface AuthStorage extends Record<string, unknown> {
//   timestamp: number; // 令牌创建或过期时间戳
// }
// ↑↑↑ 删除本地 AuthStorage interface

// ==============================================================================
// 常量定义区域 - 集中管理所有配置常量，便于统一维护和修改
// ==============================================================================

/** 主题相关常量 */
// import { THEME_CONFIG } from '@/constants/themeConfig'; // 已导入
/** 语言相关常量 */
// import { I18N_CONFIG } from '@/constants/i18nConfig'; // 已导入
/** 认证相关常量 */
// import { AUTH_CONFIG } from '@/constants/authConfig'; // 已导入

// ==============================================================================
// 主组件定义
// ==============================================================================

/**
 * 客户端状态同步聚合组件
 *
 * 该组件不渲染任何UI元素（返回null），仅负责处理：
 * 1. 主题状态与DOM的同步
 * 2. 语言设置与DOM的同步
 * 3. 认证令牌过期检查与自动登出
 *
 * @returns {null} 不渲染任何内容
 */
export default function ClientSyncAgg(): null {
  // ==============================================================================
  // 状态获取 - 从全局状态管理中获取所需状态和操作方法
  // ==============================================================================

  /** 从主题Store获取当前主题 */
  const theme = useThemeStore((state) => state.theme);

  /** 从语言Store获取当前语言和语言设置方法 */
  const { locale, setLocale } = useI18nStore();

  /** 从认证Store获取当前令牌和登出方法 */
  const { token, logout } = useAuthStore();

  // ==============================================================================
  // 主题同步模块
  // 功能：管理主题状态与DOM的同步，支持从本地存储恢复用户偏好
  // ==============================================================================

  /**
   * 同步主题状态到DOM
   *
   * @param currentTheme - 当前主题值
   * @description 该函数会：
   *   1. 验证主题值的有效性
   *   2. 仅在需要时更新DOM属性和类名，避免无效操作
   *   3. 处理深色模式的特殊类名切换
   *   4. 在开发环境提供错误信息，生产环境静默处理
   */
  const syncTheme = useCallback((currentTheme: ThemeType) => {
    // 前置校验：过滤无效主题值
    if (typeof currentTheme !== 'string' || currentTheme.trim() === '') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[主题同步] 无效的主题值: ${currentTheme}，使用默认主题`);
      }
      return;
    }

    try {
      const root = document.documentElement;
      const isDark = currentTheme === 'dark';

      // 获取当前DOM状态，用于比较是否需要更新
      const currentAttr = root.getAttribute(THEME_CONFIG.themeAttribute);
      const hasDarkClass = root.classList.contains(THEME_CONFIG.darkClass);

      // 判断是否需要执行DOM操作（仅在状态不一致时执行）
      const needUpdateAttr = currentAttr !== currentTheme;
      const needAddDark = isDark && !hasDarkClass;
      const needRemoveDark = !isDark && hasDarkClass;

      // 执行必要的DOM操作
      if (needUpdateAttr) {
        root.setAttribute(THEME_CONFIG.themeAttribute, currentTheme);
      }
      if (needAddDark) {
        root.classList.add(THEME_CONFIG.darkClass);
      }
      if (needRemoveDark) {
        root.classList.remove(THEME_CONFIG.darkClass);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[主题同步] 同步失败:', error);
      }
    }
  }, []);

  /**
   * 主题同步副作用
   *
   * @description 该副作用会：
   *   1. 组件首次挂载时，从localStorage恢复用户上次选择的主题
   *   2. 当主题状态变化时，触发DOM同步
   *   3. 仅在存储的主题有效且与当前状态不同时才更新Store
   */
  useEffect(() => {
    // 从本地存储恢复主题设置
    const restoreThemeFromStorage = () => {
      try {
        const storedTheme = localStorage.getItem(THEME_CONFIG.storageKey) as ThemeType | null;

        // 验证存储的主题是否有效
        if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
          const currentStoreTheme = useThemeStore.getState().theme;

          // 仅在存储值与当前值不同时更新，避免无效状态更新
          if (storedTheme !== currentStoreTheme) {
            useThemeStore.getState().setTheme(storedTheme as typeof currentStoreTheme);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[主题恢复] 从本地存储恢复主题失败:', error);
        }
      }
    };

    // 执行初始化恢复
    restoreThemeFromStorage();

    // 同步当前主题到DOM
    syncTheme(theme);

    // 清理函数（主题同步无持久副作用，此处为空）
    return () => {};
  }, [theme, syncTheme]);

  // ==============================================================================
  // 语言同步模块
  // 功能：管理语言设置与DOM的同步，确保SEO和无障碍访问的兼容性
  // ==============================================================================

  /**
   * 同步语言设置到DOM
   *
   * @param currentLocale - 当前语言标识
   * @description 该函数会：
   *   1. 更新html元素的lang属性
   *   2. 更新content-language meta标签
   *   3. 检查本地存储的语言设置，必要时更新Store
   *   4. 仅在值发生变化时执行更新，减少DOM操作
   */
  const syncLocale = useCallback(
    (currentLocale: string) => {
      try {
        const root = document.documentElement;
        const langMeta = document.querySelector<HTMLMetaElement>(I18N_CONFIG.metaSelector);

        // 更新html lang属性（仅在值不同时）
        if (root.lang !== currentLocale) {
          root.lang = currentLocale;
        }

        // 更新meta标签（仅在存在且值不同时）
        if (langMeta && langMeta.content !== currentLocale) {
          langMeta.content = currentLocale;
        }

        // 检查并同步本地存储的语言设置
        const stored = localStorage.getItem(I18N_CONFIG.storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as I18nStorage;

            // 验证存储的语言设置并更新Store（避免循环更新）
            if (typeof parsed.locale === 'string' && parsed.locale !== currentLocale) {
              setLocale(parsed.locale as typeof locale);
            }
          } catch (parseError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('[语言同步] 解析本地存储失败:', parseError);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[语言同步] 同步失败:', error);
        }
      }
    },
    [setLocale]
  );

  /**
   * 语言同步副作用
   *
   * @description 当语言标识变化时，触发DOM同步
   */
  useEffect(() => {
    syncLocale(locale);
  }, [locale, syncLocale]);

  // ==============================================================================
  // 认证同步模块
  // 功能：管理令牌过期检查，确保安全自动登出
  // ==============================================================================

  /**
   * 检查令牌是否过期
   *
   * @description 该函数会：
   *   1. 从本地存储读取认证信息
   *   2. 验证时间戳的有效性
   *   3. 当令牌过期时调用登出方法
   */
  const checkTokenExpiry = useCallback(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_CONFIG.storageKey);
      if (!storedAuth) return;

      const parsed = JSON.parse(storedAuth) as AuthStorage;
      const now = Date.now();

      // 验证时间戳并检查是否过期
      if (
        typeof parsed.timestamp === 'number' &&
        !isNaN(parsed.timestamp) &&
        now - parsed.timestamp > AUTH_CONFIG.tokenExpiryMs
      ) {
        logout();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[认证检查] 令牌过期检查失败:', error);
      }
    }
  }, [logout]);

  /**
   * 认证检查副作用
   *
   * @description 该副作用会：
   *   1. 仅在令牌存在时执行检查
   *   2. 组件挂载后立即执行一次初始检查
   *   3. 设置定时检查（每小时一次）
   *   4. 监听页面可见性变化，在页面激活时再次检查
   *   5. 组件卸载时清理定时器和事件监听，防止内存泄漏
   */
  useEffect(() => {
    // 令牌不存在时不执行检查
    if (!token) return;

    // 标记组件是否已挂载，防止卸载后执行操作
    let isMounted = true;

    // 初始检查
    if (isMounted) {
      checkTokenExpiry();
    }

    // 设置定时检查
    const intervalId = window.setInterval(checkTokenExpiry, AUTH_CONFIG.checkIntervalMs);

    // 页面可见性变化时检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        checkTokenExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数：防止内存泄漏
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, checkTokenExpiry]);

  // ==============================================================================
  // 组件输出
  // ==============================================================================

  /**
   * 该组件仅处理副作用，不渲染任何UI元素
   * 返回null表示不产生任何视觉输出
   */
  return null;
}
