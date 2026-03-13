/**
 * button.tsx - Button 组件
 * @package @vxture/design-system
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Common
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import type { ButtonVariant, ButtonSize } from "./button.types";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly asChild?: boolean;
}

const buttonVariants = ({
  variant,
  size,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
}) => {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-gray-900 text-gray-50 hover:bg-gray-900/90": variant === "default",
      "bg-red-500 text-gray-50 hover:bg-red-500/90": variant === "destructive",
      "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900":
        variant === "outline",
      "bg-gray-100 text-gray-900 hover:bg-gray-100/80": variant === "secondary",
      "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
      "text-gray-900 underline-offset-4 hover:underline": variant === "link",
    },
    {
      "h-10 px-4 py-2": size === "default",
      "h-9 rounded-md px-3": size === "sm",
      "h-11 rounded-md px-8": size === "lg",
      "h-10 w-10": size === "icon",
    },
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
