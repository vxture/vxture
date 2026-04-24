import type { ComponentProps, ReactNode } from 'react';
import { Icon, type IconName } from '@vxture/design-system';
import { Button } from '@/components/ui/primitives';

type ActionButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  children: ReactNode;
  icon: IconName;
};

export function ActionButton({
  children,
  icon,
  size = 'sm',
  ...props
}: ActionButtonProps) {
  return (
    <Button size={size} {...props}>
      <Icon name={icon} size="xs" fallback="placeholder" className="vx-btn__icon" />
      <span>{children}</span>
    </Button>
  );
}
