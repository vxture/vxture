/**
 * FullscreenToggle.tsx - 全屏切换组件
 * @package @vxture/design-system
 *
 * 功能：提供一个 UI 控件来切换全屏模式
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components
 */

import React, { useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { Icon } from "../../../icons/Icon";
import { FullscreenToggleProps } from "../../../types/fullscreen";
import { useFullscreenContext } from "./FullscreenProvider";
import { cn } from "../../../utils/cn";

export function FullscreenToggle({
  targetId,
  mode = "pseudo",
  className,
  children
}: FullscreenToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isFullscreen, targetId: activeId, toggleFullscreen } = useFullscreenContext();

  /**
   * 检查是否是当前全屏目标
   */
  const isActive = isFullscreen && activeId === targetId;

  /**
   * 切换全屏
   */
  const handleToggle = () => {
    const targetElement = document.querySelector(`[data-fullscreen-id="${targetId}"]`);
    if (targetElement instanceof HTMLElement) {
      toggleFullscreen(targetId, targetElement, mode);
    }
  };

  /**
   * 渲染默认图标
   */
  const renderDefaultIcon = () => {
    if (isActive) {
      return <Icon name="minimize" size="sm" />;
    }
    return <Icon name="maximize" size="sm" />;
  };

  /**
   * 获取默认文本
   */
  const getDefaultText = () => {
    if (isActive) {
      return "退出全屏";
    }
    return mode === "pseudo" ? "工作区全屏" : "显示器全屏";
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={getDefaultText()}
      className={cn(
        "transition-colors duration-200",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": isActive
        },
        className
      )}
    >
      {children || renderDefaultIcon()}
    </Button>
  );
}
