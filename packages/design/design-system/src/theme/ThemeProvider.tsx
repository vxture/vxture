/**
 * ThemeProvider.tsx - 主题提供者组件
 * @package @vxture/design-system
 *
 * 功能：提供主题上下文，统一管理 light/dark/system 主题和 UI 密度
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Common
 */

"use client";

import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Density } from "../density";
import { DEFAULT_DENSITY, DENSITY_STORAGE_KEY } from "../density";

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
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider Props
 */
type ThemeProviderProps = {
  /** 子组件 */
  readonly children: ReactNode;
  /** 默认主题 */
  readonly defaultTheme?: string;
  /** 默认密度 */
  readonly defaultDensity?: Density;
};

/**
 * Density Provider 组件
 *
 * 内部使用，管理 UI 密度状态
 */
function DensityProvider({
  children,
  defaultDensity = DEFAULT_DENSITY,
}: {
  children: ReactNode;
  defaultDensity?: Density;
}) {
  const [density, setDensityState] = useState<Density>(defaultDensity);
  const [mounted, setMounted] = useState(false);

  // 挂载后从 localStorage 读取
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY) as Density | null;
    if (saved && ["compact", "default", "comfortable"].includes(saved)) {
      setDensityState(saved);
    }
  }, []);

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
    if (mounted) {
      localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
    }
  }, [mounted]);

  // 更新 HTML class
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // 移除所有 density class
    root.classList.remove(
      "density-compact",
      "density-default",
      "density-comfortable"
    );

    // 添加当前 density class
    root.classList.add(`density-${density}`);
  }, [density, mounted]);

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

/**
 * 主题提供者组件
 *
 * 封装 next-themes 的 ThemeProvider，统一管理主题和 UI 密度
 * 默认使用 system 主题，通过 CSS class 切换主题和密度
 *
 * @param children - 子组件
 * @param defaultTheme - 默认主题
 * @param defaultDensity - 默认密度
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

/**
 * 桥接组件，用于连接 next-themes 和 density
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

/**
 * 使用主题 Hook
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
