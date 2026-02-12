import { iconMap } from './iconMap';
import type { IconToken } from '@/shared/constants/icon.tokens';

type IconProps = {
  name: IconToken;
  size?: 'sm' | 'md' | 'lg';
  intent?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
};

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
};

const intentClassMap = {
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Icon({ name, size = 'md', intent = 'primary' }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;

  return <IconComponent size={sizeMap[size]} className={intentClassMap[intent]} aria-hidden />;
}
