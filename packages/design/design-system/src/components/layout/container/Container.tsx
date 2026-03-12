/**
 * Container.tsx - 响应式内容容器组件
 * @package @vxture/design-system
 *
 * 功能：提供居中的响应式内容容器，用于页面布局
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components
 */

import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

export interface ContainerProps {
  /** 容器尺寸 */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** 额外的 CSS 类名 */
  className?: string;
  /** 子内容 */
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "lg", className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
