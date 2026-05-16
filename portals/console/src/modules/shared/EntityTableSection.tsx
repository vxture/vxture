import type { ReactNode } from 'react';
import { PageSection } from '@/layout';
import { EmptyState } from './EmptyState';
import { TableToolbar } from './TableToolbar';

export function EntityTableSection({
  title,
  description,
  toolbarTitle,
  toolbarHint,
  toolbarAction,
  filters,
  hasData = true,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: {
  title: string;
  description?: string;
  toolbarTitle?: string;
  toolbarHint?: string;
  toolbarAction?: ReactNode;
  filters?: ReactNode;
  hasData?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}) {
  const sectionProps = description ? { description } : {};
  const toolbarProps = {
    ...(toolbarHint ? { hint: toolbarHint } : {}),
    ...(toolbarAction ? { action: toolbarAction } : {}),
  };
  const emptyProps = {
    ...(emptyDescription ? { description: emptyDescription } : {}),
    ...(emptyAction ? { action: emptyAction } : {}),
  };

  return (
    <PageSection title={title} {...sectionProps}>
      <div className="vx-table-stack">
        {toolbarTitle || toolbarHint || toolbarAction ? (
          <TableToolbar title={toolbarTitle ?? ''} {...toolbarProps} />
        ) : null}
        {filters ? <div className="vx-entity-table-section__filters">{filters}</div> : null}
        {hasData ? (
          children
        ) : (
          <EmptyState title={emptyTitle ?? 'No items found.'} {...emptyProps} />
        )}
      </div>
    </PageSection>
  );
}
