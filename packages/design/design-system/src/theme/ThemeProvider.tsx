/**
 * ThemeProvider.tsx - 主题提供者组件
 * @package @vxture/design-system
 *
 * 功能：提供主题上下文，统一管理 light/dark/system 主题和 UI 密度
 *       "use client" 由 dist 构建产物首行统一注入，源文件保持纯净
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Common
 */

import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Density } from "../density";
import { DEFAULT_DENSITY, DENSITY_STORAGE_KEY } from "../density";

// ─── 类型定义 ──────────────────────────────────────────────────────────────────

/**
 * Theme Context Value
 */
type ThemeContextValue = {
  /** 当前主题 */
  theme: string | undefined;
  /** 设置主题 */
  setTheme: (theme: string) => void;
  /** 当前密度 */
  density: Density;
  /** 设置密度 */
  setDensity: (density: Density) => void;
};

/**
 * ThemeProvider Props
 */
export type ThemeProviderProps = {
  /** 子组件 */
  readonly children: ReactNode;
  /** 默认主题 */
  readonly defaultTheme?: string;
  /** 默认密度 */
  readonly defaultDensity?: Density;
};

// ─── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── DensityProvider ──────────────────────────────────────────────────────────

/**
 * 内部 Density Provider
 *
 * 管理 UI 密度状态，挂载后从 localStorage 恢复，并将 density-{value} class
 * 写入 document.documentElement，供 Tailwind 变体或 CSS 变量使用。
 */
function DensityProvider({
  children,
  defaultDensity = DEFAULT_DENSITY,
}: {
  children: ReactNode;
  defaultDensity?: Density;
}) {
  const [density, setDensityState] = useState<Density>(defaultDensity);
  // 用 ref 跟踪挂载状态，避免 useCallback 依赖 mounted state 导致函数频繁重建
  const mountedRef = useRef(false);

  // ── 挂载后从 localStorage 恢复 ────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY) as Density | null;
    if (saved && (["compact", "default", "comfortable"] as Density[]).includes(saved)) {
      setDensityState(saved);
    }
  }, []);

  // ── setDensity：始终写入 localStorage（mountedRef 不触发重渲染）────────────
  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
    // 使用 ref 判断，无论 mounted 时序如何都能正确写入
    if (mountedRef.current) {
      localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
    }
  }, []); // 无依赖，函数引用稳定

  // ── 同步 density class 到 <html> ──────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    const root = document.documentElement;
    root.classList.remove("density-compact", "density-default", "density-comfortable");
    root.classList.add(`density-${density}`);
  }, [density]);

  return (
    <ThemeContext.Consumer>
      {(context) => {
        if (!context) return null;
        return (
          <ThemeContext.Provider value={{ ...context, density, setDensity }}>
            {children}
          </ThemeContext.Provider>
        );
      }}
    </ThemeContext.Consumer>
  );
}

// ─── ThemeContextBridge ───────────────────────────────────────────────────────

/**
 * 桥接组件：在 NextThemeProvider 内部读取 next-themes context，
 * 注入自定义 ThemeContext，再嵌套 DensityProvider。
 */
function ThemeContextBridge({
  children,
  defaultDensity,
}: {
  children: ReactNode;
  defaultDensity: Density;
}) {
  const { theme, setTheme } = useNextTheme();

  const baseValue: Omit<ThemeContextValue, "density" | "setDensity"> = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={baseValue as ThemeContextValue}>
      <DensityProvider defaultDensity={defaultDensity}>
        {children}
      </DensityProvider>
    </ThemeContext.Provider>
  );
}

// ─── ThemeProvider ────────────────────────────────────────────────────────────

/**
 * 主题提供者组件
 *
 * 封装 next-themes 的 ThemeProvider，统一管理主题和 UI 密度。
 * 默认跟随系统偏好（system），通过 CSS class 驱动 Tailwind dark 模式。
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system" defaultDensity="default">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultDensity = DEFAULT_DENSITY,
}: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
      <ThemeContextBridge defaultDensity={defaultDensity}>
        {children}
      </ThemeContextBridge>
    </NextThemeProvider>
  );
}

// ─── useTheme ─────────────────────────────────────────────────────────────────

/**
 * 使用主题 Hook
 *
 * 必须在 ThemeProvider 内部使用，返回当前主题和密度及其设置方法。
 *
 * @example
 * ```tsx
 * const { theme, setTheme, density, setDensity } = useTheme();
 * setTheme('dark');
 * setDensity('comfortable');
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
