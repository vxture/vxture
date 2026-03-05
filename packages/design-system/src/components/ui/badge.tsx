/**
 * badge.tsx - Badge 组件
 * @package @vxture/design-system
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Display
 */

import * as React from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariants = ({ variant }: { variant: BadgeVariant }) => {
  return cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
    {
      "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80":
        variant === "default",
      "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80":
        variant === "secondary",
      "border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80":
        variant === "destructive",
      "text-gray-950": variant === "outline",
    },
  );
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(function Badge(
  { className, variant = "default", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };
