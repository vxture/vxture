import type { ReactNode } from 'react';
import { FilterBar } from '@vxture/design-system';

export function TableToolbar({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <FilterBar className="vx-table-toolbar" title={title} description={hint} actions={action} />
  );
}
