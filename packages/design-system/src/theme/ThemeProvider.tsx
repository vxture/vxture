/**
 * ThemeProvider.tsx - 主题提供者组件
 * @package @vxture/design-system
 *
 * 功能：提供主题上下文，管理 light/dark/system 主题切换
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Common
 */

"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * ThemeProvider Props
 */
type ThemeProviderProps = {
  /** 子组件 */
  readonly children: ReactNode;
};

/**
 * 主题提供者组件
 *
 * 封装 next-themes 的 ThemeProvider，提供统一的主题管理接口
 * 默认使用 system 主题，通过 CSS class 切换主题
 *
 * @param children - 子组件
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  );
}
