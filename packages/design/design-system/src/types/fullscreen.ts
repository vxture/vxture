/**
 * fullscreen.ts - 全屏系统类型定义
 * @package @vxture/design-system
 *
 * 功能：定义全屏系统的所有类型
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Types
 */

export type FullscreenMode = "pseudo" | "native";

export interface FullscreenState {
  isFullscreen: boolean;
  targetId?: string;
  mode: FullscreenMode;
}

export interface FullscreenContextValue extends FullscreenState {
  enterFullscreen: (id: string, element: HTMLElement, mode?: FullscreenMode) => void;
  exitFullscreen: () => void;
  toggleFullscreen: (id: string, element: HTMLElement, mode?: FullscreenMode) => void;
}

export interface FullscreenProviderProps {
  children: React.ReactNode;
  defaultMode?: FullscreenMode;
}

export interface FullscreenContainerProps {
  id: string;
  mode?: FullscreenMode;
  portal?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface FullscreenContainerRef {
  /**
   * 进入全屏
   */
  enter: () => void;
  /**
   * 退出全屏
   */
  exit: () => void;
  /**
   * 切换全屏
   */
  toggle: () => void;
}

export interface FullscreenToggleProps {
  targetId: string;
  mode?: FullscreenMode;
  className?: string;
  children?: React.ReactNode;
}

export interface FullscreenPortalProps {
  children: React.ReactNode;
}
