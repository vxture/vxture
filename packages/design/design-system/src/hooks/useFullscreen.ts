/**
 * useFullscreen.ts - 全屏系统 Hook
 * @package @vxture/design-system
 *
 * 功能：提供访问全屏系统状态和操作的简化 Hook
 *       isNativeSupported 直接从 context 读取，不重复实现
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Hooks
 */

import { useFullscreenContext } from "../components/layout/fullscreen/Provider";
import type { FullscreenOptions } from "../types/fullscreen";

export function useFullscreen() {
  const context = useFullscreenContext();

  /**
   * 进入全屏（简化签名）
   */
  const enter = (id: string, element: HTMLElement, options?: FullscreenOptions) => {
    context.enterFullscreen(id, element, options);
  };

  /**
   * 退出全屏（简化签名）
   */
  const exit = () => {
    context.exitFullscreen();
  };

  /**
   * 切换全屏（简化签名）
   */
  const toggle = (id: string, element: HTMLElement, options?: FullscreenOptions) => {
    context.toggleFullscreen(id, element, options);
  };

  /**
   * 检查特定目标是否处于全屏状态
   */
  const isTargetFullscreen = (id: string): boolean => {
    return context.isFullscreen && context.targetId === id;
  };

  return {
    ...context,
    enter,
    exit,
    toggle,
    isTargetFullscreen,
  };
}
