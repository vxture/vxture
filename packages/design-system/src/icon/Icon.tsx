'use client';
import { IconBaseProps } from 'react-icons';

import {
  TbUser,
  TbSettings,
  TbHome,
  TbBell,
  TbPlus,
  TbX,
  TbCheck,
  TbChevronRight,
  TbChevronLeft,
  TbSearch,
  TbEdit,
  TbTrash,
} from 'react-icons/tb';

export type IconName =
  | 'user'
  | 'settings'
  | 'home'
  | 'bell'
  | 'plus'
  | 'x'
  | 'check'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'edit'
  | 'trash';

export interface IconProps extends IconBaseProps {
  readonly name: IconName;
  readonly size?: number | string;
  readonly className?: string;
}

const ICON_MAP = {
  user: TbUser,
  settings: TbSettings,
  home: TbHome,
  bell: TbBell,
  plus: TbPlus,
  x: TbX,
  check: TbCheck,
  'chevron-right': TbChevronRight,
  'chevron-left': TbChevronLeft,
  search: TbSearch,
  edit: TbEdit,
  trash: TbTrash,
} as const;

export const Icon = ({ name, size = 20, className = '', ...props }: IconProps) => {
  const IconComp = ICON_MAP[name];
  if (!IconComp) return null;

  return <IconComp size={size} className={`inline-flex shrink-0 ${className}`} {...props} />;
};
