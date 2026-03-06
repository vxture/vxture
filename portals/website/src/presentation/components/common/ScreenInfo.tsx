"use client";

import { useEffect, useState } from "react";

/**
 * ScreenInfo.tsx
 *
 * 功能：
 * - 统一提供通用屏幕信息展示，实时显示当前视口高度和宽度
 *
 * 用途：
 * - 适用于调试、开发辅助，便于快速查看屏幕尺寸
 * - 可集成到任意页面或调试工具中
 *
 * 依赖/调用关系：
 * - 依赖 React
 * - 被页面调试工具、全局布局等调用
 *
 * 设计规范：
 * - 只负责屏幕信息展示，不包含业务逻辑
 * - 命名、结构、注释与其它通用组件保持一致
 *
 * @file ScreenInfo.tsx
 * @desc 通用屏幕信息展示组件，实时显示视口尺寸
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @tags screen, info, debug, component
 * @example
 *   <ScreenInfo />
 * @remarks
 *   仅负责屏幕信息展示，业务逻辑请移至其它层。
 * @todo
 *   支持更多屏幕参数与自定义样式
 */
export default function ScreenInfo() {
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="mt-4 text-base text-gray-500">
      <div>h-screen: {height}px</div>
      <div>width: {width}px</div>
    </div>
  );
}
