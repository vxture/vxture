'use client';
import * as React from 'react';
import { cn } from '../../utils/cn';

export type SkeletonProps = {
  /** Visual variant */
  variant?: 'line' | 'rect' | 'circle';
  /** Width (number → px, string → as-is) */
  width?: number | string;
  /** Height (number → px, string → as-is) */
  height?: number | string;
  /** Convenience: render multiple lines stacked */
  lines?: number;
  className?: string;
};

/**
 * Skeleton — shimmer loading placeholder.
 *
 * @example
 *   <Skeleton variant="circle" width={40} height={40} />
 *   <Skeleton variant="line" lines={3} />
 *   <Skeleton variant="rect" width="100%" height={120} />
 */
export function Skeleton({
  variant = 'line',
  width,
  height,
  lines,
  className,
}: SkeletonProps) {
  const widthCss = typeof width === 'number' ? `${width}px` : width;
  const heightCss = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'line' && lines && lines > 1) {
    return (
      <div className={cn('vx-skeleton-group', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="vx-skeleton vx-skeleton--line"
            style={{
              width: widthCss ?? (i === lines - 1 ? '60%' : '100%'),
              height: heightCss ?? undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('vx-skeleton', `vx-skeleton--${variant}`, className)}
      style={{ width: widthCss, height: heightCss }}
      aria-hidden
    />
  );
}
