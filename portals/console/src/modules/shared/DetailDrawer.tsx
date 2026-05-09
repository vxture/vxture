'use client';

import type { ReactNode } from 'react';
import { Button } from '@vxture/design-system';
import { DetailPanel, type DetailField } from './DetailPanel';

export function DetailDrawer({
  title,
  description,
  fields,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  fields?: DetailField[];
  children?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="vx-overlay" onClick={onClose}>
      <aside
        className="vx-card vx-card__content vx-drawer-like"
        aria-label={`${title} details`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vx-drawer-like__header">
          <div />
          <Button variant="ghost" size="icon" aria-label="Close details" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </Button>
        </div>
        <DetailPanel title={title} description={description} fields={fields}>
          {children}
        </DetailPanel>
      </aside>
    </div>
  );
}
