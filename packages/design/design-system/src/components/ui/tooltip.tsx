/**
 * tooltip.tsx - Tooltip 组件
 * @package @vxture/design-system
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Floating
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../utils/cn";

export interface TooltipProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
> {}

export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Trigger
> {}

export type TooltipContentVariant = "default" | "soft" | "inverse";

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  variant?: TooltipContentVariant;
}

export interface TooltipProviderProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Provider
> {}

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent({ className, sideOffset = 4, variant = "default", ...props }, ref) {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            "z-[1070] overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          variant === "soft"
            ? "border-blue-100/80 bg-white/95 text-slate-700 shadow-[0_8px_24px_rgba(30,64,175,0.10)] backdrop-blur-md"
            : variant === "inverse"
              ? "border-slate-400/25 bg-slate-950/95 text-slate-50 shadow-slate-950/20"
              : "border-gray-200 bg-white text-gray-950",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Portal>
    );
  },
);

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
