/**
 * useMediaQuery.ts - 媒体查询检测 Hook
 * @package @vxture/design-system
 *
 * 功能：检测媒体查询匹配状态
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Hooks
 */

import { useEffect, useState } from "react";

/**
 * 媒体查询检测 Hook
 *
 * @param query CSS 媒体查询字符串
 * @returns 是否匹配该媒体查询
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // SSR 安全检查
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // 初始化匹配状态
    setMatches(mediaQueryList.matches);

    // 监听媒体查询变化
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
