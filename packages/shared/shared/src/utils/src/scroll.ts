/**
 * utils/scroll.ts
 *
 * 功能：重置窗口滚动到顶部（兼容部分浏览器的瞬时滚动）
 * 用途：首页组件挂载时调用，确保每次进入页面时滚动位置在顶部
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 *
 * 代码规范：严格遵循 TypeScript + React 组件最佳实践
 * 性能优化：避免不必要的渲染
 */

export const resetWindowScrollTop = (behavior: ScrollBehavior = "instant") => {
  if (typeof window !== "undefined") { // 避免服务器端渲染报错
    window.scrollTo({ top: 0, behavior });
  }
};
