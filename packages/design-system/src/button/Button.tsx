'use client';
import { ComponentProps } from '../types/common';
import { Icon } from '../icons/Icon';
import type { IconName } from '../icons/icon.types';
import { colors } from '../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';

export interface ButtonProps extends ComponentProps {
  readonly variant?: ButtonVariant;
  readonly icon?: IconName;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

export const Button = ({
  variant = 'primary',
  icon,
  disabled,
  className = '',
  children,
  onClick,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${colors[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
};
