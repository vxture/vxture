'use client';

import { iconMap } from './iconMap';
import { getIconName, isValidIconName } from './iconNameMapper';
import type { IconName } from './tokens';

type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

interface IconProps {
  readonly name: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  readonly weight?: IconWeight;
  readonly className?: string;
  readonly fallback?: IconName;
}

const sizeMap: Record<string, number> = {
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
  fallback = 'cube',
}: IconProps) => {
  // 标准化图标名称
  const normalizedName = getIconName(name);

  // 查找图标组件
  let Component = iconMap[normalizedName];

  // 如果找不到，使用 fallback
  if (!Component) {
    Component = iconMap[fallback];
    // 如果 fallback 也找不到，返回 null
    if (!Component) return null;
  }

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