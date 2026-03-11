/**
 * FullscreenProvider.tsx - 全屏系统 Provider
 * @package @vxture/design-system
 *
 * 功能：管理全屏状态，提供统一的全屏操作接口
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FullscreenContextValue, FullscreenMode, FullscreenProviderProps, FullscreenState } from "../../../types/fullscreen";

const FullscreenContext = createContext<FullscreenContextValue | undefined>(undefined);

const DEFAULT_MODE: FullscreenMode = "pseudo";

export function FullscreenProvider({ children, defaultMode = DEFAULT_MODE }: FullscreenProviderProps) {
  const [state, setState] = useState<FullscreenState>({
    isFullscreen: false,
    mode: defaultMode,
    targetId: undefined
  });

  const originalOverflowRef = useRef<string | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);

  /**
   * 检查原生全屏是否支持
   */
  const isNativeSupported = useCallback((): boolean => {
    return !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
  }, []);

  /**
   * 进入原生全屏
   */
  const enterNativeFullscreen = useCallback(async (element: HTMLElement) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn("Failed to enter native fullscreen, falling back to pseudo:", error);
    }
  }, []);

  /**
   * 退出原生全屏
   */
  const exitNativeFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn("Failed to exit native fullscreen:", error);
    }
  }, []);

  /**
   * 锁定页面滚动
   */
  const lockScroll = useCallback(() => {
    if (originalOverflowRef.current === null) {
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
  }, []);

  /**
   * 解锁页面滚动
   */
  const unlockScroll = useCallback(() => {
    if (originalOverflowRef.current !== null) {
      document.body.style.overflow = originalOverflowRef.current;
      originalOverflowRef.current = null;
    }
  }, []);

  /**
   * 进入全屏
   */
  const enterFullscreen = useCallback((id: string, element: HTMLElement, mode?: FullscreenMode) => {
    const targetMode = mode || state.mode;

    activeElementRef.current = element;

    if (targetMode === "native" && isNativeSupported()) {
      enterNativeFullscreen(element);
    }

    lockScroll();

    setState({
      isFullscreen: true,
      targetId: id,
      mode: targetMode
    });
  }, [state.mode, isNativeSupported, enterNativeFullscreen, lockScroll]);

  /**
   * 退出全屏
   */
  const exitFullscreen = useCallback(() => {
    if (state.mode === "native") {
      exitNativeFullscreen();
    }

    unlockScroll();
    activeElementRef.current = null;

    setState({
      isFullscreen: false,
      targetId: undefined,
      mode: state.mode
    });
  }, [state.mode, exitNativeFullscreen, unlockScroll]);

  /**
   * 切换全屏
   */
  const toggleFullscreen = useCallback((id: string, element: HTMLElement, mode?: FullscreenMode) => {
    if (state.isFullscreen && state.targetId === id) {
      exitFullscreen();
    } else {
      enterFullscreen(id, element, mode);
    }
  }, [state.isFullscreen, state.targetId, enterFullscreen, exitFullscreen]);

  /**
   * 监听 ESC 键
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.isFullscreen && state.mode === "pseudo") {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isFullscreen, state.mode, exitFullscreen]);

  /**
   * 监听原生全屏变化
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInNativeFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isInNativeFullscreen && state.isFullscreen && state.mode === "native") {
        unlockScroll();
        setState(prev => ({
          ...prev,
          isFullscreen: false,
          targetId: undefined
        }));
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [state.isFullscreen, state.mode, unlockScroll]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      if (state.isFullscreen) {
        unlockScroll();
        if (state.mode === "native") {
          exitNativeFullscreen();
        }
      }
    };
  }, [state.isFullscreen, state.mode, unlockScroll, exitNativeFullscreen]);

  const contextValue: FullscreenContextValue = {
    ...state,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };

  return (
    <FullscreenContext.Provider value={contextValue}>
      {children}
    </FullscreenContext.Provider>
  );
}

/**
 * Hook 用于访问全屏上下文
 */
export function useFullscreenContext(): FullscreenContextValue {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error("useFullscreenContext must be used within a FullscreenProvider");
  }
  return context;
}
