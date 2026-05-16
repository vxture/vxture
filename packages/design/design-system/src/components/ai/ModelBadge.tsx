'use client';

/**
 * ModelBadge.tsx - AI 模型身份徽章
 * @package @vxture/design-system
 * @layer Presentation
 * @category Components - AI
 * @description
 *   用于模型选择、部署状态和 AI Header，不作为通用 Badge 的替代。
 *
 * @author AI-Generated
 * @date 2026-05-16
 */

import type { KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';

export type ModelBadgeStatus = 'active' | 'idle' | 'deploying' | 'error';

export interface ModelBadgeProps {
  readonly modelId: string;
  readonly variant?: 'default' | 'flagship';
  readonly status?: ModelBadgeStatus;
  readonly onClick?: () => void;
  readonly className?: string;
}

const STATUS_LABEL: Record<ModelBadgeStatus, string> = {
  active: 'ACTIVE',
  idle: 'IDLE',
  deploying: 'DEPLOYING',
  error: 'ERROR',
};

export function ModelBadge({
  modelId,
  variant = 'default',
  status = 'active',
  onClick,
  className,
}: ModelBadgeProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onClick();
  };

  return (
    <span
      className={cn(
        'vx-model-badge',
        `vx-model-badge--${variant}`,
        `vx-model-badge--${status}`,
        onClick ? 'vx-model-badge--interactive' : undefined,
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="vx-model-badge__dot" aria-hidden />
      <span className="vx-model-badge__id">{modelId}</span>
      <span className="vx-model-badge__status">{STATUS_LABEL[status]}</span>
    </span>
  );
}
