"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export type ModelBadgeProps = {
  /** Model identifier — shown as primary text */
  modelId: string;
  /** Visual variant — flagship gets the aurora gradient treatment */
  variant?: "default" | "flagship";
  /** Runtime status of the model */
  status?: "active" | "idle" | "deploying" | "error";
  /** Optional click handler */
  onClick?: () => void;
  className?: string;
};

const STATUS_LABEL: Record<NonNullable<ModelBadgeProps["status"]>, string> = {
  active: "● ACTIVE",
  idle: "○ IDLE",
  deploying: "↗ DEPLOYING",
  error: "✕ ERROR",
};

/**
 * ModelBadge — model identity chip with status indicator.
 *
 * Use for AI model surfaces only: model selectors, deployment cards,
 * console headers. Don't use as a generic pill — use Badge instead.
 *
 * @example
 *   <ModelBadge modelId="claude-haiku-4-5" status="active" />
 *   <ModelBadge modelId="vxture-pro-2.0" variant="flagship" status="active" />
 */
export function ModelBadge({
  modelId,
  variant = "default",
  status = "active",
  onClick,
  className,
}: ModelBadgeProps) {
  return (
    <span
      className={cn(
        "vx-model-badge",
        `vx-model-badge--${variant}`,
        `vx-model-badge--${status}`,
        onClick && "vx-model-badge--interactive",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="vx-model-badge__dot" aria-hidden />
      <span className="vx-model-badge__id">{modelId}</span>
      <span className="vx-model-badge__status">{STATUS_LABEL[status]}</span>
    </span>
  );
}
