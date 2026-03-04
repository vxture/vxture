'use client';

import { iconMap } from './iconMap';
import type { IconProps, IconWeight } from './icon.types';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon = ({
  name,
  size = 'md',
  weight = 'regular',
  className = '',
  fallback = 'placeholder',
}: Omit<IconProps, 'name'> & { name: string }) => {
  // 使用 iconMap 作为唯一 truth source，实现双 fallback 逻辑
  const Component = iconMap[name as keyof typeof iconMap] ?? iconMap[fallback] ?? iconMap['placeholder'];

  const resolvedSize = typeof size === 'number' ? size : sizeMap[size] ?? 20;

  return (
    <Component
      weight={weight}
      size={resolvedSize}
      className={`inline-flex shrink-0 ${className}`}
      aria-hidden
    />
  );
};
