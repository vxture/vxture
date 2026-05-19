"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export type TokenCounterProps = {
  /** Tokens used so far */
  used: number;
  /** Total token budget */
  total: number;
  /** Optional label override */
  label?: string;
  /** Show absolute numbers vs percentage only */
  showNumbers?: boolean;
  className?: string;
};

/**
 * TokenCounter — usage progress bar.
 *
 * Fill color smoothly transitions across the spectrum:
 *   0-60%   success green
 *   60-85%  spark amber
 *   85-100% danger red
 *
 * Communicates urgency through color alone — no warning text needed.
 *
 * @example
 *   <TokenCounter used={6240} total={8000} />
 */
export function TokenCounter({
  used,
  total,
  label = "USAGE",
  showNumbers = true,
  className,
}: TokenCounterProps) {
  const pct = Math.min(100, Math.max(0, (used / total) * 100));
  const tone = pct >= 85 ? "danger" : pct >= 60 ? "warn" : "ok";

  return (
    <div
      className={cn("vx-token-counter", `vx-token-counter--${tone}`, className)}
    >
      <span className="vx-token-counter__label">{label}</span>
      <div
        className="vx-token-counter__track"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemax={total}
      >
        <div className="vx-token-counter__fill" style={{ width: `${pct}%` }} />
      </div>
      {showNumbers ? (
        <span className="vx-token-counter__stats">
          <span className="vx-token-counter__used">
            {used.toLocaleString()}
          </span>
          <span className="vx-token-counter__total">
            {" "}
            / {total.toLocaleString()} tokens
          </span>
        </span>
      ) : (
        <span className="vx-token-counter__stats">{pct.toFixed(0)}%</span>
      )}
    </div>
  );
}
