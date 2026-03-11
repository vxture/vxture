/**
 * useFullscreen.ts - 全屏系统 Hook
 * @package @vxture/design-system
 *
 * 功能：提供访问全屏系统状态和操作的 Hook
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Hooks
 */

import { useFullscreenContext } from "../components/layout/fullscreen/FullscreenProvider";
import { FullscreenMode } from "../types/fullscreen";

export function useFullscreen() {
  const context = useFullscreenContext();

  /**
   * 简化版：进入全屏
   */
  const enter = (id: string, element: HTMLElement, mode?: FullscreenMode) => {
    context.enterFullscreen(id, element, mode);
  };

  /**
   * 简化版：退出全屏
   */
  const exit = () => {
    context.exitFullscreen();
  };

  /**
   * 简化版：切换全屏
   */
  const toggle = (id: string, element: HTMLElement, mode?: FullscreenMode) => {
    context.toggleFullscreen(id, element, mode);
  };

  /**
   * 检查是否支持原生全屏
   */
  const isNativeSupported = (): boolean => {
    return !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
  };

  /**
   * 检查是否是特定目标的全屏状态
   */
  const isTargetFullscreen = (id: string): boolean => {
    return context.isFullscreen && context.targetId === id;
  };

  return {
    ...context,
    enter,
    exit,
    toggle,
    isNativeSupported,
    isTargetFullscreen
  };
}
